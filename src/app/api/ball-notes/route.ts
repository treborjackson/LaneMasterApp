import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notes = await prisma.ballNote.findMany({
    where: { userId },
    orderBy: { dateAdded: 'desc' },
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ballName, brand, rating, notes } = await req.json();

  const note = await prisma.ballNote.upsert({
    where:  { userId_ballName: { userId, ballName } },
    update: { brand, rating, notes },
    create: { userId, ballName, brand, rating: rating ?? 0, notes: notes ?? '' },
  });

  return NextResponse.json(note, { status: 201 });
}
