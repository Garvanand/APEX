import asyncio
import logging
from typing import Callable, Dict, List

logger = logging.getLogger(__name__)

class InMemoryEventBus:
    """
    A lightweight, asynchronous in-memory event bus to replace Redis PubSub
    for single-machine local development and hackathon demos.
    """
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}

    async def publish(self, channel: str, message: str) -> int:
        """Publish a message to all subscribers of a channel."""
        if channel not in self.subscribers:
            return 0
            
        count = 0
        for callback in self.subscribers[channel]:
            try:
                # Fire and forget callback execution
                asyncio.create_task(callback(message))
                count += 1
            except Exception as e:
                logger.error(f"Error executing event bus callback for channel {channel}: {e}")
                
        return count

    def subscribe(self, channel: str, callback: Callable) -> None:
        """Subscribe to a channel with an async callback."""
        if channel not in self.subscribers:
            self.subscribers[channel] = []
        self.subscribers[channel].append(callback)

    def unsubscribe(self, channel: str, callback: Callable) -> None:
        """Unsubscribe from a channel."""
        if channel in self.subscribers:
            try:
                self.subscribers[channel].remove(callback)
            except ValueError:
                pass

event_bus = InMemoryEventBus()
