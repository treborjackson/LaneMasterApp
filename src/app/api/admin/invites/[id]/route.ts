import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';

async function requireAdmin(req: NextRequest): Promise<boolean> {
  const userId = verifyToken(req);
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return user?.email === ADMIN_EMAIL;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.invite.update({ where: { id }, data: { status: 'revoked' } });
  return NextResponse.json({ ok: true });
}
