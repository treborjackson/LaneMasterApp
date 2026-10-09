import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const games = await prisma.gameSession.findMany({
    where: { userId },
    orderBy: { datePlayed: 'desc' },
    take: 50,
  });

  return NextResponse.json(
    games.map((g) => ({ ...g, frames: JSON.parse(g.frames) }))
  );
}

export async function POST(req: NextRequest) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const game = await prisma.gameSession.create({
      data: {
        userId,
        totalScore:       body.totalScore       ?? 0,
        ballUsed:         body.ballUsed         ?? null,
        laneNumber:       body.laneNumber       ?? null,
        oilPattern:       body.oilPattern       ?? null,
        bowlingAlley:     body.bowlingAlley     ?? null,
        stance:           body.stance           ?? null,
        targetArrow:      body.targetArrow      ?? null,
        boardAdjustments: body.boardAdjustments ?? null,
        frames:           JSON.stringify(body.frames ?? []),
      } as Parameters<typeof prisma.gameSession.create>[0]['data'],
    });
    return NextResponse.json({ ...game, frames: JSON.parse(game.frames) }, { status: 201 });
  } catch (err) {
    console.error('Save game error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
