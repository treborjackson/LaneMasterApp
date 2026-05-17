import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!prefs) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    ...prefs,
    favoriteBrands: JSON.parse(prefs.favoriteBrands),
  });
}

export async function PUT(req: NextRequest) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const updated = await prisma.userPreferences.upsert({
    where:  { userId },
    update: {
      bowlingStyle:   body.bowlingStyle,
      skillLevel:     body.skillLevel,
      selectedBall:   body.selectedBall,
      favoriteBrands: body.favoriteBrands ? JSON.stringify(body.favoriteBrands) : undefined,
    },
    create: {
      userId,
      bowlingStyle:   body.bowlingStyle   ?? 'onehand',
      skillLevel:     body.skillLevel     ?? 'beginner',
      selectedBall:   body.selectedBall   ?? null,
      favoriteBrands: body.favoriteBrands ? JSON.stringify(body.favoriteBrands) : '[]',
    },
  });

  return NextResponse.json({
    ...updated,
    favoriteBrands: JSON.parse(updated.favoriteBrands),
  });
}
