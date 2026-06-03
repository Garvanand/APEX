import json
import logging
from typing import Any, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class UpstashRedisClient:
    """
    Asynchronous client for Upstash Redis using the HTTP REST API.
    Provides stateless, highly-reliable operations over HTTPS.
    """
    def __init__(self):
        self.url = settings.UPSTASH_REDIS_REST_URL
        self.token = settings.UPSTASH_REDIS_REST_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    async def execute(self, command: List[Any]) -> Any:
        """
        Executes a raw Redis command array against the Upstash REST endpoint.
        """
        if not self.url or not self.token:
            logger.warning("Upstash Redis credentials are not configured. Command skipped.")
            return None

        # Convert command elements to string where necessary for JSON safety
        payload = [str(x) if not isinstance(x, (int, float, str)) else x for x in command]

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    self.url,
                    json=payload,
                    headers=self.headers
                )
                response.raise_for_status()
                res_data = response.json()
                
                # Check for errors in the response
                if "error" in res_data:
                    logger.error(f"Redis command error: {res_data['error']}")
                    raise Exception(res_data["error"])
                
                return res_data.get("result")
            except httpx.HTTPStatusError as e:
                logger.error(f"Upstash REST API HTTP error: {e.response.text}")
                raise
            except Exception as e:
                logger.error(f"Upstash Redis execution failure: {str(e)}")
                raise

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """
        Set the string value of a key, with optional expiration (seconds).
        """
        cmd = ["SET", key, value]
        if ex is not None:
            cmd.extend(["EX", ex])
        result = await self.execute(cmd)
        return result == "OK"

    async def get(self, key: str) -> Optional[str]:
        """
        Get the value of a key.
        """
        return await self.execute(["GET", key])

    async def delete(self, key: str) -> int:
        """
        Delete a key. Returns the number of keys deleted (0 or 1).
        """
        result = await self.execute(["DEL", key])
        return int(result) if result is not None else 0

    async def rpush(self, key: str, value: str) -> int:
        """
        Insert the specified value at the tail of the list stored at key.
        """
        result = await self.execute(["RPUSH", key, value])
        return int(result) if result is not None else 0

    async def lpop(self, key: str) -> Optional[str]:
        """
        Removes and returns the first element of the list stored at key.
        """
        return await self.execute(["LPOP", key])

    async def publish(self, channel: str, message: str) -> int:
        """
        Post a message to a channel. Returns number of clients that received it.
        """
        result = await self.execute(["PUBLISH", channel, message])
        return int(result) if result is not None else 0

# Global single instance
redis_client = UpstashRedisClient()
