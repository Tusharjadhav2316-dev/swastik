
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  
  try {
    // Invidious public instance — no key needed
    const res = await fetch(
      `https://invidious.io.lol/api/v1/search?q=${encodeURIComponent(q)}&type=video&fields=videoId,title,author`
    );
    const videos = await res.json();
    
    return Response.json({
      videos: videos.slice(0, 3).map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        channelName: v.author,
        embedUrl: `https://www.youtube.com/embed/${v.videoId}?autoplay=1`
      }))
    });
  } catch (err) {
    console.error("Invidious search error:", err);
    return Response.json({ error: "Failed to fetch from Invidious" }, { status: 500 });
  }
}
