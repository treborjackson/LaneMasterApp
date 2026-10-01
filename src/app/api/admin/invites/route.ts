import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendInviteEmail } from '@/lib/email';
import { z } from 'zod';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';

async function requireAdmin(req: NextRequest): Promise<string | null> {
  const userId = verifyToken(req);
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return userId;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const invites = await prisma.invite.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ invites });
}

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { email } = schema.parse(body);

  const existing = await prisma.invite.findFirst({
    where: { email, status: 'pending', expiresAt: { gt: new Date() } },
  });
  if (existing) {
    return NextResponse.json({ error: 'A pending invite already exists for this email' }, { status: 409 });
  }

  const token     = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite    = await prisma.invite.create({ data: { email, token, expiresAt } });

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const inviteUrl = `${appUrl}/auth/login?invite=${token}&email=${encodeURIComponent(email)}`;
  const loginUrl  = `${appUrl}/auth/login`;

  await sendInviteEmail(email, inviteUrl, loginUrl).catch(() => {});

  return NextResponse.json({ invite, inviteUrl });
}
