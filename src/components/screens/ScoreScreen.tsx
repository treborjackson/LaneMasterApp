'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useGames } from '@/hooks/useGames';
import { calcRunningScores } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Frame } from '@/lib/types/game';

function initFrames(): Frame[] {
  return Array.from({ length: 10 }, () => ({ ball1: '', ball2: '', ball3: '', note: '' }));
}

function nextBall(frames: Frame[]): { fi: number; ball: 'ball1' | 'ball2' | 'ball3' } | null {
  for (let i = 0; i < 10; i++) {
    const f = frames[i];
    if (!f.ball1) return { fi: i, ball: 'ball1' };
    if (i < 9 && f.ball1 !== 'X' && !f.ball2) return { fi: i, ball: 'ball2' };
    if (i === 9) {
      if (!f.ball2) return { fi: i, ball: 'ball2' };
      if ((f.ball1 === 'X' || f.ball2 === '/') && !f.ball3) return { fi: i, ball: 'ball3' };
    }
  }
  return null;
}

function validOptions(frames: Frame[], fi: number, ball: 'ball1' | 'ball2' | 'ball3'): string[] {
  const f  = frames[fi];
  const b1 = f.ball1;

  if (ball === 'ball1') return ['X', '9','8','7','6','5','4','3','2','1','-'];

  if (ball === 'ball2') {
    if (fi === 9 && b1 === 'X') return ['X','9','8','7','6','5','4','3','2','1','-'];
    const pins = b1 === '-' ? 10 : b1 === 'X' ? 0 : 10 - (parseInt(b1) || 0);
    const nums: string[] = [];
    for (let p = pins - 1; p >= 1; p--) nums.push(String(p));
    return ['/', ...nums, '-'];
  }

  if (ball === 'ball3') {
    const b2 = f.ball2;
    if (b2 === '/') return ['X','9','8','7','6','5','4','3','2','1','-'];
    if (b1 === 'X' && b2 === 'X') return ['X','9','8','7','6','5','4','3','2','1','-'];
    if (b1 === 'X') {
      const pins2 = b2 === '-' ? 10 : 10 - (parseInt(b2) || 0);
      const nums: string[] = [];
      for (let p = pins2 - 1; p >= 1; p--) nums.push(String(p));
      return ['/', ...nums, '-'];
    }
    return ['X','9','8','7','6','5','4','3','2','1','-'];
  }
  return [];
}

function BallBox({ value, active }: { value: string; active: boolean }) {
  const strike = value === 'X';
  const spare  = value === '/';
  return (
    <div
      className="flex items-center justify-center font-bold"
      style={{
        width: 15, height: 15, fontSize: 9, borderRadius: 2,
        background: strike ? '#c0392b' : spare ? '#2e6da4' : value ? 'var(--bg-deep)' : 'transparent',
        color: strike || spare ? '#fff' : 'var(--text-primary)',
        border: active
          ? '1.5px solid var(--accent)'
          : value
          ? '1px solid var(--border)'
          : '1px dashed #3a2a14',
        boxShadow: active ? '0 0 4px var(--accent)' : 'none',
      }}
    >
      {value}
    </div>
  );
}

