import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/db';

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const SOURCE_URL = 'https://www.bowling.com/best-gear/best-bowling-balls';

interface Pick {
  ballName:  string;
  brand:     string;
  reasoning: string;
}

interface PicksResult {
  picks:   Pick[];
  sources: string[];
}

function extractJson(text: string): PicksResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html',
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch bowling.com: ${res.status}`);
  const html = await res.text();
  // Strip tags and collapse whitespace for a smaller payload
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 8000);
}

async function pickBallsOfMonth(): Promise<PicksResult> {
  const pageText = await fetchPageText(SOURCE_URL);

  const response = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role:    'user',
      content:
        'Below is text scraped from bowling.com\'s best bowling balls page. ' +
        'Extract the top 5 bowling balls mentioned. ' +
        'Respond with ONLY a JSON object (no markdown, no extra text) in this exact shape: ' +
        '{"picks": [{"ballName": "...", "brand": "...", "reasoning": "1-2 sentence summary of why it made the list"}, ' +
        '... exactly 5 entries ranked as they appear on the page], ' +
        '"sources": ["' + SOURCE_URL + '"]}\n\n' +
        'PAGE TEXT:\n' + pageText,
    }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  const text   = textBlock?.type === 'text' ? textBlock.text : '';
  const parsed = extractJson(text);

  if (!parsed) throw new Error(`Could not parse response: ${text.slice(0, 300)}`);
  return parsed;
}

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    return NextResponse.json({ error: 'Balls of the Month is not configured yet.' }, { status: 200 });
  }

  try {
    const latest = await prisma.ballsOfMonth.findFirst({ orderBy: { createdAt: 'desc' } }).catch(() => null);
    if (latest && Date.now() - latest.createdAt.getTime() < MONTH_MS) {
      return NextResponse.json({
        picks:   JSON.parse(latest.picks),
        sources: JSON.parse(latest.sources),
      });
    }

    const result = await pickBallsOfMonth();

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
