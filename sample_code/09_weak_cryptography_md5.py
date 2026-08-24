"""
Vulnerability Scenario 09: Broken/Weak Cryptography and Insecure Randomness
Demonstrates using collision-vulnerable MD5 for password verification and random module for security tokens.
"""

import hashlib
import random


def hash_user_password(raw_password: str) -> str:
    # HIGH: Insecure hashing algorithm (MD5 is prone to collision and rainbow table attacks)
    # Missing salt and key-stretching (e.g., bcrypt/argon2/pbkdf2)
    return hashlib.md5(raw_password.encode("utf-8")).hexdigest()


def generate_password_reset_token() -> str:
    # HIGH: random.randint is pseudo-random and predictable, not cryptographically secure
    # Should use secrets.token_urlsafe or secrets.token_hex
    token_num = random.randint(100000, 999999)
    return str(token_num)
