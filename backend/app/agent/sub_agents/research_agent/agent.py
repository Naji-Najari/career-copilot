"""Research Agent — pulls company intel via the Tavily MCP server.

ADK disallows combining `output_schema` with `tools` on non-Gemini-3 models,
so the agent emits CompanyIntelligence *as a JSON string* in state (the
instruction inlines the schema). The API handler parses it via
`CompanyIntelligence.model_validate_json(...)`.
"""

from google.adk import Agent

from app.agent.sub_agents.research_agent.prompt import RESEARCH_AGENT_INSTRUCTION
from app.agent.tools.tavily_mcp import build_tavily_toolset
from app.utils.llm_utils import openai_mini

research_agent = Agent(
    name="research_agent",
    description="Researches the hiring company via Tavily and emits CompanyIntelligence JSON.",
    model=openai_mini,
    instruction=RESEARCH_AGENT_INSTRUCTION,
    tools=[build_tavily_toolset()],
    output_key="company_intel",
)
