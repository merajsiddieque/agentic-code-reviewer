# 🚀 Agentic Code Reviewer

> **An AI-powered multi-language code review platform built with LangGraph, FastAPI, React, Docker, Render, and Google Gemini 3.6 Flash.**

Agentic Code Reviewer combines deterministic static analysis (AST parsing, security heuristics, code metrics) with LLM reasoning to generate **security audits, bug detection, best-practice recommendations, and secure refactored implementations** in a single workflow.

---

## ✨ Features

### 🤖 AI Code Review Dashboard

* Upload source code in multiple languages
* LangGraph multi-agent orchestration
* Automatic pipeline routing (Security / Structure / Full Review)
* Executive summary with AI reasoning
* Severity-based vulnerability analysis
* Performance & readability recommendations
* **Secure refactored implementation** generated automatically
* Download complete review as Markdown

### 🛡️ Static Analysis Engine

* Python AST parsing
* Code metrics extraction
* Security vulnerability detection
* Cyclomatic complexity analysis
* Best-practice validation
* Language-aware review pipeline

### 📊 Developer Evaluation Harness

A hidden developer-only dashboard available at:

`/evaluation`

It evaluates the AI reviewer against a labeled benchmark dataset using:

* Precision
* Recall
* F1 Score
* Exact Match Rate
* Benchmark discrepancy analysis

> This page is intended for developers and recruiters to evaluate the quality of the AI agent—not end users.

---

## 🖥️ User Dashboard

The main application provides a complete AI security review workflow.

### Security Overview

* Security Score (0–10)
* Issues Found
* Lines of Code
* Review Time
* LangGraph execution route

### LangGraph Pipeline

```text
Upload
   ↓
Router
   ↓
AST Analysis
   ↓
Code Metrics
   ↓
Security Scan
   ↓
Gemini 3.6 Flash
   ↓
Structured Markdown Report
```

### Generated Review Includes

* Executive Summary
* Code Metrics
* Security Issues
* Bugs & Logical Flaws
* Readability & Style
* Performance Analysis
* Best Practices
* **Secure Refactored Implementation**
* Overall Code Quality Score

---

## 🌐 Supported Languages

| Language    | Status |
| ----------- | ------ |
| Python      | ✅      |
| JavaScript  | ✅      |
| TypeScript  | ✅      |
| React / JSX | ✅      |
| Java        | ✅      |
| HTML / CSS  | ✅      |
| Markdown    | ✅      |
| JSON / YAML | ✅      |

---

## 🏗️ Tech Stack

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Frontend         | React + Tailwind CSS + Vite  |
| Backend          | FastAPI                      |
| AI Orchestration | LangGraph                    |
| LLM              | Google Gemini 3.6 Flash      |
| Static Analysis  | Python AST + Bandit + Flake8 |
| Deployment       | Docker + Render              |
| Documentation    | Swagger / OpenAPI            |

---

## 📁 Project Structure

```text
agentic-code-reviewer/
├── backend/
│   ├── app.py
│   ├── agent.py
│   ├── graph.py
│   ├── nodes.py
│   ├── tools.py
│   ├── prompts.py
│   ├── state.py
│   ├── llm_client.py
│   ├── evaluation/
│   └── .env.example
│
├── frontend/
│   ├── src/components/
│   ├── src/pages/
│   └── src/services/
│
├── sample_code/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔐 Environment Variables

> **Never commit your `.env` file or API keys to GitHub.**

Create the environment file:

```bash
cp backend/.env.example backend/.env
```

Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Add your Gemini API key:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

---

## ⚡ Local Development

### Run with Docker

```bash
docker compose up --build
```

Open:

```text
http://localhost:8000
```

### Run without Docker

**Backend**

```bash
uv sync
uv run uvicorn backend.app:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deploy on Render

This project is containerized and deployed as a **Docker Web Service** on Render.

### 1. Fork or Clone the Repository

```bash
git clone https://github.com/merajsiddieque/agentic-code-reviewer.git
```

### 2. Create a New Web Service

* **Runtime:** Docker
* **Branch:** `main`
* **Root Directory:** *(leave empty)*
* **Instance:** Free (or Starter)

### 3. Add Environment Variable

| Key              | Value               |
| ---------------- | ------------------- |
| `GOOGLE_API_KEY` | Your Gemini API Key |

### 4. Deploy

Render automatically builds the Docker image and exposes the application over HTTPS.

---

## 🔍 API Endpoints

| Method | Endpoint         | Description                    |
| ------ | ---------------- | ------------------------------ |
| GET    | `/`              | React Frontend                 |
| POST   | `/review`        | AI Code Review                 |
| GET    | `/review/stream` | SSE Streaming Review           |
| GET    | `/health`        | Health Check                   |
| GET    | `/docs`          | Swagger Documentation          |
| GET    | `/openapi.json`  | OpenAPI Schema                 |
| GET    | `/evaluation`    | Developer Evaluation Dashboard |

---

## 📈 Evaluation Harness

The project includes a dedicated **Evaluation Harness** for measuring AI review quality.

### Metrics

* Precision
* Recall
* F1 Score
* Exact Match Rate

### Benchmark Dataset

The benchmark suite contains labeled programs covering:

* SQL Injection
* Command Injection
* Hardcoded Secrets
* Insecure Deserialization
* Path Traversal
* Weak Cryptography
* Mutable Defaults
* Resource Leaks
* Zero Division
* Clean OOP Implementations

The LangGraph agent reviews each benchmark and compares its findings against the expected ground truth to produce objective evaluation metrics.

---

## 🚀 Future Roadmap

### GitHub Repository Analysis

Paste a public GitHub repository URL and automatically:

* Clone the repository
* Detect project language
* Analyze every supported source file
* Identify vulnerable files
* Rank files by security score
* Generate repository-wide AI review
* Export a complete Markdown audit report

### Additional Planned Features

* Pull Request review generation
* Dependency vulnerability scanning
* Multi-file contextual analysis
* Interactive code diff suggestions
* CVSS-based security scoring
* Team analytics dashboard

---

## 👨‍💻 Author

**Meraj Alam Siddique**

AI Engineer • LangGraph • FastAPI • React • GenAI

* **GitHub:** https://github.com/merajsiddieque
* **LinkedIn:** https://www.linkedin.com/in/merajsiddique

---

## 📄 License

Licensed under the **MIT License**.

---

> Built with ❤️ using **LangGraph, FastAPI, React, Docker, Render, Python AST, and Google Gemini 3.6 Flash**.
