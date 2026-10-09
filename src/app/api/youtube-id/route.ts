import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';

async function videoExists(id: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { method: 'GET' }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { ballName, brand } = await req.json();
  if (!ballName || !brand) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  try {
    // Ask Claude for up to 3 candidate IDs so we can verify each one
    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 128,
      messages: [{
        role:    'user',
        content:
          `Give me up to 3 real YouTube video IDs for review videos of the ${brand} ${ballName} bowling ball. ` +
          `Reply with ONLY the 11-character IDs separated by spaces (letters, numbers, hyphens, underscores). ` +
          `If you don't know any real IDs, reply with: none`,
      }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text.trim() : '';

    // Extract all valid-looking IDs from the response
    const candidates = text
      .split(/\s+/)
      .filter((id) => /^[a-zA-Z0-9_-]{11}$/.test(id));

    // Verify each candidate against YouTube's oEmbed endpoint
    for (const id of candidates) {
      if (await videoExists(id)) {
        return NextResponse.json({ youtubeId: id });
      }
    }

    return NextResponse.json({ youtubeId: null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
