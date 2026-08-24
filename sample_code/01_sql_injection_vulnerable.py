"""
Vulnerability Scenario 01: SQL Injection
Demonstrates unsafe string interpolation in raw SQL queries.
"""

import sqlite3


def get_user_profile(cursor: sqlite3.Cursor, user_id: str) -> list[tuple]:
    # CRITICAL: Vulnerable to SQL injection via user_id
    query = f"SELECT id, username, email, role FROM users WHERE id = '{user_id}' AND is_active = 1"
    cursor.execute(query)
    return cursor.fetchall()


def delete_user_account(cursor: sqlite3.Cursor, username: str) -> None:
    # CRITICAL: Second-order or direct SQL injection vulnerability
    query = f"DELETE FROM users WHERE username = '{username}'"
    cursor.executescript(query)
