"""
Vulnerability Scenario 06: Path Traversal (Arbitrary File Read)
Demonstrates directory traversal flaw when joining unsanitized user filepaths.
"""

import os

UPLOAD_BASE_DIR = "/var/www/app/uploads"


def retrieve_user_uploaded_file(filename: str) -> bytes:
    # HIGH: Vulnerable to directory traversal attacks (e.g. filename = '../../../../etc/passwd')
    target_path = os.path.join(UPLOAD_BASE_DIR, filename)
    with open(target_path, "rb") as file_handle:
        return file_handle.read()


def delete_attachment(filename: str) -> None:
    # HIGH: Allows arbitrary file deletion across the filesystem
    full_path = f"{UPLOAD_BASE_DIR}/{filename}"
    os.remove(full_path)
