"""
Agentic Code Reviewer entry point orchestrating the LangGraph workflow and streaming pipeline.
"""

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Generator, cast

if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from backend.graph import review_graph
    from backend.models import llm
    from backend.nodes import (
        ast_node,
        build_review_messages,
        extract_score_from_review,
        load_code_node,
        metrics_node,
        router_node,
        save_report_file,
        security_node,
    )
    from backend.state import ReviewState
else:
    from .graph import review_graph
    from .models import llm
    from .nodes import (
        ast_node,
        build_review_messages,
        extract_score_from_review,
        load_code_node,
        metrics_node,
        router_node,
        save_report_file,
        security_node,
    )
    from .state import ReviewState


def review_code(code: str, filename: str = "code.py") -> str:
    """
    Execute the LangGraph code review pipeline and return the generated Markdown review.

    Args:
        code: Python source code string.
        filename: Name of the file being reviewed.

    Returns:
        Generated Markdown review report.
    """
    initial_state: ReviewState = {
        "code": code,
        "filename": filename,
        "ast_info": {},
        "metrics": {},
        "security": [],
        "review": "",
        "route": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "execution_time": 0.0,
    }

    final_state = review_graph.invoke(initial_state)
    return final_state.get("review", "")


def review_code_with_state(code: str, filename: str = "code.py") -> ReviewState:
    """
    Execute the LangGraph code review pipeline and return the full final state.

    Args:
        code: Python source code string.
        filename: Name of the file being reviewed.

    Returns:
        Full final state dictionary with review, execution_time, etc.
    """
    initial_state: ReviewState = {
        "code": code,
        "filename": filename,
        "ast_info": {},
        "metrics": {},
        "security": [],
        "review": "",
        "route": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "execution_time": 0.0,
    }

    return cast(ReviewState, review_graph.invoke(initial_state))


def prepare_streaming_pipeline(code: str, filename: str = "code.py") -> tuple[ReviewState, list[Any]]:
    """
    Executes LangGraph deterministic analysis nodes prior to the final LLM review node.

    Flow:
    1. load_code_node
    2. router_node
    3. Selected branch:
       - Non-Python: metrics_node -> security_node
       - Python: security_node / ast_node / (ast_node -> metrics_node -> security_node)
    4. Compiles prompt messages for the final review streaming.

    Args:
        code: Source code string.
        filename: Name of the file being reviewed.

    Returns:
        Tuple of (populated ReviewState, compiled LangChain prompt messages).
    """
    state: ReviewState = {
        "code": code,
        "filename": filename,
        "ast_info": {},
        "metrics": {},
        "security": [],
        "review": "",
        "route": "full",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "execution_time": 0.0,
    }

    # Execute deterministic nodes matching LangGraph StateGraph flow
    state = load_code_node(state)
    state = router_node(state)
    route = state.get("route", "full")
    lang = state.get("language", "python")

    if lang != "python":
        if route == "security":
            state = security_node(state)
        else:
            state = metrics_node(state)
            state = security_node(state)
    else:
        if route == "security":
            state = security_node(state)
        elif route == "structure":
            state = ast_node(state)
        else:  # full
            state = ast_node(state)
            state = metrics_node(state)
            state = security_node(state)

    messages = build_review_messages(state)
    return state, messages


def generate_review_stream(code: str, filename: str = "code.py") -> Generator[str, None, None]:
    """
    Generator function producing Server-Sent Events (SSE) for token-by-token streaming review.

    Executes LangGraph deterministic nodes first, streams tokens from the Gemini model,
    saves the final report file upon completion, and emits SSE data events.

    Args:
        code: Python source code string.
        filename: Name of the file being reviewed.

    Yields:
        Formatted SSE data strings (`data: {...}\\n\\n`).
    """
    start_perf = time.perf_counter()
    state, messages = prepare_streaming_pipeline(code=code, filename=filename)
    route = state.get("route", "full")

    # 1. Emit start event
    yield f"data: {json.dumps({'event': 'start', 'filename': filename, 'route': route})}\n\n"

    accumulated_tokens: list[str] = []
    try:
        for chunk in llm.stream(messages):
            content = getattr(chunk, "content", "")
            if isinstance(content, list):
                token_text = "".join(
                    part.get("text", "") if isinstance(part, dict) else str(part)
                    for part in content
                )
            else:
                token_text = str(content)

            if token_text:
                accumulated_tokens.append(token_text)
                yield f"data: {json.dumps({'event': 'token', 'token': token_text})}\n\n"
    except Exception:
        yield f"data: {json.dumps({'event': 'error', 'detail': 'Error during streaming review generation.'})}\n\n"
        return

    # Finalize review
    full_review_text = "".join(accumulated_tokens)
    exec_duration = round(time.perf_counter() - start_perf, 2)
    score = extract_score_from_review(full_review_text, state.get("metrics"))

    # Save Markdown report file
    created_dt = datetime.now()
    save_report_file(full_review_text, created_dt=created_dt)

    # Emit done event
    yield f"data: {json.dumps({'event': 'done', 'execution_time': exec_duration, 'overall_score': score, 'review': full_review_text})}\n\n"