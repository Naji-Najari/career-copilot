# Backend

FastAPI backend for trend-writer.

## Run locally

```bash
cp .env.example .env       # fill in values
uv sync
uv run uvicorn app.main:app --reload --port 8080 --env-file .env
```

Health check: http://localhost:8080/health
Interactive API docs: http://localhost:8080/docs

## Iteration status

This is **iter 0** : a minimal FastAPI that boots with `/health`. No ADK, no tools, no agents yet. Those come in subsequent iterations.
