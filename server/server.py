
from fastmcp import FastMCP
import os
import sys

# Add server dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tools.world_tools import register_world_tools
from tools.media_tools import register_media_tools
from tools.system_tools import register_system_tools
from tools.web_tools import register_web_tools
from tools.weather_tools import register_weather_tools
from tools.app_tools import register_app_tools

# ── Initialize FastMCP ────────────────────────────────────────────────────────
mcp = FastMCP("SWASTIK Tools")

# ── Register all tool modules ─────────────────────────────────────────────────
register_world_tools(mcp)
register_media_tools(mcp)
register_system_tools(mcp)
register_web_tools(mcp)
register_weather_tools(mcp)
register_app_tools(mcp)

# ── HTTP POST endpoint so Next.js proxy can call tools directly ───────────────
from starlette.responses import JSONResponse
from starlette.requests import Request

@mcp.custom_route("/tools/{tool_name}", methods=["POST"])
async def call_tool(request: Request):
    """Direct HTTP POST handler for Next.js → Python tool calls."""
    tool_name = request.path_params.get("tool_name")
    try:
        tools = await mcp.list_tools()
        tool = next((t for t in tools if t.name == tool_name), None)

        if not tool:
            available = [t.name for t in tools]
            return JSONResponse(
                status_code=404,
                content={"error": f"Tool '{tool_name}' not found", "available": available}
            )

        input_data = await request.json()
        print(f"SWASTIK: Executing '{tool_name}' with input: {input_data}")
        result = await tool.run(input_data)
        
        # If result is already a dict, return it. If it's a ToolResult, serialize it.
        if hasattr(result, "content"):
            # Handle standard MCP ToolResult
            content = []
            for item in result.content:
                if hasattr(item, "text"):
                    content.append({"type": "text", "text": item.text})
            return JSONResponse(content)
        
        return JSONResponse(result)

    except Exception as e:
        print(f"SWASTIK: Tool '{tool_name}' failed: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@mcp.custom_route("/health", methods=["GET"])
async def health(request: Request):
    """Quick health-check endpoint."""
    return JSONResponse({"status": "ok", "server": "SWASTIK FastMCP", "port": 8000})


if __name__ == "__main__":
    print("+--------------------------------------+")
    print("|   SWASTIK FastMCP Server v2.0        |")
    print("|   SSE Transport - port 8000          |")
    print("+--------------------------------------+")
    mcp.run(transport="sse", host="0.0.0.0", port=8000)
