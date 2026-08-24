"""
Defect Scenario 08: Mutable Default Arguments and Builtin Shadowing
Demonstrates common Python gotchas with persistent default state and variable shadowing.
"""

import math
import os
import sys


def append_user_activity(event_name: str, activities_list: list = []) -> list:
    # DEFECT: Mutable default argument preserves state across separate function calls
    activities_list.append(event_name)
    return activities_list


def create_user_map(data: dict, id: int, list: list = None) -> dict:
    # DEFECT: Shadowing Python built-in names 'id' and 'list'
    # DEFECT: Unused imports (math, os, sys)
    data[id] = list or []
    return data
