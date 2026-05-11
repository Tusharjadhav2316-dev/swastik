
from datetime import datetime
import pytz


def register_system_tools(mcp):

    @mcp.tool()
    async def get_time(timezone: str = "Asia/Kolkata") -> dict:
        """Get the current accurate time and date for any timezone."""
        try:
            tz = pytz.timezone(timezone)
            now = datetime.now(tz)
            return {
                "time": now.strftime("%I:%M:%S %p"),
                "time_24h": now.strftime("%H:%M:%S"),
                "date": now.strftime("%d %B %Y"),
                "day": now.strftime("%A"),
                "timestamp": now.isoformat(),
                "timezone": timezone,
                "utc_offset": now.strftime("%z"),
            }
        except Exception as e:
            return {"error": str(e), "timezone": timezone}

    @mcp.tool()
    async def get_system_info() -> dict:
        """Get SWASTIK system status and module health."""
        return {
            "status": "Operational",
            "version": "2.0.0",
            "build": "Week-2-Day-8",
            "modules": {
                "world_intelligence": "GDELT (Unlimited)",
                "media_engine": "Invidious + Deezer (Keyless)",
                "news": "NewsAPI + GDELT Fallback",
                "weather": "OpenWeatherMap",
                "app_launcher": "60+ Apps",
                "wake_word": "Web Speech API (Browser)",
            },
            "server": "FastMCP SSE on :8000",
        }
