"""Tavily integration via the remote MCP server.

Uses `McpToolset` + `StreamableHTTPConnectionParams` so there is no local
`tavily-python` SDK call and no `npx` process to manage. The API key is
passed as a URL query parameter per Tavily's MCP documentation.

Stdio fallback (for offline / air-gapped dev) would be:

    from mcp import StdioServerParameters
    from google.adk.tools.mcp_tool import StdioConnectionParams, McpToolset
    McpToolset(
        connection_params=StdioConnectionParams(
            server_params=StdioServerParameters(
                command="npx",
                args=["-y", "tavily-mcp@latest"],
                env={"TAVILY_API_KEY": TAVILY_API_KEY},
            ),
            timeout=10,
        ),
    )
"""

from google.adk.tools.mcp_tool import McpToolset, StreamableHTTPConnectionParams

from app.utils.constants import TAVILY_API_KEY
from app.utils.logger import get_logger

logger = get_logger(__name__)

TAVILY_MCP_URL = "https://mcp.tavily.com/mcp/"


def build_tavily_toolset() -> McpToolset:
    """Build a Tavily MCP toolset for the Research Agent.

    Instantiation itself never hits the network — the MCP session is opened
    lazily the first time a tool is invoked. A missing `TAVILY_API_KEY` is
    logged here and surfaces as a Tavily auth error at runtime, keeping the
    app importable and recruiter-mode requests unaffected.
    """
    if not TAVILY_API_KEY:
        logger.warning(
            "TAVILY_API_KEY is not set; candidate-mode requests will fail "
            "when the Research Agent calls Tavily."
        )
    return McpToolset(
        connection_params=StreamableHTTPConnectionParams(
            url=f"{TAVILY_MCP_URL}?tavilyApiKey={TAVILY_API_KEY or ''}",
        ),
        tool_filter=["tavily-search", "tavily-extract"],
    )
