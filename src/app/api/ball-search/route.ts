import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { query } = await req.json();
  if (!query || query.trim().length < 2) return NextResponse.json([]);

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json([]);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `A bowler is searching for the bowling ball named "${query}". Return a JSON array of up to 6 real bowling balls that match this search. Include close matches and partial name matches. Each item must have "name" (exact ball name) and "brand" (manufacturer). Only include real bowling balls that actually exist. Return ONLY a raw JSON array, no markdown, no explanation.\n\nExample: [{"name":"Phaze II","brand":"Storm"},{"name":"Phaze III","brand":"Storm"}]`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '[]';
    // Strip any markdown fences if present
    const clean = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const results = JSON.parse(clean);
    return NextResponse.json(Array.isArray(results) ? results : []);
  } catch {
    return NextResponse.json([]);
  }
}
