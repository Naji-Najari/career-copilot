"""POST /v1/extract-pdf — extract plain text from an uploaded PDF."""

from io import BytesIO
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status
from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.schemas import ExtractPdfResponse
from app.utils.logger import get_logger
from app.utils.rate_limit import limiter

logger = get_logger(__name__)

router = APIRouter(prefix="/v1", tags=["extract"])

MAX_PDF_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/extract-pdf", response_model=ExtractPdfResponse)
@limiter.limit("20/minute")
async def extract_pdf(
    request: Request, file: UploadFile = File(...)
) -> ExtractPdfResponse:
    """Read a PDF upload and return its concatenated page text."""
    request_id = uuid4().hex

    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={
                "error": "Expected a PDF file.",
                "request_id": request_id,
            },
        )

    data = await file.read()
    if len(data) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Uploaded file is empty.", "request_id": request_id},
        )
    if len(data) > MAX_PDF_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "error": f"PDF exceeds the {MAX_PDF_BYTES // (1024 * 1024)} MB limit.",
                "request_id": request_id,
            },
        )

    try:
        reader = PdfReader(BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
    except PdfReadError as exc:
        logger.warning(
            "pypdf failed to read %s: %s [request_id=%s]",
            file.filename,
            exc,
            request_id,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Could not read PDF.", "request_id": request_id},
        ) from exc

    text = "\n\n".join(p.strip() for p in pages if p.strip())
    if not text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "PDF contained no extractable text (it may be a scanned image).",
                "request_id": request_id,
            },
        )
    return ExtractPdfResponse(text=text)
