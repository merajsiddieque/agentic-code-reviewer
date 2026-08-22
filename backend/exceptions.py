"""
Custom domain exceptions and centralized FastAPI exception handlers.
"""

from typing import Any
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse


class CodeReviewException(Exception):
    """Base exception for domain-specific errors in Agentic Code Reviewer."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail: str = "An error occurred during code review."

    def __init__(self, detail: str | None = None, status_code: int | None = None) -> None:
        if detail is not None:
            self.detail = detail
        if status_code is not None:
            self.status_code = status_code
        super().__init__(self.detail)


class UnsupportedFileError(CodeReviewException):
    """Raised when an uploaded file is not among the supported file formats."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    detail: str = "Unsupported file type. Supported formats: .py, .js, .jsx, .ts, .tsx, .java, .html, .css, .md, .json, .yml, .yaml"


class NonPythonFileError(UnsupportedFileError):
    """Raised when an uploaded file is not supported (backward compatibility)."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    detail: str = "Unsupported file format. Please upload a supported code, markup, or config file."


class EmptyFileError(CodeReviewException):
    """Raised when an uploaded file or submitted code snippet is empty."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    detail: str = "The submitted code file is empty."


class InvalidFileError(CodeReviewException):
    """Raised when an uploaded file cannot be decoded or parsed."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    detail: str = "The submitted file is invalid or could not be decoded."


class QuotaExceededError(CodeReviewException):
    """Raised when Gemini LLM API quota or rate limit is reached."""

    status_code: int = status.HTTP_429_TOO_MANY_REQUESTS
    detail: str = "Gemini API rate limit or quota reached. Please wait a moment or check your API key quota."


def is_rate_limit_error(exc: Exception) -> bool:
    """Check if an exception is related to rate limiting or resource exhaustion."""
    err_str = str(exc).lower()
    return (
        "resource_exhausted" in err_str
        or "429" in err_str
        or "quota" in err_str
        or "rate limit" in err_str
    )


def register_exception_handlers(app: FastAPI) -> None:
    """
    Register centralized exception handlers to prevent stack trace leaks and guarantee standard JSON error formats.

    Args:
        app: The FastAPI application instance.
    """

    @app.exception_handler(CodeReviewException)
    async def code_review_exception_handler(request: Request, exc: CodeReviewException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        if is_rate_limit_error(exc):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Gemini API rate limit or quota reached. Please wait a moment or check your API key quota."
                },
            )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred while processing the request."},
        )

