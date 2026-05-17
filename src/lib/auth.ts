import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SECRET = process.env.NEXTAUTH_SECRET!;

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(req: NextRequest): string | null {
  try {
    const header = req.headers.get('Authorization');
    if (!header?.startsWith('Bearer ')) return null;
    const token = header.slice(7);
    const payload = jwt.verify(token, SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}
