from datetime import datetime
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import json
import logging

from app.core.database import get_db
from app.core.websocket_manager import manager
from app.core.security import decode_token
from app.api.deps import get_current_user
from app.database.models import User, RawSignal, CognitiveState
from app.schemas.schemas import SignalIngest, CognitiveStateResponse
from app.services.groq_service import classify_cognitive_state

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cognitive", tags=["Cognitive Intelligence"])

@router.post("/signals", response_model=CognitiveStateResponse, status_code=status.HTTP_202_ACCEPTED)
async def ingest_signals(
    payload: SignalIngest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingests user telemetry signals via REST API.
    Performs real-time state classification via Groq LLM services.
    """
    # 1. Store Raw Signal in DB
    raw_signal = RawSignal(
        user_id=current_user.id,
        device_id=payload.device_source,
        timestamp=payload.timestamp,
        heart_rate=payload.heart_rate,
        hrv=payload.hrv,
        blink_rate=payload.blink_rate_per_min,
        screen_interaction=payload.screen_interaction_density,
        active_app=payload.active_application,
        ambient_db=payload.ambient_noise_db
    )
    db.add(raw_signal)

    # 2. Run Classification logic via Groq
    eval_payload = {
        "heart_rate": payload.heart_rate,
        "hrv": payload.hrv,
        "blink_rate": payload.blink_rate_per_min,
        "screen_interaction_density": payload.screen_interaction_density,
        "active_application": payload.active_application,
        "ambient_noise_db": payload.ambient_noise_db
    }
    
    classification = await classify_cognitive_state(eval_payload)
    state_label = classification.get("classified_state", "Flow")
    confidence = classification.get("confidence_score", 0.8)
    contributing = classification.get("contributing_metrics", [])

    # 3. Store Cognitive State in DB
    cog_state = CognitiveState(
        user_id=current_user.id,
        state=state_label,
        confidence=confidence,
        determined_at=datetime.utcnow()
    )
    db.add(cog_state)
    await db.commit()

    # 4. Notify active Client websockets about updated state
    await manager.send_system_event(
        user_id=current_user.id,
        event_name="COGNITIVE_STATE_DETERMINED",
        payload={
            "user_id": str(current_user.id),
            "state": state_label,
            "confidence_score": confidence,
            "contributing_metrics": contributing
        }
    )

    return CognitiveStateResponse(
        user_id=current_user.id,
        state=state_label,
        confidence_score=confidence,
        updated_at=cog_state.determined_at,
        contributing_signals={"metrics": contributing}
    )

@router.websocket("/stream")
async def websocket_stream(
    websocket: WebSocket,
    token: str = Query(..., description="JWT Bearer token to authorize connections")
):
    """
    Stateful bi-directional WebSocket interface.
    Ingests continuous telemetry from edge nodes and relays agent modifications.
    """
    # 1. Authorize connection
    user_id_str = decode_token(token)
    if not user_id_str:
        logger.warning("Rejected unauthorized WebSocket connection attempt.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Add connection to active registry
    await manager.connect(user_id, websocket)

    try:
        # Loop to consume client telemetry
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            # Expecting message format: {"event": "COGNITIVE_STATE_RAW", "payload": {...}}
            event = payload.get("event")
            event_payload = payload.get("payload", {})
            
            if event == "COGNITIVE_STATE_RAW":
                logger.info(f"Received real-time telemetry from user {user_id}")
                
                # Fetch DB session inside WS connection loop manually
                async for db in get_db():
                    # 1. Save telemetry signals
                    raw_signal = RawSignal(
                        user_id=user_id,
                        device_id=event_payload.get("device_source", "websocket"),
                        timestamp=datetime.utcnow(),
                        heart_rate=event_payload.get("heart_rate"),
                        hrv=event_payload.get("hrv"),
                        blink_rate=event_payload.get("blink_rate_per_min"),
                        screen_interaction=event_payload.get("screen_interaction_density"),
                        active_app=event_payload.get("active_application"),
                        ambient_db=event_payload.get("ambient_noise_db")
                    )
                    db.add(raw_signal)
                    
                    # 2. Request Groq classification
                    classification = await classify_cognitive_state({
                        "heart_rate": event_payload.get("heart_rate"),
                        "hrv": event_payload.get("hrv"),
                        "blink_rate": event_payload.get("blink_rate_per_min"),
                        "screen_interaction_density": event_payload.get("screen_interaction_density"),
                        "active_application": event_payload.get("active_application"),
                        "ambient_noise_db": event_payload.get("ambient_noise_db")
                    })
                    
                    state_label = classification.get("classified_state", "Flow")
                    confidence = classification.get("confidence_score", 0.8)
                    contributing = classification.get("contributing_metrics", [])
                    
                    # 3. Save calculated state
                    cog_state = CognitiveState(
                        user_id=user_id,
                        state=state_label,
                        confidence=confidence,
                        determined_at=datetime.utcnow()
                    )
                    db.add(cog_state)
                    await db.commit()
                    
                    # 4. Broadcast state results back to all registered clients of this user
                    await manager.send_system_event(
                        user_id=user_id,
                        event_name="COGNITIVE_STATE_DETERMINED",
                        payload={
                            "user_id": str(user_id),
                            "state": state_label,
                            "confidence_score": confidence,
                            "contributing_metrics": contributing
                        }
                    )
                    break # Break out of DB generator loop

    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
        logger.info(f"WebSocket session disconnected for user {user_id}")
    except Exception as e:
        logger.error(f"WebSocket routing error: {str(e)}")
        manager.disconnect(user_id, websocket)
