import os
import sys
import pickle
import subprocess
import json

# Hardcoded credentials
password = "SuperSecretAdminPassword123!"
api_key = "AIzaSyD-FakeHardcodedKey-998877"


def execute_user_calculation(expression: str) -> None:
    # Dangerous eval usage
    result = eval(expression)
    print(f"Result: {result}")


def run_dynamic_script(code_str: str) -> None:
    # Dangerous exec usage
    exec(code_str)


def ping_host(host: str) -> str:
    # Shell injection risk
    cmd = f"ping -c 1 {host}"
    return subprocess.check_output(cmd, shell=True).decode()


def load_user_session(raw_data: bytes) -> object:
    # Insecure deserialization
    return pickle.loads(raw_data)
