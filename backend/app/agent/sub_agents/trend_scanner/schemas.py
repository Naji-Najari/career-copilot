"""Output schema for the TrendScanner sub-agent."""

from typing import Literal

from pydantic import BaseModel, Field


class Trend(BaseModel):
    """One ranked trend item surfaced by the scanner."""

    source: Literal["github", "hn"] = Field(description="Where the trend was fetched from.")
    title: str = Field(description="Repo full name or HN story title.")
    url: str = Field(description="Canonical URL.")
    summary: str = Field(description="One sentence on what it is and why it matters.")
    score: int = Field(ge=1, le=10, description="Relevance to the domain, 1 to 10.")


class TrendList(BaseModel):
    """Ranked list of the 5 strongest trends for the domain."""

    items: list[Trend] = Field(
        description="Up to 5 trend items, ranked by score descending.",
        max_length=5,
    )
