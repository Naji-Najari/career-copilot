"""POST /v1/drafts - run the trend-writer workflow end-to-end.

Thin handler : delegates all ADK orchestration to `app.utils.adk_runner.run_agent`
and maps the returned session state onto `DraftResponse`.
"""

from fastapi import APIRouter, HTTPException, status

from app.agent import root_agent
from app.schemas import DraftRequest, DraftResponse
from app.utils.adk_runner import run_agent
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/v1", tags=["drafts"])


@router.post(
    "/drafts",
    response_model=DraftResponse,
    status_code=status.HTTP_200_OK,
    summary="Scan real trends for a domain and draft a LinkedIn post.",
)
async def create_draft(payload: DraftRequest) -> DraftResponse:
    state = await run_agent(root_agent, f"Domain: {payload.domain}")
    trends = state.get("trends")
    post = state.get("post")
    if not trends or not post:
        logger.error("incomplete run state keys=%s", list(state.keys()))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="pipeline did not produce complete output",
        )
    return DraftResponse(trends=trends, post=post)
