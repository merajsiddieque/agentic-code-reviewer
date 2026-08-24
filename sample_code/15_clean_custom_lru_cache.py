"""
Clean Code Example 15: Generic LRU Cache Data Structure
Demonstrates doubly linked list + hash map design, generic typing (TypeVar, Generic), and O(1) performance.
"""

from __future__ import annotations
from typing import Generic, Optional, TypeVar

K = TypeVar("K")
V = TypeVar("V")


class _Node(Generic[K, V]):
    """Internal doubly linked list node."""

    def __init__(self, key: K, value: V) -> None:
        self.key: K = key
        self.value: V = value
        self.prev: Optional[_Node[K, V]] = None
        self.next: Optional[_Node[K, V]] = None


class LRUCache(Generic[K, V]):
    """Least Recently Used (LRU) Cache supporting O(1) get and put operations."""

    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("Capacity must be a positive integer.")
        self._capacity: int = capacity
        self._map: dict[K, _Node[K, V]] = {}

        # Sentinel pseudo-nodes to simplify pointer operations
        self._head: _Node[K, V] = _Node(None, None)  # type: ignore
        self._tail: _Node[K, V] = _Node(None, None)  # type: ignore
        self._head.next = self._tail
        self._tail.prev = self._head

    def _remove(self, node: _Node[K, V]) -> None:
        if node.prev and node.next:
            node.prev.next = node.next
            node.next.prev = node.prev

    def _add_to_front(self, node: _Node[K, V]) -> None:
        node.next = self._head.next
        node.prev = self._head
        if self._head.next:
            self._head.next.prev = node
        self._head.next = node

    def get(self, key: K) -> Optional[V]:
        """Retrieve cached value for key and mark as most recently used."""
        if key not in self._map:
            return None
        node = self._map[key]
        self._remove(node)
        self._add_to_front(node)
        return node.value

    def put(self, key: K, value: V) -> None:
        """Insert or update key-value pair and evict least recently used node if at capacity."""
        if key in self._map:
            node = self._map[key]
            node.value = value
            self._remove(node)
            self._add_to_front(node)
            return

        if len(self._map) >= self._capacity:
            lru_node = self._tail.prev
            if lru_node and lru_node != self._head:
                self._remove(lru_node)
                del self._map[lru_node.key]

        new_node = _Node(key, value)
        self._add_to_front(new_node)
        self._map[key] = new_node

    def __len__(self) -> int:
        return len(self._map)
