
from fastmcp import FastMCP
import os
import sys

# Add the current directory to sys.path to import tools
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tools.world_tools import register_world_tools
from tools.media_tools import register_media_tools

# Initialize FastMCP Server
mcp = FastMCP(
    "SWASTIK Intelligence Server"
)

# Register Tools
register_world_tools(mcp)
register_media_tools(mcp)

# Add a direct HTTP POST handler to the underlying FastAPI app for the Next.js proxy
# This allows the proxy to call tools easily without implementing the full MCP client protocol
from fastapi import Request, HTTPException

@mcp.app.post("/tools/{tool_name}")
async def call_tool(tool_name: str, request: Request):
    try:
        # Find the tool
        tool = next((t for t in mcp.list_tools() if t.name == tool_name), None)
        if not tool:
            raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
        
        # Get input
        input_data = await request.json()
        
        # Execute tool
        print(f"SWASTIK: Executing tool '{tool_name}' via HTTP POST...")
        result = await tool.run(input_data)
        return result
    except Exception as e:
        print(f"SWASTIK: Tool execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@mcp.tool()
async def get_system_status():
    """Check the health of SWASTIK intelligence modules."""
    return {
        "status": "Operational",
        "modules": {
            "world_intelligence": "GDELT Unlimited",
            "media_engine": "Invidious + Deezer (Keyless)",
            "wake_word": "Web Speech API (Browser Native)"
        }
    }

if __name__ == "__main__":
    # SSE Transport on port 8000
    print("SWASTIK: Starting FastMCP server on port 8000...")
    mcp.run(transport="sse", host="0.0.0.0", port=8000)
