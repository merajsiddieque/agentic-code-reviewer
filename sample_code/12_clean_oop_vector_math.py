"""
Clean Code Example 12: Immutable Geometric Vector Object-Oriented Design
Demonstrates frozen dataclass, type hints, dunder operators, and rigorous unit testability.
"""

from __future__ import annotations
from dataclasses import dataclass
import math


@dataclass(frozen=True, slots=True)
class Vector2D:
    """Represents an immutable 2D Cartesian coordinate vector."""

    x: float
    y: float

    def __add__(self, other: Vector2D) -> Vector2D:
        if not isinstance(other, Vector2D):
            return NotImplemented
        return Vector2D(self.x + other.x, self.y + other.y)

    def __sub__(self, other: Vector2D) -> Vector2D:
        if not isinstance(other, Vector2D):
            return NotImplemented
        return Vector2D(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float) -> Vector2D:
        if not isinstance(scalar, (int, float)):
            return NotImplemented
        return Vector2D(self.x * float(scalar), self.y * float(scalar))

    def magnitude(self) -> float:
        """Calculate Euclidean distance of the vector."""
        return math.hypot(self.x, self.y)

    def normalized(self) -> Vector2D:
        """Return a unit vector with length 1.0 pointing in the same direction.

        Raises:
            ZeroDivisionError: If the vector has zero magnitude.
        """
        mag = self.magnitude()
        if mag == 0.0:
            raise ZeroDivisionError("Cannot normalize a null vector (0, 0).")
        return Vector2D(self.x / mag, self.y / mag)

    def dot(self, other: Vector2D) -> float:
        """Calculate scalar dot product with another vector."""
        if not isinstance(other, Vector2D):
            raise TypeError(f"Expected Vector2D, got {type(other).__name__}")
        return self.x * other.x + self.y * other.y
