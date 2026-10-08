import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = await res.text();

    // YouTube embeds video IDs in the page as "videoId":"XXXXXXXXXXX"
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (!match) return NextResponse.json({ error: 'No video found' }, { status: 404 });

    return NextResponse.json({ videoId: match[1] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
