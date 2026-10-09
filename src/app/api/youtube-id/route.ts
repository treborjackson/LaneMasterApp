import { NextRequest, NextResponse } from 'next/server';

async function searchYouTube(query: string): Promise<string | null> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept':          'text/html,application/xhtml+xml',
    },
  });

  if (!res.ok) return null;
  const html = await res.text();

  // YouTube embeds video data as JSON in the page — first videoId is the top result
  const matches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
  for (const match of matches) {
    const id = match[1];
    // Skip YouTube Shorts and channel IDs — verify it's a real watchable video
    const check = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    if (check.ok) return id;
  }

  return null;
}

export async function POST(req: NextRequest) {
  const { ballName, brand } = await req.json();
  if (!ballName || !brand) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  try {
    const query    = `${brand} ${ballName} bowling ball review`;
    const videoId  = await searchYouTube(query);
    return NextResponse.json({ youtubeId: videoId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
