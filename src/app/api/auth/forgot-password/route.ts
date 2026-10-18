import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();
    console.log('[forgot-password] looking up:', normalizedEmail);
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    console.log('[forgot-password] user found:', !!user);

    // Always return success so we don't reveal whether the email exists
    if (!user) return NextResponse.json({ ok: true, debug: 'no user found' });

    // Invalidate any existing unused tokens
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data:  { usedAt: new Date() },
    });

    const token     = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });

    const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
    let emailError: string | null = null;
    await sendPasswordResetEmail(email, resetUrl).catch((err) => {
      emailError = err?.message ?? String(err);
      console.error('[forgot-password] email error:', emailError);
    });

    return NextResponse.json({ ok: true, emailError });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
