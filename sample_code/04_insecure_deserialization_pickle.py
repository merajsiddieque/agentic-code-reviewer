"""
Vulnerability Scenario 04: Insecure Deserialization
Demonstrates loading untrusted serialized payloads via Python pickle module.
"""

import pickle
import base64


def load_user_session_token(encoded_token: str) -> dict:
    # CRITICAL: Insecure deserialization with pickle allows arbitrary Remote Code Execution (RCE)
    raw_payload = base64.b64decode(encoded_token)
    session_data = pickle.loads(raw_payload)
    return session_data


def restore_cached_state(file_path: str) -> object:
    # HIGH: Loading arbitrary pickle files from unauthenticated storage
    with open(file_path, "rb") as f:
        return pickle.load(f)
