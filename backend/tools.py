"""
Deterministic static analysis, language detection, metrics, and security tools.
"""

import ast
import io
import re
import tokenize
from pathlib import Path
from typing import Any

# Supported file extensions
SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx",
    ".java", ".html", ".css",
    ".md", ".json", ".yml", ".yaml"
}


def is_python_file(filename: str) -> bool:
    """
    Check whether the file is a Python (.py) file (backward compatibility).
    """
    return Path(filename).suffix.lower() == ".py"


def is_supported_file(filename: str) -> bool:
    """
    Check whether the uploaded file is supported by the multi-language reviewer.
    """
    if not filename:
        return False
    lower_name = filename.lower()
    if lower_name in ("readme", "readme.md") or lower_name.startswith("readme."):
        return True
    ext = Path(filename).suffix.lower()
    return ext in SUPPORTED_EXTENSIONS


def detect_language(filename: str) -> str:
    """
    Detect programming or markup language from file extension without using an LLM.

    Returns one of:
        python, javascript, react, typescript, java, html, css, markdown, json, yaml
    """
    if not filename:
        return "python"
    
    lower_name = filename.lower()
    if lower_name in ("readme", "readme.md") or lower_name.startswith("readme."):
        return "markdown"
    
    ext = Path(filename).suffix.lower()
    mapping = {
        ".py": "python",
        ".js": "javascript",
        ".jsx": "react",
        ".ts": "typescript",
        ".tsx": "react",
        ".java": "java",
        ".html": "html",
        ".htm": "html",
        ".css": "css",
        ".md": "markdown",
        ".json": "json",
        ".yml": "yaml",
        ".yaml": "yaml",
    }
    return mapping.get(ext, "python")


def decode_file(file_bytes: bytes) -> str:
    """
    Convert uploaded file bytes into UTF-8 text.
    """
    return file_bytes.decode("utf-8", errors="replace")


def validate_code(code: str) -> bool:
    """
    Return True if the code is not empty.
    """
    return bool(code.strip())


