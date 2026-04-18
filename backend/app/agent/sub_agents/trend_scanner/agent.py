"""TrendScanner sub-agent.

Calls fetch_github_trending and fetch_hn_top (ADK drives the two tool calls),
merges and ranks the top 5 trends for the requested domain.
"""

from google.adk import Agent

from app.agent.tools import fetch_github_trending, fetch_hn_top
from app.utils.llm_utils import lite_llm_openai_gpt_5_mini__trend_scan

from . import prompt, schemas

trend_scanner_agent = Agent(
    model=lite_llm_openai_gpt_5_mini__trend_scan,
    name="trend_scanner",
    description="Fetches real trends from GitHub and Hacker News for a given domain.",
    instruction=prompt.TREND_SCANNER_PROMPT,
    tools=[fetch_github_trending, fetch_hn_top],
    output_schema=schemas.TrendList,
    output_key="trends",
)
