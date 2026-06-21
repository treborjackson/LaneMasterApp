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
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1536,
    tools:      [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 } as never],
    messages: [{
      role:    'user',
      content: 'Search at least 3 different bowling equipment review or retailer sites for ' +
        'the bowling balls that are currently most recommended / top-rated / best-selling this month. ' +
        'Then respond with ONLY a JSON object (no markdown fences, no extra text) in this exact shape: ' +
        '{"picks": [{"ballName": "...", "brand": "...", "reasoning": "1-2 sentence summary of why it made the list"}, ' +
        '... exactly 5 entries, ranked best first], "sources": ["url1", "url2", "url3"]}',
    }],
  });

  const textBlock = response.content.filter((b) => b.type === 'text').pop();
  const text   = textBlock && textBlock.type === 'text' ? textBlock.text : '';
  const parsed = extractJson(text);

  if (!parsed) throw new Error('Could not parse balls-of-month response');
  return parsed;
}

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    return NextResponse.json({ error: 'Balls of the Month is not configured yet.' }, { status: 200 });
  }

  const latest = await prisma.ballsOfMonth.findFirst({ orderBy: { createdAt: 'desc' } });
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
  });

  return NextResponse.json(result);
}
