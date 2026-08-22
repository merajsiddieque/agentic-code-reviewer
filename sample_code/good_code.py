"""
Module for computing basic descriptive statistics on numerical datasets.
"""

import math
from typing import Sequence


def calculate_mean(values: Sequence[float]) -> float:
    """
    Calculate the arithmetic mean of a sequence of numbers.

    Args:
        values: A sequence of numeric values.

    Returns:
        The arithmetic mean.

    Raises:
        ValueError: If the sequence is empty.
    """
    if not values:
        raise ValueError("Cannot calculate the mean of an empty sequence.")
    return sum(values) / len(values)


def calculate_std_dev(values: Sequence[float]) -> float:
    """
    Calculate the sample standard deviation of a sequence of numbers.

    Args:
        values: A sequence of numeric values.

    Returns:
        The sample standard deviation.

    Raises:
        ValueError: If fewer than 2 values are provided.
    """
    if len(values) < 2:
        raise ValueError("Standard deviation requires at least two data points.")

    mean = calculate_mean(values)
    variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
    return math.sqrt(variance)


def summarize_dataset(data: Sequence[float]) -> dict[str, float]:
    """
    Generate summary statistics for a dataset.

    Args:
        data: A sequence of numbers.

    Returns:
        A dictionary containing count, mean, min, max, and std_dev.
    """
    if not data:
        raise ValueError("Data cannot be empty.")

    return {
        "count": float(len(data)),
        "min": min(data),
        "max": max(data),
        "mean": calculate_mean(data),
        "std_dev": calculate_std_dev(data) if len(data) > 1 else 0.0,
    }
