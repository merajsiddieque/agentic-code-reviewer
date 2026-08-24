"""
Clean Code Example 13: Secure Authentication Token and Password Handler
Demonstrates constant-time comparison, HMAC verification, cryptographic randomness, and strong hashing.
"""

import hashlib
import hmac
import os
import secrets
from typing import Optional


class SecurityAuthService:
    """Provides cryptographically secure authentication utilities."""

    def __init__(self, secret_key: Optional[bytes] = None) -> None:
        # Load from environment or generate a secure CSPRNG key
        self._secret_key: bytes = secret_key or os.environ.get(
            "AUTH_SECRET_KEY", secrets.token_bytes(32)
        )
        if isinstance(self._secret_key, str):
            self._secret_key = self._secret_key.encode("utf-8")

    def generate_secure_api_token(self, prefix: str = "tok_") -> str:
        """Generate a high-entropy URL-safe authentication token."""
        random_part = secrets.token_urlsafe(32)
        return f"{prefix}{random_part}"

    def hash_password_pbkdf2(self, password: str, salt: Optional[bytes] = None) -> tuple[str, str]:
        """Hash password using PBKDF2 with SHA-256 and 600,000 iterations."""
        if salt is None:
            salt = secrets.token_bytes(16)
        
        derived_key = hashlib.pbkdf2_hmac(
            hash_name="sha256",
            password=password.encode("utf-8"),
            salt=salt,
            iterations=600_000,
        )
        return derived_key.hex(), salt.hex()

    def verify_signature(self, payload: bytes, signature_hex: str) -> bool:
        """Verify HMAC-SHA256 signature using constant-time comparison to prevent timing attacks."""
        expected_sig = hmac.new(
            self._secret_key,
            msg=payload,
            digestmod=hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected_sig, signature_hex)
