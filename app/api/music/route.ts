
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  
  try {
    // Deezer — completely free, no key, no auth
    const res = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=1`
    );
    const data = await res.json();
    const track = data.data?.[0];
    
    if (!track) return Response.json({ error: 'Not found' }, { status: 404 });
    
    return Response.json({
      trackId: track.id,
      title: track.title,
      artist: track.artist.name,
      preview: track.preview,
      embedUrl: `https://widget.deezer.com/widget/dark/track/${track.id}`
    });
  } catch (err) {
    console.error("Deezer search error:", err);
    return Response.json({ error: "Failed to fetch from Deezer" }, { status: 500 });
  }
}
