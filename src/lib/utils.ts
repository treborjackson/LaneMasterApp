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

export function calcBowlingScore(frames: Frame[]): number {
  const rolls: number[] = [];

  for (let i = 0; i < Math.min(frames.length, 10); i++) {
    const f = frames[i];
    const parseRoll = (v: string, prev?: number): number => {
      if (v === 'X') return 10;
      if (v === '/') return 10 - (prev ?? 0);
      if (v === '-') return 0;
      return parseInt(v) || 0;
    };

    const b1 = parseRoll(f.ball1);
    const b2 = parseRoll(f.ball2, b1);
    rolls.push(b1);
    if (b1 !== 10) rolls.push(b2);

    // 10th frame bonus ball
    if (i === 9 && f.ball3) {
      const b3 = parseRoll(f.ball3, b1 === 10 ? 0 : b2);
      rolls.push(b3);
    }
  }

  let score = 0;
  let ri = 0;
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
