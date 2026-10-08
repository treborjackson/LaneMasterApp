import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/db';

const SOURCE_URL = 'https://www.bowling.com/best-gear/best-bowling-balls';

// Refresh on the 1st of every month
function isNewMonth(date: Date): boolean {
  const now = new Date();
  return now.getFullYear() !== date.getFullYear() ||
         now.getMonth()    !== date.getMonth();
}

interface Pick {
  ballName:  string;
  brand:     string;
  cover:     string;
  lane:      string;
  hook:      number;
  speed:     number;
  price:     string;
  reasoning: string;
  youtubeId: string;
}

interface PicksResult {
  picks:   Pick[];
  sources: string[];
}

function extractJson(text: string): Omit<PicksResult, 'picks'> & { picks: Omit<Pick, 'youtubeId'>[] } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html',
    },
  });
  if (!res.ok) throw new Error(`bowling.com fetch failed: ${res.status}`);
  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 8000);
}

async function searchYouTube(query: string): Promise<string> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return '';

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`;
  const res  = await fetch(url);
  if (!res.ok) return '';
  const data = await res.json();
  return data?.items?.[0]?.id?.videoId ?? '';
}

async function fetchBallsOfMonth(): Promise<PicksResult> {
  // Step 1: scrape bowling.com for top 5 balls
  const pageText = await fetchPageText(SOURCE_URL);

  const response = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role:    'user',
      content:
        'Below is text scraped from bowling.com\'s best bowling balls page. ' +
        'Extract the top 5 bowling balls mentioned with as much detail as you can find. ' +
        'For hook and speed, estimate on a 1-10 scale (solid reactive = higher hook, pearl = higher speed). ' +
        'Respond with ONLY a JSON object (no markdown, no extra text) in this exact shape: ' +
        '{"picks": [{"ballName": "...", "brand": "...", "cover": "Solid/Pearl/Hybrid Reactive", "lane": "Light/Medium/Heavy oil", "hook": 7, "speed": 7, "price": "$xxx", "reasoning": "1-2 sentence summary"}, ' +
        '... exactly 5 entries], "sources": ["' + SOURCE_URL + '"]}\n\n' +
        'PAGE TEXT:\n' + pageText,
    }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  const text   = textBlock?.type === 'text' ? textBlock.text : '';
  const parsed = extractJson(text);
  if (!parsed) throw new Error(`Could not parse ball list: ${text.slice(0, 300)}`);

  // Step 2: find a YouTube video ID for each ball
  const picksWithVideo: Pick[] = await Promise.all(
    parsed.picks.map(async (pick) => {
      const youtubeId = await searchYouTube(`${pick.brand} ${pick.ballName} bowling ball review`).catch(() => '');
      return { ...pick, youtubeId };
    })
  );

  return { picks: picksWithVideo, sources: parsed.sources };
}

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 200 });
  }

  try {
    const latest = await prisma.ballsOfMonth.findFirst({ orderBy: { createdAt: 'desc' } }).catch(() => null);
    if (latest && !isNewMonth(latest.createdAt)) {
      return NextResponse.json({
        picks:   JSON.parse(latest.picks),
        sources: JSON.parse(latest.sources),
      });
    }

    const result = await fetchBallsOfMonth();

    await prisma.ballsOfMonth.create({
      data: {
        picks:   JSON.stringify(result.picks),
        sources: JSON.stringify(result.sources),
      },
    }).catch(() => {});

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[balls-of-month] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
