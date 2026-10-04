import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

const MEMORY_TRIGGER = 6; // save memory after this many messages in a session

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

  const { messages, bowlingStyle, handedness, goals, ball } = await req.json();

  // Fetch user context + existing memory in parallel — each fails gracefully
  const [user, recentGames, ballNotes, existingMemory] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }).catch(() => null),
    prisma.gameSession.findMany({
      where: { userId },
      orderBy: { datePlayed: 'desc' },
      take: 10,
      select: { totalScore: true, ballUsed: true, oilPattern: true, datePlayed: true },
    }).catch(() => []),
    prisma.ballNote.findMany({
      where: { userId },
      orderBy: { dateAdded: 'desc' },
      take: 5,
      select: { ballName: true, brand: true, rating: true, notes: true },
    }).catch(() => []),
    prisma.coachMemory.findUnique({ where: { userId }, select: { summary: true, updatedAt: true } }).catch(() => null),
  ]);

  const handCtx  = handedness === 'left' ? 'left-handed' : 'right-handed';
  const styleCtx = bowlingStyle === 'twohand'
    ? `The user is a ${handCtx} TWO-HANDED bowler (no thumb). Focus on two-hand mechanics, axis tilt, rev rate, balance, and Belmonte-style delivery.`
    : `The user is a ${handCtx} ONE-HANDED bowler (thumb in). Focus on conventional swing mechanics, release timing, axis rotation, and footwork. Note lane play and arrow targeting from the ${handedness === 'left' ? 'left' : 'right'} side.`;

  const ballCtx  = ball ? `Current ball: ${ball.name} (${ball.brand}, ${ball.cover}, hook ${ball.hook}/10).` : '';
  const nameCtx  = user?.name ? `The bowler's name is ${user.name}.` : '';

  let historyCtx = '';
  if (recentGames.length > 0) {
    const avg  = Math.round(recentGames.reduce((s, g) => s + g.totalScore, 0) / recentGames.length);
    const best  = Math.max(...recentGames.map((g) => g.totalScore));
    const worst = Math.min(...recentGames.map((g) => g.totalScore));
    const recentList = recentGames
      .slice(0, 5)
      .map((g) => `${g.totalScore}${g.ballUsed ? ` (${g.ballUsed})` : ''}${g.oilPattern ? ` on ${g.oilPattern}` : ''}`)
      .join(', ');
    historyCtx = `Recent game history (last ${recentGames.length} games): average ${avg}, best ${best}, worst ${worst}. Last 5 scores: ${recentList}.`;
  }

  let ballNotesCtx = '';
  if (ballNotes.length > 0) {
    ballNotesCtx = `Their ball arsenal: ${ballNotes.map((b) => `${b.ballName} by ${b.brand} (rated ${b.rating}/10${b.notes ? `: ${b.notes}` : ''})`).join('; ')}.`;
  }

  const goalsCtx = goals?.length
    ? `This bowler's goals are: ${(goals as string[]).map((g, i) => `${i + 1}) ${g}`).join('; ')}. Keep every response connected to these goals — reference them when relevant and celebrate progress toward them.`
    : '';

  // Coaching memory from previous sessions
  const memoryCtx = existingMemory?.summary
    ? `Coaching memory from previous sessions: ${existingMemory.summary}`
    : '';

  const system = [
    'You are a personal AI bowling coach with full knowledge of this bowler\'s history, equipment, goals, and past coaching sessions.',
    nameCtx,
    styleCtx,
    ballCtx,
    historyCtx,
    ballNotesCtx,
    goalsCtx,
    memoryCtx,
    'Adapt your language and depth to match the bowler. Use their actual scores, equipment, goals, and coaching history to give specific, personalized advice. Keep responses concise — 2-3 sentences unless a drill or list is needed.',
  ].filter(Boolean).join(' ');

  let response;
  try {
    response = await anthropic.messages.create({
      model:      'claude-sonnet-5-5',
      max_tokens: 512,
      system,
      messages,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[coach] anthropic error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const reply = response.content[0].type === 'text' ? response.content[0].text : '';

  // Save memory after enough messages — fire and forget, don't block the reply
  const shouldSaveMemory = messages.length >= MEMORY_TRIGGER &&
    (messages.length === MEMORY_TRIGGER || messages.length % 10 === 0);

  if (shouldSaveMemory) {
    const allMessages = [...messages, { role: 'assistant', content: reply }];
    void saveMemory(userId, allMessages, goals ?? []);
  }

  return NextResponse.json({ reply });
}

async function saveMemory(userId: string, messages: { role: string; content: string }[], goals: string[]) {
  try {
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'Bowler' : 'Coach'}: ${m.content}`)
      .join('\n');

    const goalsLine = goals.length ? `The bowler's goals are: ${goals.join(', ')}.` : '';

    const summaryResponse = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system:     'You are summarizing a bowling coaching session for future reference. Be concise and specific.',
      messages:   [{
        role:    'user',
        content: `${goalsLine}\n\nSummarize this coaching session in 3-5 bullet points. Focus on: what the bowler worked on, specific advice given, areas still needing improvement, and any progress toward their goals. Keep each point brief.\n\n${transcript}`,
      }],
    });

    const summary = summaryResponse.content[0].type === 'text' ? summaryResponse.content[0].text : '';
    if (!summary) return;

    await prisma.coachMemory.upsert({
      where:  { userId },
      update: { summary },
      create: { userId, summary },
    });
  } catch {
    // Memory save failing should never affect the chat
  }
}
