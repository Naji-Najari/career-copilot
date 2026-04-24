"""CV Parser — extracts structured ParsedCV from raw CV text."""

from google.adk import Agent

from app.agent.sub_agents.cv_parser.prompt import CV_PARSER_INSTRUCTION
from app.schemas import ParsedCV
from app.utils.llm_utils import openai_mini

cv_parser_agent = Agent(
    name="cv_parser",
    description="Parses raw CV text into structured ParsedCV.",
    model=openai_mini,
    instruction=CV_PARSER_INSTRUCTION,
    output_schema=ParsedCV,
    output_key="parsed_cv",
)
