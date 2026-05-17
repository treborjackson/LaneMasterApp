import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const game = await prisma.gameSession.findFirst({ where: { id, userId } });
  if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ...game, frames: JSON.parse(game.frames) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body   = await req.json();

  const game = await prisma.gameSession.updateMany({
    where: { id, userId },
    data: {
      totalScore: body.totalScore,
      ballUsed:   body.ballUsed,
      laneNumber: body.laneNumber,
      oilPattern: body.oilPattern,
      frames:     body.frames ? JSON.stringify(body.frames) : undefined,
    },
  });

  if (game.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.gameSession.findUnique({ where: { id } });
  return NextResponse.json({ ...updated, frames: JSON.parse(updated!.frames) });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const deleted = await prisma.gameSession.deleteMany({ where: { id, userId } });
  if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
