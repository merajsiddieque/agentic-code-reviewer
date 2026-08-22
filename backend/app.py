"""
FastAPI application entry point for Agentic Code Reviewer.

Provides endpoints for code review and SSE streaming generation.
"""

from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from .agent import generate_review_stream, review_code_with_state
from .exceptions import (
    EmptyFileError,
    UnsupportedFileError,
    register_exception_handlers,
)
from .tools import decode_file, is_supported_file, validate_code

FRONTEND_DIST_DIR = Path(__file__).parent.parent / "frontend" / "dist"
ASSETS_DIR = FRONTEND_DIST_DIR / "assets"

app = FastAPI(
    title="Agentic Code Reviewer API",
    version="1.2.0",
    description="Multi-language AI code review using LangGraph, deterministic static analysis, and Gemini 3.6 Flash.",
)

# Register centralized error handlers
register_exception_handlers(app)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount frontend static assets if dist exists
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")


@app.get("/")
def serve_root() -> FileResponse:
    """
    Serve the React frontend application root.
    """
    index_file = FRONTEND_DIST_DIR / "index.html"
    return FileResponse(str(index_file))


@app.get("/health")
def health() -> dict[str, str]:
    """
    Dedicated health check endpoint.
    """
    return {
        "status": "healthy",
        "project": "Agentic Code Reviewer",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/review")
async def review(file: UploadFile = File(...)) -> dict[str, Any]:
    """
    Execute full agentic code review pipeline for an uploaded file across supported languages.

    Returns:
        JSON response with filename and the generated Markdown review report.
    """
    filename = file.filename or ""

    if not is_supported_file(filename):
        raise UnsupportedFileError()

    raw_bytes = await file.read()
    code = decode_file(raw_bytes)

    if not validate_code(code):
        raise EmptyFileError()

    state = review_code_with_state(code=code, filename=filename)
    report = state.get("review", "")

    return {
        "filename": filename,
        "review": report,
        "route": state.get("route"),
        "execution_time": state.get("execution_time"),
    }


@app.get("/review/stream")
async def review_stream_get(
    code: str = Query(..., description="Source code to review"),
    filename: str = Query("code.py", description="Name of the file"),
) -> StreamingResponse:
    """
    Stream review generation token-by-token using Server-Sent Events (SSE).

    LangGraph deterministic analysis runs first, then tokens from the final review node
    are streamed via EventSource-compatible SSE format.
    """
    if not is_supported_file(filename):
        raise UnsupportedFileError()

    if not validate_code(code):
        raise EmptyFileError()

    return StreamingResponse(
        generate_review_stream(code=code, filename=filename),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/review/stream")
async def review_stream_post(file: UploadFile = File(...)) -> StreamingResponse:
    """
    Stream review generation token-by-token for an uploaded file using Server-Sent Events (SSE).
    """
    filename = file.filename or "code.py"

    if not is_supported_file(filename):
        raise UnsupportedFileError()

    raw_bytes = await file.read()
    code = decode_file(raw_bytes)

    if not validate_code(code):
        raise EmptyFileError()

    return StreamingResponse(
        generate_review_stream(code=code, filename=filename),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/evaluation")
@app.get("/evaluation")
def get_evaluation(request: Request) -> Any:
    """
    Return the benchmark evaluation report. If requested via browser direct navigation (Accept: text/html),
    serves the React SPA. If requested via API / JSON, returns the evaluation JSON data.
    """
    accept = request.headers.get("accept", "")
    if "text/html" in accept and not request.url.path.startswith("/api/"):
        index_file = FRONTEND_DIST_DIR / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))

    eval_file = Path(__file__).parent.parent / "evaluation_report.json"
    if not eval_file.exists():
        eval_file = Path(__file__).parent / "evaluation_report.json"

    if eval_file.exists():
        try:
            import json

            return json.loads(eval_file.read_text(encoding="utf-8"))
        except Exception:
            pass

    return {
        "summary": {
            "total_samples": 0,
            "passed_samples": 0,
            "failed_samples": 0,
            "overall_precision": 0.0,
            "overall_recall": 0.0,
            "overall_f1": 0.0,
            "overall_exact_match_rate": 0.0,
        },
        "per_example_scores": [],
        "failed_cases": [],
    }


@app.get("/{full_path:path}")
def serve_spa(full_path: str) -> FileResponse:
    """
    Catch-all route to serve the React SPA and root-level static assets.
    Preserves all existing API endpoints registered prior to this handler.
    """
    file_path = FRONTEND_DIST_DIR / full_path
    if file_path.is_file():
        return FileResponse(str(file_path))

    index_file = FRONTEND_DIST_DIR / "index.html"
    return FileResponse(str(index_file))