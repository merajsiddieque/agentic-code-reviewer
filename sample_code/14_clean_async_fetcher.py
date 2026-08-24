"""
Clean Code Example 14: Asynchronous Task Runner with Concurrency Limiting
Demonstrates asyncio Semaphore, typed TaskGroup / gather, timeout handling, and graceful recovery.
"""

import asyncio
import logging
from typing import Any, Callable, Coroutine, Sequence

logger = logging.getLogger(__name__)


async def fetch_with_semaphore(
    semaphore: asyncio.Semaphore,
    worker_fn: Callable[[int], Coroutine[Any, Any, str]],
    item_id: int,
    timeout_seconds: float = 5.0,
) -> str:
    """Execute an async worker function under a concurrency semaphore with timeout."""
    async with semaphore:
        try:
            return await asyncio.wait_for(worker_fn(item_id), timeout=timeout_seconds)
        except asyncio.TimeoutError:
            logger.warning("Operation timed out for item #%d", item_id)
            return f"TIMEOUT: {item_id}"
        except Exception as exc:
            logger.error("Error processing item #%d: %s", item_id, exc)
            return f"ERROR: {exc}"


async def batch_fetch_items(
    item_ids: Sequence[int],
    worker_fn: Callable[[int], Coroutine[Any, Any, str]],
    max_concurrency: int = 5,
) -> list[str]:
    """Process a batch of work items with bounded concurrency."""
    sem = asyncio.Semaphore(max_concurrency)
    tasks = [
        asyncio.create_task(fetch_with_semaphore(sem, worker_fn, item_id))
        for item_id in item_ids
    ]
    return await asyncio.gather(*tasks)
