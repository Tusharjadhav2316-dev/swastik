
import aiohttp
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import NEWSAPI_KEY

async def get_news_articles(query: str, limit: int = 10) -> dict:
    """Fetch news via NewsAPI, fallback to GDELT if no key or failure."""
    articles = []
    globe_pins = []

    # Primary: NewsAPI
    if NEWSAPI_KEY:
        try:
            url = "https://newsapi.org/v2/everything"
            params = {
                "q": query,
                "apiKey": NEWSAPI_KEY,
                "pageSize": limit,
                "sortBy": "publishedAt",
                "language": "en",
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        for a in data.get("articles", []):
                            articles.append({
                                "title": a.get("title", ""),
                                "source": a.get("source", {}).get("name", ""),
                                "url": a.get("url", ""),
                                "publishedAt": a.get("publishedAt", ""),
                                "description": a.get("description", ""),
                                "lat": None,
                                "lon": None,
                            })
                        if articles:
                            return {"articles": articles, "globePins": globe_pins, "source": "NewsAPI"}
        except Exception as e:
            print(f"NewsAPI error: {e}")

    # Fallback: GDELT
    try:
        gdelt_url = "https://api.gdeltproject.org/api/v2/doc/doc"
        params = {
            "query": query,
            "mode": "artlist",
            "maxrecords": limit,
            "format": "json",
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(gdelt_url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    for a in (data.get("articles") or []):
                        articles.append({
                            "title": a.get("title", ""),
                            "source": a.get("domain", ""),
                            "url": a.get("url", ""),
                            "publishedAt": a.get("seendate", ""),
                            "description": "",
                            "lat": a.get("latitude"),
                            "lon": a.get("longitude"),
                        })
                        if a.get("latitude") and a.get("longitude"):
                            globe_pins.append({
                                "lat": a["latitude"],
                                "lon": a["longitude"],
                                "label": a.get("title", "")[:40],
                                "type": "news",
                            })
    except Exception as e:
        print(f"GDELT error: {e}")

    return {"articles": articles, "globePins": globe_pins, "source": "GDELT"}


def register_web_tools(mcp):
    @mcp.tool()
    async def get_news(query: str = "India technology", limit: int = 8) -> dict:
        """Fetch latest news articles on any topic. Falls back to GDELT if NewsAPI unavailable."""
        return await get_news_articles(query, limit)