def parse_ast(code: str) -> dict[str, Any]:
    """
    Parse Python code into an AST and extract functions, classes, imports, and docstrings.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {
            "syntax_error": f"Line {e.lineno}: {e.msg}",
            "functions": [],
            "classes": [],
            "imports": [],
            "docstrings": {},
        }

    functions: list[dict[str, Any]] = []
    classes: list[dict[str, Any]] = []
    imports: list[str] = []
    docstrings: dict[str, Any] = {}

    module_doc = ast.get_docstring(tree)
    if module_doc:
        docstrings["module"] = module_doc

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            func_doc = ast.get_docstring(node)
            func_info = {
                "name": node.name,
                "line": node.lineno,
                "is_async": isinstance(node, ast.AsyncFunctionDef),
                "args": [arg.arg for arg in node.args.args],
                "has_docstring": bool(func_doc),
            }
            functions.append(func_info)
            if func_doc:
                docstrings[f"function:{node.name}"] = func_doc

        elif isinstance(node, ast.ClassDef):
            class_doc = ast.get_docstring(node)
            class_info = {
                "name": node.name,
                "line": node.lineno,
                "bases": [
                    getattr(base, "id", getattr(base, "attr", "unknown"))
                    for base in node.bases
                ],
                "has_docstring": bool(class_doc),
            }
            classes.append(class_info)
            if class_doc:
                docstrings[f"class:{node.name}"] = class_doc

        elif isinstance(node, ast.Import):
            for alias in node.names:
                import_name = alias.name + (f" as {alias.asname}" if alias.asname else "")
                imports.append(import_name)

        elif isinstance(node, ast.ImportFrom):
            module_name = node.module or ""
            for alias in node.names:
                imported = f"from {module_name} import {alias.name}" + (
                    f" as {alias.asname}" if alias.asname else ""
                )
                imports.append(imported)

    return {
        "functions": functions,
        "classes": classes,
        "imports": imports,
        "docstrings": docstrings,
    }


def code_metrics(code: str, filename: str = "", language: str = "") -> dict[str, Any]:
    """
    Calculate universal metrics for any supported code or markup file:
    - language
    - total_lines
    - code_lines
    - blank_lines
    - comment_lines
    - file_size_bytes

    Also preserves Python-specific metrics (number_of_functions, number_of_classes, comment_count).
    """
    lang = language or (detect_language(filename) if filename else "python")
    lines = code.splitlines()
    total_lines = len(lines)
    file_size_bytes = len(code.encode("utf-8"))

    blank_lines = 0
    comment_lines = 0
    code_lines = 0

    in_multiline_comment = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            blank_lines += 1
            continue

        if lang in ("python", "yaml"):
            if stripped.startswith("#"):
                comment_lines += 1
            else:
                code_lines += 1

        elif lang in ("javascript", "typescript", "react", "java", "css"):
            if in_multiline_comment:
                comment_lines += 1
                if "*/" in stripped:
                    in_multiline_comment = False
            elif stripped.startswith("/*"):
                comment_lines += 1
                if "*/" not in stripped:
                    in_multiline_comment = True
            elif stripped.startswith("//") or stripped.startswith("*"):
                comment_lines += 1
            else:
                code_lines += 1

        elif lang == "html":
            if in_multiline_comment:
                comment_lines += 1
                if "-->" in stripped:
                    in_multiline_comment = False
            elif stripped.startswith("<!--"):
                comment_lines += 1
                if "-->" not in stripped:
                    in_multiline_comment = True
            else:
                code_lines += 1

        else:  # markdown, json, etc.
            if stripped.startswith("# ") or stripped.startswith("## ") or stripped.startswith("### "):
                code_lines += 1
            elif stripped.startswith("<!--"):
                comment_lines += 1
            else:
                code_lines += 1

    num_functions = 0
    num_classes = 0

    if lang == "python":
        # Python specific AST metrics
        try:
            tree = ast.parse(code)
            num_functions = sum(
                1 for node in ast.walk(tree)
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
            )
            num_classes = sum(
                1 for node in ast.walk(tree)
                if isinstance(node, ast.ClassDef)
            )
        except SyntaxError:
            pass

    return {
        "language": lang,
        "total_lines": total_lines,
        "code_lines": code_lines,
        "blank_lines": blank_lines,
        "comment_lines": comment_lines,
        "file_size_bytes": file_size_bytes,
        "number_of_functions": num_functions,
        "number_of_classes": num_classes,
        "comment_count": comment_lines,
    }


def detect_security_risks(code: str, filename: str = "", language: str = "") -> list[dict[str, Any]]:
    """
    Detect pattern-based security risks across multiple languages:
    - Python: eval(), exec(), pickle.loads, subprocess shell=True, hardcoded secrets
    - JavaScript: eval(), innerHTML, document.write
    - React: dangerouslySetInnerHTML
    - Java: Runtime.getRuntime().exec
    - JSON / YAML: api_key, password, secret, token
    """
    lang = language or (detect_language(filename) if filename else "python")
    risks: list[dict[str, Any]] = []
    lines = code.splitlines()

    secret_pattern = re.compile(
        r"""(?i)(?:api[_-]?key|password|passwd|secret[_-]?key|token|auth[_-]?token|client[_-]?secret)\s*[:=]\s*["']([^"'\s]{4,})["']"""
    )

    # 1. Python Specific AST Analysis
    if lang == "python":
        try:
            tree = ast.parse(code)
            py_secret_var = re.compile(
                r"^(password|passwd|secret|api_key|token|auth_token|secret_key|private_key)$",
                re.IGNORECASE,
            )
            for node in ast.walk(tree):
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "eval":
                    risks.append({
                        "type": "Dangerous Function",
                        "severity": "High",
                        "line": node.lineno,
                        "issue": "Use of eval() detected. Dynamic code execution can lead to Remote Code Execution (RCE).",
                        "recommendation": "Use safer alternatives like ast.literal_eval() or specific parsing logic.",
                    })
                elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "exec":
                    risks.append({
                        "type": "Dangerous Function",
                        "severity": "High",
                        "line": node.lineno,
                        "issue": "Use of exec() detected. Dynamic code execution is unsafe with untrusted inputs.",
                        "recommendation": "Refactor logic to eliminate dynamic code execution.",
                    })
                elif isinstance(node, ast.Call):
                    is_pickle = False
                    if isinstance(node.func, ast.Attribute) and node.func.attr in ("loads", "load"):
                        if isinstance(node.func.value, ast.Name) and node.func.value.id == "pickle":
                            is_pickle = True
                    elif isinstance(node.func, ast.Name) and node.func.id in ("pickle_loads", "pickle_load"):
                        is_pickle = True
                    if is_pickle:
                        risks.append({
                            "type": "Insecure Deserialization",
                            "severity": "High",
                            "line": node.lineno,
                            "issue": "Use of pickle.load/pickle.loads detected. Unpickling untrusted data allows arbitrary code execution.",
                            "recommendation": "Use secure serialization formats like JSON, MessagePack, or Protocol Buffers.",
                        })

                if isinstance(node, ast.Call):
                    for kw in node.keywords:
                        if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                            risks.append({
                                "type": "Command Injection Risk",
                                "severity": "High",
                                "line": node.lineno,
                                "issue": "Subprocess execution with shell=True detected. Vulnerable to shell injection attacks.",
                                "recommendation": "Pass command arguments as a list and set shell=False.",
                            })

                if isinstance(node, ast.Assign):
                    for target in node.targets:
                        target_name = target.id if isinstance(target, ast.Name) else ""
                        if target_name and py_secret_var.search(target_name):
                            if isinstance(node.value, ast.Constant) and isinstance(node.value.value, str) and node.value.value.strip():
                                risks.append({
                                    "type": "Hardcoded Secret",
                                    "severity": "High",
                                    "line": node.lineno,
                                    "issue": f"Hardcoded credential/secret assigned to variable '{target_name}'.",
                                    "recommendation": "Store sensitive credentials in environment variables or a secrets manager.",
                                })
        except SyntaxError:
            pass

    # 2. Line-by-line Pattern Analysis across languages
    for idx, line in enumerate(lines, start=1):
        # JavaScript & TypeScript
        if lang in ("javascript", "typescript"):
            if "eval(" in line:
                risks.append({
                    "type": "Dangerous Function",
                    "severity": "High",
                    "line": idx,
                    "issue": "Use of eval() detected. Dynamic evaluation in JavaScript can cause arbitrary script injection.",
                    "recommendation": "Avoid eval(); use JSON.parse() or dedicated parser libraries.",
                })
            if "innerHTML" in line:
                risks.append({
                    "type": "Cross-Site Scripting (XSS)",
                    "severity": "High",
                    "line": idx,
                    "issue": "Direct assignment to innerHTML detected. Can lead to DOM-based XSS if user input is unescaped.",
                    "recommendation": "Use textContent or a sanitized HTML parser (e.g. DOMPurify).",
                })
            if "document.write" in line:
                risks.append({
                    "type": "DOM Injection",
                    "severity": "Medium",
                    "line": idx,
                    "issue": "Use of document.write detected. Unsafe and harms page performance/security.",
                    "recommendation": "Use modern DOM manipulation APIs like createElement or appendChild.",
                })

        # React (JSX & TSX)
        if lang == "react":
            if "dangerouslySetInnerHTML" in line:
                risks.append({
                    "type": "Cross-Site Scripting (XSS)",
                    "severity": "High",
                    "line": idx,
                    "issue": "Use of dangerouslySetInnerHTML detected. Directly injects raw HTML into the React virtual DOM.",
                    "recommendation": "Sanitize inputs with DOMPurify or use standard JSX element rendering.",
                })
            if "eval(" in line:
                risks.append({
                    "type": "Dangerous Function",
                    "severity": "High",
                    "line": idx,
                    "issue": "eval() call detected in React component.",
                    "recommendation": "Remove dynamic evaluation logic.",
                })

        # Java
        if lang == "java":
            if "Runtime.getRuntime().exec" in line:
                risks.append({
                    "type": "Command Injection",
                    "severity": "High",
                    "line": idx,
                    "issue": "Use of Runtime.getRuntime().exec() detected. Vulnerable to command injection if arguments contain user input.",
                    "recommendation": "Use ProcessBuilder with parameterized arguments and strictly validate inputs.",
                })

        # JSON & YAML credentials detection
        if lang in ("json", "yaml"):
            for keyword in ("api_key", "password", "passwd", "secret", "token", "private_key"):
                if re.search(rf"""["']?{keyword}["']?\s*[:=]\s*["'][^"']+["']""", line, re.IGNORECASE):
                    risks.append({
                        "type": "Exposed Secret / Credential",
                        "severity": "High",
                        "line": idx,
                        "issue": f"Exposed sensitive key/credential '{keyword}' in configuration file.",
                        "recommendation": "Use environment variable placeholders or a secret management vault.",
                    })
                    break

        # Generic secret detection across any file type
        if lang not in ("python", "json", "yaml"):
            match = secret_pattern.search(line)
            if match:
                risks.append({
                    "type": "Hardcoded Secret",
                    "severity": "High",
                    "line": idx,
                    "issue": "Detected potential hardcoded secret or token assignment.",
                    "recommendation": "Store credentials in environment variables or a secrets manager.",
                })

    return risks


def find_unused_imports(code: str) -> list[str]:
    """
    Find unused imports in the Python code using AST analysis (Python only).
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return []

    imported_names: list[tuple[str, int]] = []

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                bound_name = alias.asname if alias.asname else alias.name.split(".")[0]
                imported_names.append((bound_name, node.lineno))
        elif isinstance(node, ast.ImportFrom):
            for alias in node.names:
                if alias.name == "*":
                    continue
                bound_name = alias.asname if alias.asname else alias.name
                imported_names.append((bound_name, node.lineno))

    used_names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
            used_names.add(node.id)
        elif isinstance(node, ast.Attribute) and isinstance(node.value, ast.Name):
            used_names.add(node.value.id)

    unused: list[str] = []
    for name, lineno in imported_names:
        if name not in used_names:
            unused.append(f"{name} (line {lineno})")

    return unused