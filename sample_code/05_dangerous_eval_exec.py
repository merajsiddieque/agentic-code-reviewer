"""
Vulnerability Scenario 05: Dangerous eval() and exec() Usage
Demonstrates executing arbitrary dynamically supplied user code strings.
"""


def calculate_dynamic_formula(user_formula_str: str) -> float:
    # CRITICAL: eval() executes arbitrary Python expressions from untrusted input
    result = eval(user_formula_str)
    return float(result)


def run_custom_plugin(plugin_code: str) -> None:
    # CRITICAL: exec() executes arbitrary statements in local scope
    exec(plugin_code)
