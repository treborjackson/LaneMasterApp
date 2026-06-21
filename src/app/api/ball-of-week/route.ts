import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/db';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface PickResult {
  ballName:  string;
  brand:     string;
  reasoning: string;
  sources:   string[];
}

function extractJson(text: string): PickResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function pickBallOfWeek(): Promise<PickResult> {
  const response = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1024,
    tools:      [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 } as never],
    messages: [{
      role:    'user',
      content: 'Search at least 3 different bowling equipment review or retailer sites for ' +
        'the bowling ball that is currently most recommended / top-rated / best-selling this week. ' +
        'Then respond with ONLY a JSON object (no markdown fences, no extra text) in this exact shape: ' +
        '{"ballName": "...", "brand": "...", "reasoning": "2-3 sentence summary of why it is the pick this week", ' +
        '"sources": ["url1", "url2", "url3"]}',
    }],
  });

  const textBlock = response.content.filter((b) => b.type === 'text').pop();
  const text   = textBlock && textBlock.type === 'text' ? textBlock.text : '';
  const parsed = extractJson(text);

  if (!parsed) throw new Error('Could not parse ball-of-week response');
  return parsed;
}

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    return NextResponse.json({ error: 'Ball of the Week is not configured yet.' }, { status: 200 });
  }

  const latest = await prisma.ballOfWeek.findFirst({ orderBy: { createdAt: 'desc' } });
  if (latest && Date.now() - latest.createdAt.getTime() < WEEK_MS) {
    return NextResponse.json({ ...latest, sources: JSON.parse(latest.sources) });
  }

  const pick = await pickBallOfWeek();
  const saved = await prisma.ballOfWeek.create({
    data: {
      ballName:  pick.ballName,
      brand:     pick.brand,
      reasoning: pick.reasoning,
      sources:   JSON.stringify(pick.sources),
    },
  });

  return NextResponse.json({ ...saved, sources: pick.sources });
}
