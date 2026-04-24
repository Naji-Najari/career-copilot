"""JD Parser — extracts structured ParsedJD from raw JD text, including agency-posting signals."""

from google.adk import Agent

from app.agent.sub_agents.jd_parser.prompt import JD_PARSER_INSTRUCTION
from app.schemas import ParsedJD
from app.utils.llm_utils import openai_mini

jd_parser_agent = Agent(
    name="jd_parser",
    description="Parses raw JD text into structured ParsedJD with agency-posting hints.",
    model=openai_mini,
    instruction=JD_PARSER_INSTRUCTION,
    output_schema=ParsedJD,
    output_key="parsed_jd",
)
