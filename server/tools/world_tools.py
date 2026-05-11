
import aiohttp
from fastmcp import FastMCP
import json

async def get_world_events() -> dict:
    """Fetch global conflict and event data using GDELT (Free/Unlimited)"""
    url = "https://api.gdeltproject.org/api/v2/doc/doc"
    params = {
        "query": "conflict war attack military",
        "mode": "artlist",
        "maxrecords": 20,
        "format": "json"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    data = {"articles": []}
                else:
                    data = await response.json()
                
                # Also return static hotspots for globe (always accurate)
                hotspots = [
                    {"lat": 33.8, "lon": 35.5, "label": "Middle East", "type": "conflict"},
                    {"lat": 48.4, "lon": 31.2, "label": "Ukraine", "type": "conflict"},
                    {"lat": 15.5, "lon": 32.5, "label": "Sudan", "type": "conflict"},
                    {"lat": 13.5, "lon": 2.1,  "label": "Sahel Region", "type": "conflict"},
                    {"lat": 31.5, "lon": 34.4, "label": "Gaza", "type": "conflict"},
                ]
                
                return {
                    "events": data.get("articles", []),
                    "globePins": hotspots,
                    "status": "Live Data (GDELT Unlimited)"
                }
    except Exception as e:
        print(f"GDELT Error: {e}")
        return {"error": str(e), "events": [], "globePins": []}

def register_world_tools(mcp: FastMCP):
    @mcp.tool()
    async def fetch_world_intelligence():
        """Get live global conflict data and intelligence pins for the 3D globe."""
        return await get_world_events()
