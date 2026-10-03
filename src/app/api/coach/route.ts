import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    return NextResponse.json(
      { reply: "AI coaching isn't set up yet — add your ANTHROPIC_API_KEY to .env.local to enable this feature." },
      { status: 200 }
    );
  }

  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages, bowlingStyle, handedness, ball } = await req.json();

  // Fetch user context from DB in parallel
  const [user, recentGames, ballNotes] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.gameSession.findMany({
      where: { userId },
      orderBy: { datePlayed: 'desc' },
      take: 10,
      select: { totalScore: true, ballUsed: true, oilPattern: true, datePlayed: true },
    }),
    prisma.ballNote.findMany({
      where: { userId },
      orderBy: { dateAdded: 'desc' },
      take: 5,
      select: { ballName: true, brand: true, rating: true, notes: true },
    }),
  ]);

  const handCtx  = handedness === 'left' ? 'left-handed' : 'right-handed';
  const styleCtx = bowlingStyle === 'twohand'
    ? `The user is a ${handCtx} TWO-HANDED bowler (no thumb). Focus on two-hand mechanics, axis tilt, rev rate, balance, and Belmonte-style delivery.`
    : `The user is a ${handCtx} ONE-HANDED bowler (thumb in). Focus on conventional swing mechanics, release timing, axis rotation, and footwork. Note lane play and arrow targeting from the ${handedness === 'left' ? 'left' : 'right'} side.`;

  const ballCtx = ball
    ? `Current ball: ${ball.name} (${ball.brand}, ${ball.cover}, hook ${ball.hook}/10).`
    : '';

  // Build personal history context
  const nameCtx = user?.name ? `The bowler's name is ${user.name}.` : '';

  let historyCtx = '';
  if (recentGames.length > 0) {
    const avg = Math.round(recentGames.reduce((s, g) => s + g.totalScore, 0) / recentGames.length);
    const best = Math.max(...recentGames.map((g) => g.totalScore));
    const worst = Math.min(...recentGames.map((g) => g.totalScore));
    const recentList = recentGames
      .slice(0, 5)
      .map((g) => `${g.totalScore}${g.ballUsed ? ` (${g.ballUsed})` : ''}${g.oilPattern ? ` on ${g.oilPattern}` : ''}`)
      .join(', ');
    historyCtx = `Recent game history (last ${recentGames.length} games): average ${avg}, best ${best}, worst ${worst}. Last 5 scores: ${recentList}.`;
  }

  let ballNotesCtx = '';
  if (ballNotes.length > 0) {
    const notesList = ballNotes
      .map((b) => `${b.ballName} by ${b.brand} (rated ${b.rating}/10${b.notes ? `: ${b.notes}` : ''})`)
      .join('; ');
    ballNotesCtx = `Their ball arsenal: ${notesList}.`;
  }

  const system = [
    'You are a personal AI bowling coach with full knowledge of this bowler\'s history and equipment.',
    nameCtx,
    styleCtx,
    ballCtx,
    historyCtx,
    ballNotesCtx,
    'Adapt your language and depth to match the bowler — read their questions and history to gauge their experience, then respond at the right level without labeling them. Use their actual scores and equipment to give specific, personalized advice. Keep responses concise — 2-3 sentences unless a drill or list is needed.',
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
