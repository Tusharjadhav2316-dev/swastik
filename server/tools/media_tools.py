
import aiohttp
from fastmcp import FastMCP

def register_media_tools(mcp: FastMCP):
    @mcp.tool()
    async def play_music(query: str, platform: str = "youtube"):
        """Play music or video using free Invidious/Deezer providers. No API keys required."""
        if platform == "youtube":
            async with aiohttp.ClientSession() as session:
                res = await session.get(
                    f"https://invidious.io.lol/api/v1/search",
                    params={"q": query, "type": "video", "fields": "videoId,title,author"}
                )
                videos = await res.json()
            
            if not videos:
                return {"error": "No results found"}
            
            video = videos[0]
            return {
                "videoId": video["videoId"],
                "embedUrl": f"https://www.youtube.com/embed/{video['videoId']}?autoplay=1",
                "title": video["title"],
                "platform": "youtube",
                "action": "embed_player"
            }
        else: # Handling "spotify" or other by routing to Deezer
            async with aiohttp.ClientSession() as session:
                res = await session.get(
                    f"https://api.deezer.com/search",
                    params={"q": query, "limit": 1}
                )
                data = await res.json()
            
            if not data.get("data"):
                return {"error": "No results found"}
            
            track = data["data"][0]
            return {
                "trackId": track["id"],
                "embedUrl": f"https://widget.deezer.com/widget/dark/track/{track['id']}",
                "preview": track["preview"],
                "title": track["title"],
                "artist": track["artist"]["name"],
                "cover": track["album"]["cover_medium"],
                "platform": "deezer",
                "action": "embed_player"
            }
