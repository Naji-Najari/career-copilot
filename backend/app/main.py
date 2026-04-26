"""FastAPI entry point for the career-copilot backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.routes.analyze import router as analyze_router
from app.routes.extract import router as extract_router
from app.utils.constants import ENV, VERSION
from app.utils.logger import get_logger
from app.utils.logging_middleware import log_request
from app.utils.observability import setup_observability
from app.utils.rate_limit import limiter

logger = get_logger(__name__)

# Patch ADK with OTel exporters before any agent is constructed.
setup_observability()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("career-copilot starting — env=%s version=%s", ENV, VERSION)
    yield
    logger.info("career-copilot shutting down.")


_is_dev = ENV != "production"
app = FastAPI(
    title="career-copilot",
    version=VERSION,
    lifespan=lifespan,
    docs_url="/docs" if _is_dev else None,
    redoc_url="/redoc" if _is_dev else None,
    openapi_url="/openapi.json" if _is_dev else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(BaseHTTPMiddleware, dispatch=log_request())

app.include_router(analyze_router)
app.include_router(extract_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy"}
