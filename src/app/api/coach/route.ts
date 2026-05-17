import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { reply: "AI coaching isn't set up yet — add your ANTHROPIC_API_KEY to .env.local to enable this feature." },
      { status: 200 }
    );
  }

  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages, bowlingStyle, skillLevel, ball } = await req.json();

  const styleCtx = bowlingStyle === 'twohand'
    ? 'The user is a TWO-HANDED bowler (no thumb). Focus on two-hand mechanics, axis tilt, rev rate, balance, and Belmonte-style delivery.'
    : 'The user is a ONE-HANDED bowler (thumb in). Focus on conventional swing mechanics, release timing, axis rotation, and footwork.';

  const levelCtx: Record<string, string> = {
    beginner:     'The user is a BEGINNER. Use simple language, avoid jargon, focus on fundamentals.',
    intermediate: 'The user is INTERMEDIATE. They want consistency, hook control, and lane reading skills.',
    advanced:     'The user is ADVANCED. Provide technical detail on mechanics, lane play, and tournament strategy.',
  };

  const ballCtx = ball
    ? `Their ball: ${ball.name} (${ball.brand}, ${ball.cover}, hook ${ball.hook}/10).`
    : '';

  const system = [
    'You are an expert bowling coach.',
    styleCtx,
    levelCtx[skillLevel] ?? '',
    ballCtx,
    'Keep responses concise — 2-3 sentences unless a list is needed.',
  ].filter(Boolean).join(' ');

  const response = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 512,
    system,
    messages,
  });

  const reply = response.content[0].type === 'text' ? response.content[0].text : '';
  return NextResponse.json({ reply });
}
