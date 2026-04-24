"""Interview Prep — generates probable questions, talking points, reverse questions."""

from google.adk import Agent

from app.agent.sub_agents.interview_prep.prompt import INTERVIEW_PREP_INSTRUCTION
from app.schemas import InterviewPrepBundle
from app.utils.llm_utils import openai_mini

interview_prep_agent = Agent(
    name="interview_prep",
    description="Generates tailored interview prep from the parsed CV + company intel.",
    model=openai_mini,
    instruction=INTERVIEW_PREP_INSTRUCTION,
    output_schema=InterviewPrepBundle,
    output_key="interview_prep",
)
