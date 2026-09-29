import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8),
  name:        z.string().optional(),
  inviteToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, inviteToken } = schema.parse(body);

    const invite = await prisma.invite.findUnique({ where: { token: inviteToken } });
    if (
      !invite ||
      invite.status !== 'pending' ||
      invite.email.toLowerCase() !== email.toLowerCase() ||
      invite.expiresAt < new Date()
    ) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    await prisma.userPreferences.create({ data: { userId: user.id } });
    await prisma.invite.update({ where: { id: invite.id }, data: { status: 'accepted', usedAt: new Date() } });

    const token = signToken({ userId: user.id, email: user.email });
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bad request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
