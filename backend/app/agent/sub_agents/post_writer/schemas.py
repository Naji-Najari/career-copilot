"""Output schema for the PostWriter sub-agent."""

from pydantic import BaseModel, Field


class PostDraft(BaseModel):
    """A LinkedIn-shaped post draft."""

    chosen_trend_title: str = Field(description="Title of the Trend picked from the list.")
    hook: str = Field(description="Scroll-stopping first line, max 160 characters.")
    body: str = Field(description="Post body, 500 to 1000 characters.")
    cta: str = Field(description="Closing call to action, one sentence.")
