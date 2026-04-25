"""Request/response logging middleware.

Logs every request with method, path, status, and duration. Skips `/health`
to avoid noise. Unhandled exceptions are logged with a traceback and
surfaced as a 500.
"""

import time
from typing import Callable

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from app.utils.logger import get_logger

logger = get_logger(__name__)

_SILENT_PATHS = {"/health"}


def log_request() -> Callable[[Request, RequestResponseEndpoint], Response]:
    async def middleware(
        request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start = time.perf_counter()
        method = request.method
        path = request.url.path

        try:
            response = await call_next(request)
        except Exception as exc:  # noqa: BLE001
            duration_ms = (time.perf_counter() - start) * 1000
            logger.error(
                "%s %s - ERROR (%.1fms): %s",
                method,
                path,
                duration_ms,
                exc,
                exc_info=True,
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"},
            )

        duration_ms = (time.perf_counter() - start) * 1000
        if path not in _SILENT_PATHS:
            logger.info(
                "%s %s - %s (%.1fms)",
                method,
                path,
                response.status_code,
                duration_ms,
            )
        return response

    return middleware
