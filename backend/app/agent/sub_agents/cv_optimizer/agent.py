"""CV Optimizer — strategic positioning recommendations for the candidate's CV."""

from google.adk import Agent

from app.agent.sub_agents.cv_optimizer.prompt import CV_OPTIMIZER_INSTRUCTION
from app.schemas import CVOptimizationBundle
from app.utils.llm_utils import openai_mini

cv_optimizer_agent = Agent(
    name="cv_optimizer",
    description=(
        "Produces 0-5 strategic CV-positioning recommendations tailored to "
        "the parsed JD."
    ),
    model=openai_mini,
    instruction=CV_OPTIMIZER_INSTRUCTION,
    output_schema=CVOptimizationBundle,
    output_key="cv_optimizations",
)
