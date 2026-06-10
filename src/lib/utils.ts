import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Frame } from '@/lib/types/game';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

function parseRoll(v: string, prev = 0): number {
  if (!v) return NaN;
  if (v === 'X') return 10;
  if (v === '/') return 10 - prev;
  if (v === '-') return 0;
  return parseInt(v) || 0;
}

function buildRolls(frames: Frame[]): number[] {
  const R: number[] = [];
  for (let i = 0; i < 10; i++) {
    const f  = frames[i];
    const b1 = parseRoll(f.ball1);
    const b2 = parseRoll(f.ball2, isNaN(b1) ? 0 : b1);
    R.push(b1);
    if (isNaN(b1) || b1 !== 10 || i === 9) R.push(b2);
    if (i === 9 && f.ball3) R.push(parseRoll(f.ball3, b1 === 10 ? (isNaN(b2) ? 0 : b2) : 0));
  }
  return R;
}

export function calcBowlingScore(frames: Frame[]): number {
  const rolls = buildRolls(frames).map((r) => (isNaN(r) ? 0 : r));
  let score = 0;
  let ri    = 0;
  for (let frame = 0; frame < 10 && ri < rolls.length; frame++) {
    if (rolls[ri] === 10) {
      score += 10 + (rolls[ri + 1] ?? 0) + (rolls[ri + 2] ?? 0);
      ri += 1;
    } else if ((rolls[ri] ?? 0) + (rolls[ri + 1] ?? 0) === 10) {
      score += 10 + (rolls[ri + 2] ?? 0);
      ri += 2;
    } else {
      score += (rolls[ri] ?? 0) + (rolls[ri + 1] ?? 0);
      ri += 2;
    }
  }
  return Math.min(score, 300);
}

// Returns cumulative score after each frame, or null if that frame can't be scored yet
export function calcRunningScores(frames: Frame[]): (number | null)[] {
  const R   = buildRolls(frames);
  const G   = (i: number) => R[i] ?? NaN;
  const out: (number | null)[] = [];
  let ri  = 0;
  let cum = 0;

  for (let f = 0; f < 10; f++) {
    if (f === 9) {
      const fr   = frames[9];
      const b1   = parseRoll(fr.ball1);
      const b2   = parseRoll(fr.ball2, isNaN(b1) ? 0 : b1);
      const need3 = fr.ball1 === 'X' || fr.ball2 === '/';
      if (!fr.ball1 || !fr.ball2 || (need3 && !fr.ball3)) {
        out.push(null);
      } else {
        const b3 = need3 ? parseRoll(fr.ball3, b1 === 10 ? (isNaN(b2) ? 0 : b2) : 0) : 0;
        cum += (isNaN(b1) ? 0 : b1) + (isNaN(b2) ? 0 : b2) + (need3 && !isNaN(b3) ? b3 : 0);
        out.push(Math.min(cum, 300));
      }
      break;
    }
    const r0 = G(ri), r1 = G(ri + 1), r2 = G(ri + 2);
    if (isNaN(r0)) { out.push(null); ri++; continue; }
    if (r0 === 10) {
      if (isNaN(r1) || isNaN(r2)) { out.push(null); ri++; continue; }
      cum += 10 + r1 + r2; out.push(cum); ri++;
    } else if (!isNaN(r1) && r0 + r1 === 10) {
      if (isNaN(r2)) { out.push(null); ri += 2; continue; }
      cum += 10 + r2; out.push(cum); ri += 2;
    } else {
      if (isNaN(r1)) { out.push(null); ri += 2; continue; }
      cum += r0 + r1; out.push(cum); ri += 2;
    }
  }
  // Pad to 10
  while (out.length < 10) out.push(null);
  return out;
}

