from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import secrets
from datetime import datetime, timedelta, timezone
from app.core.event_bus import event_bus
from typing import Dict

router = APIRouter(prefix="/pairing", tags=["Pairing"])

# Temporary in-memory store for pairing tokens
# Format: { token: {"created_at": datetime, "desktop_id": str} }
active_tokens: Dict[str, dict] = {}

class GenerateTokenResponse(BaseModel):
    token: str
    expires_in: int

class VerifyTokenRequest(BaseModel):
    token: str
    device_name: str
    device_id: str
    platform: str
    version: str

@router.post("/generate", response_model=GenerateTokenResponse)
async def generate_pairing_token():
    token = secrets.token_urlsafe(32)
    active_tokens[token] = {
        "created_at": datetime.now(timezone.utc),
        "desktop_id": "desktop_primary"  # For single machine demo
    }
    return GenerateTokenResponse(token=token, expires_in=600)

@router.post("/verify")
async def verify_pairing_token(req: VerifyTokenRequest):
    if req.token not in active_tokens:
        raise HTTPException(status_code=400, detail="Invalid or expired pairing token")
    
    token_data = active_tokens[req.token]
    age = datetime.now(timezone.utc) - token_data["created_at"]
    
    if age > timedelta(minutes=10):
        del active_tokens[req.token]
        raise HTTPException(status_code=400, detail="Token expired")
    
    # Success! Device paired.
    del active_tokens[req.token]
    
    import json
    # Notify desktop that mobile has connected successfully
    await event_bus.publish("apex:events", json.dumps({
        "event": "DEVICE_PAIRED",
        "payload": {
            "device_name": req.device_name,
            "platform": req.platform,
            "status": "connected"
        }
    }))
    
    return {"status": "paired", "device_id": req.device_id}
