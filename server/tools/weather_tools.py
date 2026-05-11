
import aiohttp
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import OPENWEATHER_KEY


async def fetch_weather(city: str) -> dict:
    """Get current weather from OpenWeatherMap."""
    if not OPENWEATHER_KEY:
        return {"error": "OpenWeatherMap key not configured", "city": city}

    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": OPENWEATHER_KEY,
            "units": "metric",
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    return {"error": f"Weather API returned {resp.status}: {text}", "city": city}
                data = await resp.json()

        return {
            "city": data.get("name", city),
            "country": data.get("sys", {}).get("country", ""),
            "temperature": data.get("main", {}).get("temp"),
            "feels_like": data.get("main", {}).get("feels_like"),
            "humidity": data.get("main", {}).get("humidity"),
            "condition": data.get("weather", [{}])[0].get("main", ""),
            "description": data.get("weather", [{}])[0].get("description", ""),
            "wind_speed": data.get("wind", {}).get("speed"),
            "visibility": data.get("visibility"),
            "lat": data.get("coord", {}).get("lat"),
            "lon": data.get("coord", {}).get("lon"),
            "icon": data.get("weather", [{}])[0].get("icon", ""),
        }
    except Exception as e:
        print(f"Weather error: {e}")
        return {"error": str(e), "city": city}


def register_weather_tools(mcp):
    @mcp.tool()
    async def get_weather(city: str = "Mumbai") -> dict:
        """Get current weather conditions for any city using OpenWeatherMap."""
        return await fetch_weather(city)
