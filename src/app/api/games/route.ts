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

  const body = await req.json();
  const game = await prisma.gameSession.create({
    data: {
      userId,
      totalScore: body.totalScore ?? 0,
      ballUsed:   body.ballUsed   ?? null,
      laneNumber: body.laneNumber ?? null,
      oilPattern: body.oilPattern ?? null,
      frames:     JSON.stringify(body.frames ?? []),
    },
  });

  return NextResponse.json({ ...game, frames: JSON.parse(game.frames) }, { status: 201 });
}
