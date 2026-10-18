import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Reset link is invalid or has expired' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.update({
      where: { id: reset.userId },
      data:  { passwordHash },
    });

    await prisma.passwordReset.update({
      where: { id: reset.id },
      data:  { usedAt: new Date() },
    });

    const authToken = signToken({ userId: user.id, email: user.email });
    return NextResponse.json({ token: authToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
