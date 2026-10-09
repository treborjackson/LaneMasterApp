import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';

export async function POST(req: NextRequest) {
  const { ballName, brand } = await req.json();
  if (!ballName || !brand) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  try {
    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 64,
      messages: [{
        role:    'user',
        content:
          `What is the 11-character YouTube video ID for an official or well-known review video of the ${brand} ${ballName} bowling ball? ` +
          `Reply with ONLY the 11-character video ID (letters, numbers, hyphens, underscores). ` +
          `If you are not confident in a specific real ID, reply with the single word: none`,
      }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const id = textBlock?.type === 'text' ? textBlock.text.trim() : '';
    const youtubeId = /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;

    return NextResponse.json({ youtubeId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
