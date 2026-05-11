
# 60+ app map with web URL and mobile deep link
APP_MAP = {
    # Communication
    "whatsapp":     {"webUrl": "https://web.whatsapp.com",           "deepLink": "whatsapp://",          "category": "communication"},
    "telegram":     {"webUrl": "https://web.telegram.org",           "deepLink": "tg://",                "category": "communication"},
    "instagram":    {"webUrl": "https://www.instagram.com",          "deepLink": "instagram://",         "category": "social"},
    "twitter":      {"webUrl": "https://twitter.com",                "deepLink": "twitter://",           "category": "social"},
    "x":            {"webUrl": "https://x.com",                      "deepLink": "twitter://",           "category": "social"},
    "facebook":     {"webUrl": "https://www.facebook.com",           "deepLink": "fb://",                "category": "social"},
    "linkedin":     {"webUrl": "https://www.linkedin.com",           "deepLink": "linkedin://",          "category": "professional"},
    "discord":      {"webUrl": "https://discord.com/app",            "deepLink": "discord://",           "category": "communication"},
    "slack":        {"webUrl": "https://app.slack.com",              "deepLink": "slack://",             "category": "communication"},
    "zoom":         {"webUrl": "https://zoom.us/join",               "deepLink": "zoomus://",            "category": "communication"},
    "meet":         {"webUrl": "https://meet.google.com",            "deepLink": "googlemeet://",        "category": "communication"},
    "gmail":        {"webUrl": "https://mail.google.com",            "deepLink": "googlegmail://",       "category": "productivity"},
    "outlook":      {"webUrl": "https://outlook.live.com",           "deepLink": "ms-outlook://",        "category": "productivity"},

    # Music & Media
    "spotify":      {"webUrl": "https://open.spotify.com",           "deepLink": "spotify:",             "category": "music"},
    "youtube":      {"webUrl": "https://www.youtube.com",            "deepLink": "youtube://",           "category": "media"},
    "netflix":      {"webUrl": "https://www.netflix.com",            "deepLink": "netflix://",           "category": "media"},
    "hotstar":      {"webUrl": "https://www.hotstar.com",            "deepLink": "hotstar://",           "category": "media"},
    "primevideo":   {"webUrl": "https://www.primevideo.com",         "deepLink": "primevideo://",        "category": "media"},
    "jiocinema":    {"webUrl": "https://www.jiocinema.com",          "deepLink": "jiocinema://",         "category": "media"},
    "soundcloud":   {"webUrl": "https://soundcloud.com",             "deepLink": "soundcloud://",        "category": "music"},
    "gaana":        {"webUrl": "https://gaana.com",                  "deepLink": "gaana://",             "category": "music"},
    "jiosaavn":     {"webUrl": "https://www.jiosaavn.com",           "deepLink": "jiosaavn://",          "category": "music"},

    # Productivity
    "notion":       {"webUrl": "https://www.notion.so",              "deepLink": "notion://",            "category": "productivity"},
    "drive":        {"webUrl": "https://drive.google.com",           "deepLink": "googledrive://",       "category": "productivity"},
    "docs":         {"webUrl": "https://docs.google.com",            "deepLink": "googledocs://",        "category": "productivity"},
    "sheets":       {"webUrl": "https://sheets.google.com",          "deepLink": "googlesheets://",      "category": "productivity"},
    "calendar":     {"webUrl": "https://calendar.google.com",        "deepLink": "googlecalendar://",    "category": "productivity"},
    "translate":    {"webUrl": "https://translate.google.com",       "deepLink": "googletranslate://",   "category": "productivity"},
    "maps":         {"webUrl": "https://maps.google.com",            "deepLink": "googlemaps://",        "category": "navigation"},
    "keep":         {"webUrl": "https://keep.google.com",            "deepLink": "googlekeep://",        "category": "productivity"},
    "photos":       {"webUrl": "https://photos.google.com",          "deepLink": "googlephotos://",      "category": "productivity"},
    "trello":       {"webUrl": "https://trello.com",                 "deepLink": "trello://",            "category": "productivity"},

    # Development
    "github":       {"webUrl": "https://github.com",                 "deepLink": "github://",            "category": "development"},
    "leetcode":     {"webUrl": "https://leetcode.com",               "deepLink": "leetcode://",          "category": "development"},
    "stackoverflow":{"webUrl": "https://stackoverflow.com",          "deepLink": "stackoverflow://",     "category": "development"},
    "replit":       {"webUrl": "https://replit.com",                 "deepLink": "replit://",            "category": "development"},
    "vercel":       {"webUrl": "https://vercel.com/dashboard",       "deepLink": "vercel://",            "category": "development"},

    # Shopping & Delivery
    "amazon":       {"webUrl": "https://www.amazon.in",              "deepLink": "amazon://",            "category": "shopping"},
    "flipkart":     {"webUrl": "https://www.flipkart.com",           "deepLink": "flipkart://",          "category": "shopping"},
    "meesho":       {"webUrl": "https://www.meesho.com",             "deepLink": "meesho://",            "category": "shopping"},
    "myntra":       {"webUrl": "https://www.myntra.com",             "deepLink": "myntra://",            "category": "shopping"},
    "ajio":         {"webUrl": "https://www.ajio.com",               "deepLink": "ajio://",              "category": "shopping"},
    "swiggy":       {"webUrl": "https://www.swiggy.com",             "deepLink": "swiggy://",            "category": "food"},
    "zomato":       {"webUrl": "https://www.zomato.com",             "deepLink": "zomato://",            "category": "food"},
    "blinkit":      {"webUrl": "https://blinkit.com",                "deepLink": "blinkit://",           "category": "food"},
    "zepto":        {"webUrl": "https://www.zepto.com",              "deepLink": "zepto://",             "category": "food"},

    # Travel & Transport
    "ola":          {"webUrl": "https://www.olacabs.com",            "deepLink": "ola://",               "category": "transport"},
    "uber":         {"webUrl": "https://m.uber.com",                 "deepLink": "uber://",              "category": "transport"},
    "irctc":        {"webUrl": "https://www.irctc.co.in",            "deepLink": "irctc://",             "category": "travel"},
    "makemytrip":   {"webUrl": "https://www.makemytrip.com",         "deepLink": "mmt://",               "category": "travel"},
    "goibibo":      {"webUrl": "https://www.goibibo.com",            "deepLink": "goibibo://",           "category": "travel"},
    "rapido":       {"webUrl": "https://www.rapido.bike",            "deepLink": "rapido://",            "category": "transport"},

    # Finance & Payments
    "paytm":        {"webUrl": "https://paytm.com",                  "deepLink": "paytm://",             "category": "finance"},
    "phonepe":      {"webUrl": "https://www.phonepe.com",            "deepLink": "phonepe://",           "category": "finance"},
    "gpay":         {"webUrl": "https://pay.google.com",             "deepLink": "googlepay://",         "category": "finance"},
    "googlepay":    {"webUrl": "https://pay.google.com",             "deepLink": "googlepay://",         "category": "finance"},
    "cred":         {"webUrl": "https://cred.club",                  "deepLink": "cred://",              "category": "finance"},
    "groww":        {"webUrl": "https://groww.in",                   "deepLink": "groww://",             "category": "finance"},
    "zerodha":      {"webUrl": "https://kite.zerodha.com",           "deepLink": "zerodha://",           "category": "finance"},
    "upstox":       {"webUrl": "https://upstox.com",                 "deepLink": "upstox://",            "category": "finance"},
}


