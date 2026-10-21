import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/db';

const BRANDS = ['Storm', 'Brunswick', 'Hammer', 'Roto Grip', 'Motiv'];

function isNewMonth(date: Date): boolean {
  const now = new Date();
  return now.getFullYear() !== date.getFullYear() ||
         now.getMonth()    !== date.getMonth();
}

export interface BrandPick {
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

export interface BrandGroup {
  brand: string;
  picks: BrandPick[];
}

function extractJson(text: string): BrandGroup[] | null {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

async function findYouTubeId(ballName: string, brand: string): Promise<string> {
  try {
    const query = `${brand} ${ballName} bowling ball review`;
    const url   = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res   = await fetch(url, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept':          'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return '';
    const html    = await res.text();
    const matches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
    for (const match of matches) {
      const id    = match[1];
      const check = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      if (check.ok) return id;
    }
  } catch { /* ignore */ }
  return '';
}

async function fetchBallsByBrand(): Promise<BrandGroup[]> {
  const now       = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const year      = now.getFullYear();

  const response = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role:    'user',
      content:
        `For ${monthName} ${year}, list the top 3 most popular and recommended bowling balls ` +
        `for each of these brands: ${BRANDS.join(', ')}. ` +
        `Focus on balls that are currently popular among league bowlers and on the pro tour. ` +
        `For hook and speed use a 1-10 scale. ` +
        `Respond with ONLY a JSON array (no markdown, no extra text) in this exact shape:\n` +
        `[{"brand":"Storm","picks":[` +
        `{"ballName":"...","brand":"Storm","cover":"Solid/Pearl/Hybrid Reactive","lane":"Light/Medium/Heavy oil","hook":7,"speed":6,"price":"$xxx","reasoning":"1-2 sentence summary"},` +
        `{"ballName":"...","brand":"Storm","cover":"...","lane":"...","hook":8,"speed":5,"price":"$xxx","reasoning":"..."},` +
        `{"ballName":"...","brand":"Storm","cover":"...","lane":"...","hook":6,"speed":7,"price":"$xxx","reasoning":"..."}` +
        `]},` +
        `{"brand":"Brunswick","picks":[...]},` +
        `{"brand":"Hammer","picks":[...]},` +
        `{"brand":"Roto Grip","picks":[...]},` +
        `{"brand":"Motiv","picks":[...]}]`,
    }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  const text      = textBlock?.type === 'text' ? textBlock.text : '';
  const parsed    = extractJson(text);
  if (!parsed) throw new Error(`Could not parse brand list: ${text.slice(0, 300)}`);

  // Find YouTube videos for all picks in parallel
  const brandsWithVideo: BrandGroup[] = await Promise.all(
    parsed.map(async (group) => {
      const picks = await Promise.all(
        group.picks.map(async (pick) => {
          const youtubeId = await findYouTubeId(pick.ballName, pick.brand).catch(() => '');
          return { ...pick, youtubeId };
        })
      );
      return { brand: group.brand, picks };
    })
  );

  return brandsWithVideo;
}

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 200 });
  }

  try {
    const latest = await prisma.ballsOfMonth.findFirst({ orderBy: { createdAt: 'desc' } }).catch(() => null);
    if (latest && !isNewMonth(latest.createdAt)) {
      const picks = JSON.parse(latest.picks);
      // Support both old flat format and new brand-grouped format
      if (Array.isArray(picks) && picks[0]?.picks) {
        return NextResponse.json({ brands: picks });
      }
    }

    const brands = await fetchBallsByBrand();

    await prisma.ballsOfMonth.create({
      data: {
        picks:   JSON.stringify(brands),
        sources: JSON.stringify([]),
      },
    }).catch(() => {});

    return NextResponse.json({ brands });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[balls-of-month] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
