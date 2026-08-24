"""
LangGraph execution nodes for the Multi-Language Agentic Code Reviewer.
"""

import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from langchain_core.messages import HumanMessage, SystemMessage

if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from backend.llm_client import invoke_with_retry
    from backend.prompts import ROUTER_PROMPT, SYSTEM_PROMPT
    from backend.state import ReviewState
    from backend.tools import (
        code_metrics,
        detect_language,
        detect_security_risks,
        parse_ast,
    )
else:
    from .llm_client import invoke_with_retry
    from .prompts import ROUTER_PROMPT, SYSTEM_PROMPT
    from .state import ReviewState
    from .tools import (
        code_metrics,
        detect_language,
        detect_security_risks,
        parse_ast,
    )

# Reports directory
REPORTS_DIR = Path(__file__).parent / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def save_report_file(
    review_markdown: str,
    created_dt: datetime | None = None,
) -> Path:
    """
    Save the review Markdown report into backend/reports/ with format YYYYMMDD_HHMMSS_review.md.

    Args:
        review_markdown: Content of the generated review.
        created_dt: Datetime object for file timestamping.

    Returns:
        Path to the saved report file.
    """
    if created_dt is None:
        created_dt = datetime.now()

    timestamp_str = created_dt.strftime("%Y%m%d_%H%M%S")
    report_filename = f"{timestamp_str}_review.md"
    report_path = REPORTS_DIR / report_filename

    counter = 1
    while report_path.exists():
        report_filename = f"{timestamp_str}_{counter}_review.md"
        report_path = REPORTS_DIR / report_filename
        counter += 1

    report_path.write_text(review_markdown, encoding="utf-8")
    return report_path


def extract_score_from_review(
    review_markdown: str,
    metrics: dict[str, Any] | None = None,
) -> float:
    """
    Extract or calculate a numeric overall score (0-100) from the review markdown or metrics.

    Args:
        review_markdown: Generated review Markdown text.
        metrics: Code metrics dictionary.

    Returns:
        A numeric score between 0 and 100.
    """
    match = re.search(
        r"(?:Overall\s*Score|Score|Rating)[:\s*]+(\d+(?:\.\d+)?)\s*(?:/\s*(100|10))?",
        review_markdown,
        re.IGNORECASE,
    )
    if match:
        val = float(match.group(1))
        scale = float(match.group(2)) if match.group(2) else (100.0 if val > 10 else 10.0)
        if scale == 10.0:
            return round(val * 10.0, 1)
        return round(val, 1)

    if metrics:
        total_lines = metrics.get("total_lines", 1)
        comment_lines = metrics.get("comment_lines", 0)
        deduction = 0
        if total_lines > 10 and comment_lines == 0:
            deduction += 10
        return float(max(100 - deduction, 60))

    return 85.0


def build_review_messages(state: ReviewState) -> list[Any]:
    """
    Construct the system and human prompt messages from state analysis context.

    Args:
        state: Current LangGraph state dictionary.

    Returns:
        List of LangChain messages ready for LLM invocation or streaming.
    """
    code = state.get("code", "")
    filename = state.get("filename", "code.py")
    language = state.get("language") or detect_language(filename)
    route = state.get("route", "full")
    ast_info = state.get("ast_info", {})
    metrics = state.get("metrics", {})
    security = state.get("security", [])

    context: dict[str, Any] = {
        "filename": filename,
        "detected_language": language,
        "selected_route": route,
        "metrics": metrics if metrics else "Skipped for this route",
        "ast_analysis": (
            {
                "functions": ast_info.get("functions", []),
                "classes": ast_info.get("classes", []),
                "imports": ast_info.get("imports", []),
                "docstrings_found": list(ast_info.get("docstrings", {}).keys()),
            }
            if ast_info and language == "python"
            else ("Skipped for non-Python file" if language != "python" else "Skipped for this route")
        ),
        "security_findings": (
            security
            if security
            else ("No automated risks detected" if route in ("security", "full") else "Skipped for this route")
        ),
    }

    user_prompt = f"""Review the following {language.upper()} code based on the '{route}' pipeline route.

### Submitted Source Code ({filename}):
```{language}
{code}
```

### Static Analysis Context:
```json
{json.dumps(context, indent=2)}
```
"""

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_prompt),
    ]