export function ScoreScreen() {
  const { token, setActiveTab } = useAppStore();
  const { saveGame }            = useGames();
  const [frames, setFrames]     = useState<Frame[]>(initFrames());
  const [saved, setSaved]       = useState(false);

  const current       = nextBall(frames);
  const runningScores = calcRunningScores(frames);
  const total         = runningScores.filter(Boolean).pop() ?? 0;
  const isComplete    = current === null;

  function enter(value: string) {
    if (!current) return;
    const { fi, ball } = current;
    setFrames((prev) => {
      const next = prev.map((f) => ({ ...f }));
      next[fi] = { ...next[fi], [ball]: value };
      return next;
    });
    setSaved(false);
  }

  function undoLast() {
    setFrames((prev) => {
      const next = prev.map((f) => ({ ...f }));
      for (let i = 9; i >= 0; i--) {
        const f = next[i];
        if (i === 9 && f.ball3) { f.ball3 = ''; return next; }
        if (f.ball2 && (i === 9 || f.ball1 !== 'X')) { f.ball2 = ''; return next; }
        if (f.ball1) { f.ball1 = ''; return next; }
      }
      return next;
    });
    setSaved(false);
  }

  function newGame() { setFrames(initFrames()); setSaved(false); }

  async function handleSave() {
    if (!token) { setActiveTab('history'); return; }
    await saveGame({ totalScore: total as number, ballUsed: null, laneNumber: null, oilPattern: null, frames });
    setSaved(true);
  }

  const options = current ? validOptions(frames, current.fi, current.ball) : [];

  return (
    <div className="pb-4">
      <PageHeader title="Scorecard" subtitle="Track your game" emoji="📊" />

      {/* ── Horizontal scorecard ── */}
      <div className="px-3 mb-3 overflow-x-auto">
        {/* Frame number row */}
        <div className="flex mb-0.5" style={{ paddingLeft: 0 }}>
          {frames.map((_, i) => (
            <div
              key={i}
              className="text-center text-[9px] font-semibold"
              style={{ width: i === 9 ? 58 : 36, color: 'var(--text-faint)', flexShrink: 0 }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Frame cells */}
        <div
          className="flex rounded-lg overflow-hidden border"
          style={{ borderColor: 'var(--border)' }}
        >
          {frames.map((frame, i) => {
            const isActive  = current?.fi === i;
            const score     = runningScores[i];
            const is10      = i === 9;
            const isStrike  = !is10 && frame.ball1 === 'X';
            const show3rd   = is10 && (frame.ball1 === 'X' || frame.ball2 === '/');

            return (
              <div
                key={i}
                className="flex flex-col border-r"
                style={{
                  width: is10 ? 58 : 36,
                  flexShrink: 0,
                  borderColor: 'var(--border)',
                  background: isActive ? 'var(--bg-muted)' : 'var(--bg-card)',
                  borderBottom: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
                }}
              >
                {/* Ball boxes — top right */}
                <div className="flex justify-end gap-0.5 pt-1 pr-1">
                  {!isStrike && (
                    <BallBox value={frame.ball1} active={isActive && current?.ball === 'ball1'} />
                  )}
                  {isStrike ? (
                    <BallBox value={frame.ball1} active={isActive && current?.ball === 'ball1'} />
                  ) : (
                    <BallBox value={frame.ball2} active={isActive && current?.ball === 'ball2'} />
                  )}
                  {show3rd && (
                    <BallBox value={frame.ball3} active={isActive && current?.ball === 'ball3'} />
                  )}
                  {is10 && !show3rd && frame.ball2 !== '/' && frame.ball1 !== 'X' && (
                    <BallBox value={frame.ball3} active={false} />
                  )}
                </div>

                {/* Running score */}
                <div className="flex-1 flex items-center justify-center pb-1">
                  <span
                    className="font-bold tabular-nums"
                    style={{
                      fontSize: score !== null && score >= 100 ? 11 : 13,
                      color: score !== null ? 'var(--text-primary)' : 'transparent',
                    }}
                  >
                    {score ?? 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Total ── */}
      <div
        className="mx-3 mb-4 py-2 rounded-xl text-center border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-faint)' }}>TOTAL</p>
        <p className="text-5xl font-bold leading-none" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
          {total}
        </p>
      </div>

      {/* ── Entry pad ── */}
      {current && (
        <div className="px-3">
          <p className="text-[10px] text-center mb-2" style={{ color: 'var(--text-faint)' }}>
            Frame {current.fi + 1} &nbsp;·&nbsp;
            {current.ball === 'ball1' ? '1st ball' : current.ball === 'ball2' ? '2nd ball' : '3rd ball'}
          </p>

          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => enter(opt)}
                className="py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                style={{
                  background:
                    opt === 'X' ? '#c0392b'
                    : opt === '/' ? '#2e6da4'
                    : 'var(--bg-card)',
                  color: opt === 'X' || opt === '/' ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={undoLast}
            className="w-full py-2 rounded-xl text-xs border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-faint)', background: 'var(--bg-muted)' }}
          >
            ← Undo
          </button>
        </div>
      )}

      {/* ── Save / New Game ── */}
      {isComplete && (
        <div className="px-3 mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
          >
            {saved ? '✅ Saved' : '💾 Save Game'}
          </button>
          <button
            onClick={newGame}
            className="px-4 py-3 rounded-xl text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            New Game
          </button>
        </div>
      )}
    </div>
  );
}
