"""
Defect Scenario 10: Unhandled ZeroDivisionError and List Out of Bounds
Demonstrates missing boundary guards on numeric operations and sequences.
"""


def compute_student_average(grades: list[float]) -> float:
    # DEFECT: ZeroDivisionError raised if grades list is empty
    return sum(grades) / len(grades)


def get_latest_item(items: list[str]) -> str:
    # DEFECT: IndexError raised if items list is empty
    return items[-1]
