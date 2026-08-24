"""
Clean Code Example 11: Idiomatic Data Processing Pipeline
Demonstrates comprehensive typing, docstrings, generator expressions, and explicit error validation.
"""

from typing import Iterable, Sequence


class EmptyDatasetError(ValueError):
    """Raised when an empty sequence is passed to a statistical computation."""


def calculate_moving_average(
    values: Sequence[float],
    window_size: int,
) -> list[float]:
    """Calculate simple moving average with sliding window validation.

    Args:
        values: Sequence of numeric data points.
        window_size: Positive integer size of the sliding window.

    Returns:
        List of moving averages of length (len(values) - window_size + 1).

    Raises:
        ValueError: If window_size is <= 0 or larger than values length.
        EmptyDatasetError: If values sequence is empty.
    """
    if not values:
        raise EmptyDatasetError("Cannot compute moving average on an empty dataset.")
    if window_size <= 0:
        raise ValueError(f"window_size must be positive, got {window_size}")
    if window_size > len(values):
        raise ValueError(
            f"window_size ({window_size}) cannot exceed data length ({len(values)})"
        )

    averages: list[float] = []
    current_window_sum = sum(values[:window_size])
    averages.append(current_window_sum / window_size)

    for i in range(window_size, len(values)):
        current_window_sum += values[i] - values[i - window_size]
        averages.append(current_window_sum / window_size)

    return averages


def filter_outliers(
    data: Iterable[float],
    threshold: float,
) -> list[float]:
    """Filter elements outside the symmetric threshold range.

    Args:
        data: Iterable stream of numbers.
        threshold: Absolute numeric upper bound for retention.

    Returns:
        List containing only elements where abs(x) <= threshold.
    """
    return [x for x in data if abs(x) <= threshold]
