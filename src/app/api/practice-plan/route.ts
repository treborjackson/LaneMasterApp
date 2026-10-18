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

  const FOCUS_GUIDES: Record<string, string> = {
    'Spare Shooting': 'ALL drills must be spare shooting only — 7-pin, 10-pin, 3-6-9 spare system, corner pins, baby splits. No strike drills.',
    'Accuracy':       'ALL drills must target hitting a specific arrow or board repeatedly. Focus on repeating the same shot, targeting boards 1-39 and the 7 arrows.',
    'Hook & Entry':   'ALL drills must work on hook shape, entry angle, and hitting the pocket. Use different release techniques, target the 3rd-4th arrow, adjust launch angles.',
    'Ball Speed':     'ALL drills must focus on controlling and varying ball speed. Include slow-down drills, speed consistency, and matching speed to lane conditions.',
    'Mental Game':    'ALL drills must focus on pre-shot routine, breathing, focus between shots, and bouncing back from bad shots. Include visualization drills.',
    'Full Game':      'Include a balanced mix: 1-2 spare drills, 1-2 accuracy/strike drills, 1 consistency drill, and 1 mental drill.',
  };

  const focusGuide = FOCUS_GUIDES[focus] ?? FOCUS_GUIDES['Full Game'];

  const context = [
    `Skill level: ${skillLevel || 'intermediate'}`,
    `Handedness: ${handedness || 'right'}`,
    avgScore ? `Recent average score: ${avgScore}` : null,
    goals?.length ? `Goals: ${goals.join(', ')}` : null,
    ballNotes.length ? `Balls in bag: ${ballNotes.map((b) => `${b.brand} ${b.ballName}`).join(', ')}` : null,
  ].filter(Boolean).join('\n');

  const prompt = `You are a bowling coach. Create a fun, personalized practice plan for this bowler.

TODAY'S FOCUS: ${focus}
FOCUS RULE: ${focusGuide}

Bowler context:
${context}

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{
  "title": "short catchy plan title related to the focus",
  "theme": "one-line description of what today's session will achieve",
  "duration": "estimated total time like '45 min'",
  "drills": [
    {
      "id": "1",
      "emoji": "single emoji",
      "name": "fun exciting drill name",
      "description": "specific instruction with board numbers, arrows, pin targets",
      "goal": 15,
      "goalLabel": "shots",
      "type": "spare|accuracy|consistency|speed|mental",
      "tip": "one quick pro tip"
    }
  ]
}

Rules:
- Include 4-6 drills, ALL matching the focus rule above — do NOT mix in drills from other categories
- Make drill names fun and exciting (e.g. "Corner Pin Destroyer", "Arrow Sniper")
- Be specific: board numbers, arrow numbers, pin targets, foot positions
- Goal numbers should be realistic (10-25 per drill)
- Tips must be specific to the drill
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
