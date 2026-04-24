"""Fit Analyzer — scores candidate-JD fit and produces a structured verdict."""

from google.adk import Agent

from app.agent.sub_agents.fit_analyzer.prompt import FIT_ANALYZER_INSTRUCTION
from app.schemas import FitVerdict
from app.utils.llm_utils import openai_mini

fit_analyzer_agent = Agent(
    name="fit_analyzer",
    description="Evaluates candidate fit against a parsed Job Description.",
    model=openai_mini,
    instruction=FIT_ANALYZER_INSTRUCTION,
    output_schema=FitVerdict,
    output_key="fit_verdict",
)
