"""FastAPI entry point for the career-copilot backend."""

from fastapi import FastAPI

from app.routes.analyze import router as analyze_router
from app.routes.extract import router as extract_router
from app.utils.constants import VERSION
from app.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(title="career-copilot", version=VERSION)

app.include_router(analyze_router)
app.include_router(extract_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy"}
