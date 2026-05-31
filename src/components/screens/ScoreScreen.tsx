'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useGames } from '@/hooks/useGames';
import { calcBowlingScore } from '@/lib/utils';
import { WoodCard } from '@/components/ui/WoodCard';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Frame } from '@/lib/types/game';

const EMPTY_FRAME: Frame = { ball1: '', ball2: '', ball3: '', note: '' };

const STRIKE_OPTIONS = ['X', '/', '-', '1','2','3','4','5','6','7','8','9'];

function initFrames(): Frame[] {
  return Array.from({ length: 10 }, () => ({ ...EMPTY_FRAME }));
}

export function ScoreScreen() {
  const { token, setActiveTab } = useAppStore();
  const { saveGame }            = useGames();
  const [frames, setFrames]     = useState<Frame[]>(initFrames());
  const [saved, setSaved]       = useState(false);

  const totalScore = calcBowlingScore(frames);
  const is10thFull = frames[9].ball1 !== '' && frames[9].ball2 !== '';

  function updateFrame(idx: number, field: keyof Frame, value: string) {
    setFrames((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    if (!token) { setActiveTab('history'); return; }
    await saveGame({ totalScore, ballUsed: null, laneNumber: null, oilPattern: null, frames });
    setSaved(true);
  }

  function handleReset() {
    setFrames(initFrames());
    setSaved(false);
  }

  return (
    <div className="pb-4">
      <PageHeader title="Scorecard" subtitle="Track your game frame by frame" emoji="📊" />

      {/* Score total */}
      <div className="mx-4 mb-4 rounded-xl p-4 text-center border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs mb-1" style={{ color: 'var(--text-faint)' }}>Total Score</p>
        <p className="text-5xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
          {totalScore}
        </p>
      </div>

      {/* Frames */}
      <div className="px-4 flex flex-col gap-3">
        {frames.map((frame, i) => {
          const is10th = i === 9;
          return (
            <WoodCard key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  Frame {i + 1}{is10th ? ' (10th)' : ''}
                </span>
                {frame.ball1 === 'X' && !is10th && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--red)', color: '#fff' }}>STRIKE</span>
                )}
              </div>

              <div className="flex gap-2 mb-2">
                {(['ball1', 'ball2', ...(is10th ? ['ball3'] : [])] as (keyof Frame)[]).map((field) => (
                  <div key={field} className="flex-1">
                    <p className="text-xs mb-1 text-center" style={{ color: 'var(--text-faint)' }}>
                      {field === 'ball1' ? '1st' : field === 'ball2' ? '2nd' : '3rd'}
                    </p>
                    <select
                      value={frame[field]}
                      onChange={(e) => updateFrame(i, field, e.target.value)}
                      className="w-full text-center rounded-lg py-1 text-sm border outline-none"
                      style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      <option value="">—</option>
                      {STRIKE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <input
                type="text"
                placeholder="Frame note (optional)"
                value={frame.note}
                onChange={(e) => updateFrame(i, 'note', e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg border outline-none"
                style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </WoodCard>
          );
        })}
      </div>

      {/* Save / Reset */}
      {is10thFull && (
        <div className="px-4 mt-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
          >
            {saved ? '✅ Saved!' : '💾 Save Game'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-xl text-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