def find_app(name: str) -> dict | None:
    """Case-insensitive lookup in APP_MAP."""
    key = name.lower().strip().replace(" ", "")
    return APP_MAP.get(key)


def register_app_tools(mcp):

    @mcp.tool()
    async def open_app(app_name: str) -> dict:
        """Open any app by name. Returns web URL and deep link for mobile. Supports 60+ apps."""
        app = find_app(app_name)
        if not app:
            # Fuzzy: try partial match
            name_lower = app_name.lower()
            for key, val in APP_MAP.items():
                if key in name_lower or name_lower in key:
                    app = val
                    app_name = key
                    break

        if not app:
            return {
                "error": f"App '{app_name}' not found in SWASTIK app map.",
                "suggestion": "Try: spotify, youtube, whatsapp, netflix, swiggy, zomato, github, leetcode, maps, gmail",
            }

        return {
            "appName": app_name,
            "webUrl": app["webUrl"],
            "deepLink": app["deepLink"],
            "category": app.get("category", "general"),
            "action": "open_tab",
            "message": f"Opening {app_name.title()} for you boss.",
        }

    @mcp.tool()
    async def send_message(platform: str, recipient: str = "", message: str = "") -> dict:
        """Compose a message on WhatsApp, Gmail, or Telegram. Returns compose URL."""
        platform = platform.lower().strip()

        if platform == "whatsapp":
            phone = recipient.replace("+", "").replace(" ", "").replace("-", "")
            web_url = f"https://web.whatsapp.com/send?phone={phone}&text={message}" if phone else "https://web.whatsapp.com"
            deep_link = f"whatsapp://send?phone={phone}&text={message}"
            return {"platform": "WhatsApp", "webUrl": web_url, "deepLink": deep_link, "action": "open_tab"}

        elif platform == "gmail":
            import urllib.parse
            web_url = f"https://mail.google.com/mail/?view=cm&to={urllib.parse.quote(recipient)}&body={urllib.parse.quote(message)}"
            return {"platform": "Gmail", "webUrl": web_url, "deepLink": f"googlegmail:///co?to={recipient}", "action": "open_tab"}

        elif platform == "telegram":
            web_url = f"https://t.me/{recipient}" if recipient else "https://web.telegram.org"
            deep_link = f"tg://resolve?domain={recipient}"
            return {"platform": "Telegram", "webUrl": web_url, "deepLink": deep_link, "action": "open_tab"}

        return {"error": f"Platform '{platform}' not supported for messaging. Use: whatsapp, gmail, telegram"}
