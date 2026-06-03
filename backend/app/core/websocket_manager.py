from fastapi import WebSocket
from typing import Dict, List
import json
import logging
from uuid import UUID
from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Manages stateful WebSocket connections for APEX edge devices.
    Connections are indexed by user_id to support cross-device communication.
    """
    def __init__(self):
        # Maps user_id (UUID) -> List of active WebSocket objects
        self.active_connections: Dict[UUID, List[WebSocket]] = {}

    async def connect(self, user_id: UUID, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected via WebSocket. Active connections: {len(self.active_connections[user_id])}")

        # Notify Redis event bus of new connection
        try:
            await redis_client.publish(
                "apex:events",
                json.dumps({
                    "event": "USER_CONNECTED",
                    "user_id": str(user_id)
                })
            )
        except Exception as e:
            logger.error(f"Failed to publish user connection event: {e}")

    def disconnect(self, user_id: UUID, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                logger.info(f"WebSocket disconnected for user {user_id}.")
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Sends a JSON message to a specific connection."""
        await websocket.send_json(message)

    async def broadcast_to_user(self, user_id: UUID, message: dict):
        """Broadcasts a JSON message to all active sessions/devices of a user."""
        if user_id in self.active_connections:
            dead_sockets = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to socket for user {user_id}: {e}")
                    dead_sockets.append(connection)
            
            # Clean up closed sockets
            for socket in dead_sockets:
                self.disconnect(user_id, socket)

    async def send_system_event(self, user_id: UUID, event_name: str, payload: dict):
        """Convenience method to dispatch formatted events to the client."""
        message = {
            "event": event_name,
            "payload": payload
        }
        await self.broadcast_to_user(user_id, message)

        # Mirror event to the central Redis event bus
        try:
            await redis_client.publish(
                f"apex:user:{user_id}",
                json.dumps(message)
            )
        except Exception as e:
            logger.warning(f"Unable to publish system event to Redis: {e}")

manager = ConnectionManager()
