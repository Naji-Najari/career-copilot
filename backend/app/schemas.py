"""Public API schemas for the HTTP layer."""

from pydantic import BaseModel, Field

from app.agent.sub_agents.post_writer.schemas import PostDraft
from app.agent.sub_agents.trend_scanner.schemas import TrendList


class DraftRequest(BaseModel):
    """Input payload for POST /v1/drafts."""

    domain: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Topic domain to scan, for example 'AI agents' or 'React'.",
    )


class DraftResponse(BaseModel):
    """Output of a completed draft run."""

    trends: TrendList
    post: PostDraft
