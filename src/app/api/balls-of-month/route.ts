import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/db';

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

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

async function pickBallsOfMonth(): Promise<PicksResult> {
  const response = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1536,
    tools:      [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 } as never],
    messages: [{
      role:    'user',
      content:
        'Go to bowling.com and search for their best-selling or top-rated bowling balls right now. ' +
        'Also check bowlingball.com for their current top sellers. ' +
        'Pick the 5 best bowling balls available this month based on what you find. ' +
        'Respond with ONLY a JSON object (no markdown, no extra text) in this exact shape: ' +
        '{"picks": [{"ballName": "...", "brand": "...", "reasoning": "1-2 sentence summary of why it made the list"}, ' +
        '... exactly 5 entries ranked best first], "sources": ["https://www.bowling.com", "https://www.bowlingball.com"]}',
    }],
  });

  const textBlock = response.content.filter((b) => b.type === 'text').pop();
  const text   = textBlock && textBlock.type === 'text' ? textBlock.text : '';
  const parsed = extractJson(text);

  if (!parsed) throw new Error(`Could not parse response: ${text.slice(0, 200)}`);
  return parsed;
}

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    return NextResponse.json({ error: 'Balls of the Month is not configured yet.' }, { status: 200 });
  }

  try {
    // Check for a cached result within the last 30 days
    const latest = await prisma.ballsOfMonth.findFirst({ orderBy: { createdAt: 'desc' } }).catch(() => null);
    if (latest && Date.now() - latest.createdAt.getTime() < MONTH_MS) {
      return NextResponse.json({
        picks:   JSON.parse(latest.picks),
        sources: JSON.parse(latest.sources),
      });
    }

    const result = await pickBallsOfMonth();

    // Save to DB — if table doesn't exist yet, still return the result
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
