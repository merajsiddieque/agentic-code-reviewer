"""
State definition for the LangGraph Code Reviewer Agent.
"""

from typing import Any, TypedDict


class ReviewState(TypedDict, total=False):
    """
    Typed dictionary holding the state throughout the LangGraph code review pipeline.
    """
    code: str
    filename: str
    language: str
    ast_info: dict[str, Any]
    metrics: dict[str, Any]
    security: list[dict[str, Any]]
    review: str
    route: str
    created_at: str
    execution_time: float
    _start_perf_time: float
