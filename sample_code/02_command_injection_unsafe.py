"""
Vulnerability Scenario 02: Command Injection
Demonstrates running system commands using shell=True without input sanitation.
"""

import subprocess


def ping_server_ip(host_address: str) -> str:
    # CRITICAL: Command injection vulnerability allowing arbitrary shell execution
    command = f"ping -c 1 {host_address}"
    output = subprocess.check_output(command, shell=True)
    return output.decode("utf-8")


def check_disk_usage(directory_path: str) -> str:
    # HIGH: Shell expansion vulnerability
    cmd = f"du -sh {directory_path}"
    return subprocess.getoutput(cmd)
