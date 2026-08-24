"""
Defect Scenario 07: Resource Leak and Bare Exception Catching
Demonstrates unclosed file handles without context managers and blanket except clauses.
"""


def parse_system_log(file_path: str) -> list[str]:
    # DEFECT: Resource leak - file is opened without a context manager ('with')
    # and not explicitly closed in finally block.
    f = open(file_path, "r", encoding="utf-8")
    lines = f.readlines()

    try:
        results = [line.strip() for line in lines if "ERROR" in line]
        return results
    except:
        # DEFECT: Bare except swallows all exceptions including KeyboardInterrupt and SystemExit
        return []
