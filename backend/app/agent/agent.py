"""Root workflow for the trend-writer pipeline.

ADK 2.0 graph-based Workflow. Runs TrendScanner first (fetches real trends
from GitHub + Hacker News), then PostWriter (drafts a LinkedIn post from the
top-ranked trend).
"""

from google.adk import Workflow

from app.agent.sub_agents.post_writer import post_writer_agent
from app.agent.sub_agents.trend_scanner import trend_scanner_agent

root_agent = Workflow(
    name="trend_writer_pipeline",
    edges=[("START", trend_scanner_agent, post_writer_agent)],
)
