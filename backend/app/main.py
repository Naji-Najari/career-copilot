from fastapi import FastAPI

from app.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(title="trend-writer", version="0.1.0")


@app.get("/health")
async def health():
    return {"status": "healthy"}
