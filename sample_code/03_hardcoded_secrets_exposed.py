"""
Vulnerability Scenario 03: Hardcoded Secrets and Credentials
Demonstrates exposing confidential API keys, passwords, and private tokens directly in source code.
"""

# CRITICAL: Exposed secrets in source code
DATABASE_PASSWORD = "SuperSecretDbPassword2026!"
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
JWT_SIGNING_KEY = "super-secret-jwt-signing-key-do-not-share"


def get_db_connection_string() -> str:
    return f"postgresql://postgres:{DATABASE_PASSWORD}@prod-db.internal:5432/main_db"