def load_code_node(state: ReviewState) -> ReviewState:
    """
    Initializes and validates the incoming code review state, setting language, timestamps, and defaults.
    """
    now = datetime.now(timezone.utc)
    filename = state.get("filename", "code.py")
    lang = detect_language(filename)

    state.setdefault("code", "")
    state["filename"] = filename
    state["language"] = lang
    state.setdefault("ast_info", {})
    state.setdefault("metrics", {})
    state.setdefault("security", [])
    state.setdefault("review", "")
    state.setdefault("route", "full")
    state.setdefault("created_at", now.isoformat())
    state.setdefault("execution_time", 0.0)
    state["_start_perf_time"] = time.perf_counter()
    return state


def router_node(state: ReviewState) -> ReviewState:
    """
    Analyzes filename and snippet using heuristics and Gemini fallback to select the optimal
    pipeline route: 'security', 'structure', or 'full'.
    """
    filename = state.get("filename", "code.py").lower()
    code = state.get("code", "")
    
    # 1. Fast heuristic routing to conserve API quota
    sec_indicators = ["sec", "auth", "vuln", "inject", "token", "pass", "cred", "crypto", "eval", "pickle"]
    struct_indicators = ["struct", "oop", "model", "class", "schema", "type", "math", "util", "data"]
    
    if any(k in filename for k in sec_indicators):
        state["route"] = "security"
        return state
    if any(k in filename for k in struct_indicators) and not any(k in filename for k in sec_indicators):
        state["route"] = "structure"
        return state

    snippet = "\n".join(code.splitlines()[:40])
    prompt = f"""Filename: {filename}

Code Snippet (First 40 lines):
```
{snippet}
```
"""
    messages = [
        SystemMessage(content=ROUTER_PROMPT),
        HumanMessage(content=prompt),
    ]

    content = invoke_with_retry(
        messages=messages,
        max_retries=1,
        initial_delay=1.0,
        fallback_text="full",
    )

    normalized = content.strip().lower()
    if "security" in normalized:
        route = "security"
    elif "structure" in normalized:
        route = "structure"
    else:
        route = "full"

    state["route"] = route
    return state


def ast_node(state: ReviewState) -> ReviewState:
    """
    Executes AST parsing on Python code and populates state['ast_info'].
    Skips AST parsing for all other languages.
    """
    filename = state.get("filename", "")
    lang = state.get("language") or detect_language(filename)
    code = state.get("code", "")

    if lang == "python":
        state["ast_info"] = parse_ast(code)
    else:
        state["ast_info"] = {}
    return state


def metrics_node(state: ReviewState) -> ReviewState:
    """
    Calculates universal code metrics and populates state['metrics'].
    """
    code = state.get("code", "")
    filename = state.get("filename", "")
    lang = state.get("language") or detect_language(filename)
    state["metrics"] = code_metrics(code, filename=filename, language=lang)
    return state


def security_node(state: ReviewState) -> ReviewState:
    """
    Detects potential security vulnerabilities across languages and populates state['security'].
    """
    code = state.get("code", "")
    filename = state.get("filename", "")
    lang = state.get("language") or detect_language(filename)
    state["security"] = detect_security_risks(code, filename=filename, language=lang)
    return state


def review_node(state: ReviewState) -> ReviewState:
    """
    Compiles all AST, metric, and security findings with the original code,
    prompts Gemini with retry resilience, saves the final Markdown report,
    records execution time, and updates state['review'].
    """
    metrics = state.get("metrics", {})

    messages = build_review_messages(state)

    review_text = invoke_with_retry(
        messages=messages,
        max_retries=3,
        initial_delay=3.0,
    )
    state["review"] = review_text

    # Calculate execution time
    start_time = state.get("_start_perf_time", time.perf_counter())
    exec_duration = round(time.perf_counter() - start_time, 2)
    state["execution_time"] = exec_duration

    # Save Markdown report file
    created_dt = datetime.now()
    save_report_file(review_text, created_dt=created_dt)

    return state
