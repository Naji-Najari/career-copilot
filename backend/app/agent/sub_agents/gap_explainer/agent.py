"""Gap Explainer — produces a structured gap report when the verdict is no_fit."""

from google.adk import Agent

from app.agent.sub_agents.gap_explainer.prompt import GAP_EXPLAINER_INSTRUCTION
from app.schemas import GapReport
from app.utils.llm_utils import openai_mini

gap_explainer_agent = Agent(
    name="gap_explainer",
    description="Explains why the candidate isn't a fit and suggests adjacent roles.",
    model=openai_mini,
    instruction=GAP_EXPLAINER_INSTRUCTION,
    output_schema=GapReport,
    output_key="gap_report",
)
