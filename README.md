# 🚀 Agentic Code Reviewer

An intelligent multi-language AI code review and static analysis system that combines deterministic static analysis tools (AST parsing, Flake8, Bandit) with LLM reasoning via LangGraph and Google Gemini 3.6 Flash.

---

## 🔐 Environment Variables & Security

> **IMPORTANT**: Never commit or expose your real `.env` files or API keys to GitHub.

To configure your environment variables:

1. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *(On Windows PowerShell: `Copy-Item backend/.env.example backend/.env`)*

2. Open `backend/.env` and add your Google Gemini API key:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

---

## 📁 Project Structure

```text
agentic-code-reviewer/
├── backend/
│   ├── app.py              # FastAPI application entry point & SPA routing
│   ├── agent.py            # LangGraph agentic orchestration & SSE streaming
│   ├── graph.py            # LangGraph StateGraph workflow definition
│   ├── nodes.py            # Deterministic AST & LLM execution nodes
│   ├── tools.py            # Multi-language static analysis tools
│   ├── prompts.py          # System prompts and review templates
│   ├── state.py            # LangGraph state schema (ReviewState)
│   ├── models.py           # Gemini LLM client initialization
│   ├── requirements.txt    # Backend dependencies
│   └── .env.example        # Environment variables template
│
├── frontend/
│   ├── src/                # Modern React + Tailwind dashboard components
│   ├── package.json        # Frontend dependencies (React, Lucide, Tailwind)
│   └── vite.config.js      # Vite build configuration
│
├── sample_code/            # Sample test code files across supported languages
├── Dockerfile              # Multi-stage production container build
├── docker-compose.yml      # Local Docker orchestration with secure env_file
└── README.md               # Project documentation
```

---

## ⚡ Quick Start

### 1. Run via Docker (Recommended)

Make sure you have created `backend/.env` with your `GOOGLE_API_KEY`, then run:

```bash
docker compose up --build
```

The application will be accessible at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

### 2. Local Development Setup

#### Backend:
```bash
# Set up virtual environment and install dependencies
uv sync # or: pip install -r backend/requirements.txt

# Run FastAPI backend
uv run uvicorn backend.app:app --reload --port 8000
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔍 Key API Endpoints

- `GET /` — Serves the built React Frontend single-page application.
- `POST /review` — Full multi-stage agentic code review report.
- `GET /review/stream` — Real-time token streaming via Server-Sent Events (SSE).
- `GET /health` — Dedicated health check endpoint.
- `GET /docs` — Interactive Swagger API documentation.
- `GET /openapi.json` — OpenAPI specification schema.
