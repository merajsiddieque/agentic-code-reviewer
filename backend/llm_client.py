"""
Centralized LLM client with exponential backoff retry and graceful rate-limit handling.
"""

import re
import time
from typing import Any

try:
    from langchain_google_genai.chat_models import GoogleRateLimitError
except ImportError:
    GoogleRateLimitError = Exception  # type: ignore

from .models import llm

RATE_LIMIT_FALLBACK_MESSAGE = """# Rate Limit Reached

Gemini API quota or rate limit has been temporarily reached.

Please wait about 30 to 60 seconds before submitting another code review request.
"""


def _extract_response_text(response: Any) -> str:
    """
    Safely extract plain text from LangChain message content.
    """
    content = getattr(response, "content", response)
    if isinstance(content, list):
        return "".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in content
        )
    return str(content)


def invoke_with_retry(
    messages: list[Any],
    max_retries: int = 3,
    initial_delay: float = 3.0,
    fallback_text: str | None = None,
) -> str:
    """
    Invoke the Gemini LLM with exponential backoff retry logic on transient/rate-limit errors.

    Args:
        messages: List of LangChain messages to send to the model.
        max_retries: Number of retry attempts.
        initial_delay: Initial sleep duration in seconds before first retry.
        fallback_text: Text to return if all retries are exhausted on rate limits.

    Returns:
        The generated text string or fallback message if rate limited.
    """
    delay = initial_delay
    fallback = fallback_text if fallback_text is not None else RATE_LIMIT_FALLBACK_MESSAGE

    for attempt in range(1, max_retries + 1):
        try:
            response = llm.invoke(messages)
            return _extract_response_text(response)
        except (GoogleRateLimitError, Exception) as e:
            err_str = str(e)
            is_rate_limit = (
                isinstance(e, GoogleRateLimitError)
                or "RESOURCE_EXHAUSTED" in err_str
                or "429" in err_str
                or "quota" in err_str.lower()
                or "rate" in err_str.lower()
            )

            if is_rate_limit:
                if attempt < max_retries:
                    # Dynamically parse recommended retry delay from API error message
                    match = re.search(r"retry in ([\d\.]+)s", err_str, re.IGNORECASE) or re.search(
                        r"retryDelay['\":\s]+'(\d+)s'", err_str
                    )
                    sleep_time = float(match.group(1)) + 2.0 if match else delay
                    print(
                        f"[LLM Client] Rate limit on attempt {attempt}/{max_retries}. Retrying in {sleep_time:.1f}s..."
                    )
                    time.sleep(sleep_time)
                    delay = max(delay * 1.5, 15.0)
                    continue
                else:
                    print(
                        f"[LLM Client] Rate limit retries exhausted ({max_retries}/{max_retries}). Returning fallback."
                    )
                    return fallback

            # If it's another non-rate-limit unexpected error on last attempt, re-raise
            if attempt == max_retries:
                raise e
            time.sleep(delay)
            delay *= 1.5

    return fallback
