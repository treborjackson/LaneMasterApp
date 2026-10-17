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

  const context = [
    `Skill level: ${skillLevel || 'intermediate'}`,
    `Handedness: ${handedness || 'right'}`,
    avgScore ? `Recent average score: ${avgScore}` : null,
    goals?.length ? `Goals: ${goals.join(', ')}` : null,
    focus ? `Practice focus today: ${focus}` : null,
    ballNotes.length ? `Balls in bag: ${ballNotes.map((b) => `${b.brand} ${b.ballName}`).join(', ')}` : null,
  ].filter(Boolean).join('\n');

  const prompt = `You are a bowling coach. Create a fun, personalized practice plan for this bowler.

Bowler context:
${context}

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{
  "title": "short catchy plan title",
  "theme": "one-line theme/focus description",
  "duration": "estimated total time like '45 min'",
  "drills": [
    {
      "id": "1",
      "emoji": "single emoji",
      "name": "drill name",
      "description": "specific instruction with board numbers, arrows, pin targets",
      "goal": 15,
      "goalLabel": "shots",
      "type": "spare|accuracy|consistency|speed|mental",
      "tip": "one quick pro tip"
    }
  ]
}

Rules:
- Include 4-6 drills
- Make drill names fun and exciting (e.g. "Corner Pin Destroyer", "Arrow Sniper")
- Be specific with board numbers and arrows (e.g. "stand on board 20, target 2nd arrow")
- Mix spare shooting, accuracy, and consistency drills
- Goal numbers should be realistic (10-25 shots per drill)
- Tips should be practical and actionable
- Keep it fun and motivating`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
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
