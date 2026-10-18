import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
  }

  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { skillLevel, handedness, goals, focus } = await req.json();

  const [recentGames, ballNotes] = await Promise.all([
    prisma.gameSession.findMany({
      where: { userId },
      orderBy: { datePlayed: 'desc' },
      take: 5,
      select: { totalScore: true, ballUsed: true, boardAdjustments: true, oilPattern: true },
    }).catch(() => []),
    prisma.ballNote.findMany({
      where: { userId },
      orderBy: { dateAdded: 'desc' },
      take: 3,
      select: { ballName: true, brand: true, notes: true },
    }).catch(() => []),
  ]);

  const avgScore = recentGames.length
    ? Math.round(recentGames.reduce((s, g) => s + g.totalScore, 0) / recentGames.length)
    : null;

  const FOCUS_DRILLS: Record<string, { type: string; examples: string }> = {
    'Spare Shooting': {
      type: 'spare',
      examples: '10-pin pickup, 7-pin pickup, 3-6-9 spare system, baby split conversion, corner pin drill',
    },
    'Accuracy': {
      type: 'accuracy',
      examples: 'hit a specific arrow 15 times in a row, board targeting drill, walk the line drill, repeat release drill',
    },
    'Hook & Entry': {
      type: 'consistency',
      examples: 'pocket entry angle drill, rev rate control, axis tilt adjustment, breakpoint targeting, 2nd arrow entry drill',
    },
    'Ball Speed': {
      type: 'speed',
      examples: 'slow ball drill, speed control drill, match speed to oil, heavy oil speed adjustment, timed delivery drill',
    },
    'Mental Game': {
      type: 'mental',
      examples: 'pre-shot routine drill, 10-breath reset drill, visualization between shots, pressure shot drill, bounce-back drill after a bad frame',
    },
    'Full Game': {
      type: 'consistency',
      examples: 'mix of spare, strike line, speed, and mental drills across a full game',
    },
  };

  const focusInfo = FOCUS_DRILLS[focus] ?? FOCUS_DRILLS['Full Game'];

  const context = [
    `Skill: ${skillLevel || 'intermediate'}, ${handedness || 'right'}-handed`,
    avgScore ? `Avg score: ${avgScore}` : null,
    ballNotes.length ? `Balls: ${ballNotes.map((b) => `${b.brand} ${b.ballName}`).join(', ')}` : null,
  ].filter(Boolean).join(' | ');

  const prompt = `Create a bowling practice plan. The ONLY focus is: ${focus.toUpperCase()}.

Every single drill must be a "${focus}" drill. Do not include any other type of drill.
Example drill types for this focus: ${focusInfo.examples}

Bowler: ${context}

Return raw JSON only, no markdown:
{
  "title": "catchy title about ${focus}",
  "theme": "what this ${focus} session will improve",
  "duration": "30-45 min",
  "drills": [
    {
      "id": "1",
      "emoji": "emoji",
      "name": "fun drill name",
      "description": "exact instructions: boards, arrows, pins, reps",
      "goal": 15,
      "goalLabel": "shots",
      "type": "${focusInfo.type}",
      "tip": "specific coaching tip"
    }
  ]
}

Generate 5 drills. All 5 must be ${focus} drills only. Be specific with board numbers and arrow numbers.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: `You are a bowling coach who creates practice plans. When given a focus area, you ONLY create drills for that specific focus. You never mix in other drill types. You respond with raw JSON only — no markdown, no explanation, no extra text.`,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '{}';
    const clean = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const plan = JSON.parse(clean);
    return NextResponse.json(plan);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
