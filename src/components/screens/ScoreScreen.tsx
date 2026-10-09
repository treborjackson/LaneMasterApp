'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useGames } from '@/hooks/useGames';
import { calcRunningScores } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Frame } from '@/lib/types/game';

const BOARD_OPTIONS = Array.from({ length: 39 }, (_, i) => `Board ${i + 1}`);
const MARK_OPTIONS = [
  '1st Arrow (board 5)',
  '2nd Arrow (board 10)',
  '3rd Arrow (board 15)',
  '4th Arrow (board 20)',
  '5th Arrow (board 25)',
  '6th Arrow (board 30)',
  '7th Arrow (board 35)',
  ...Array.from({ length: 39 }, (_, i) => `Board ${i + 1}`),
];

const selectStyle = {
  background: 'var(--bg-card)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
};

const selectAccentStyle = {
  background: 'var(--bg-card)',
  borderColor: 'var(--accent)',
  color: 'var(--text-primary)',
};

function BoardSelect({ value, onChange, accent }: { value: string; onChange: (v: string) => void; accent?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 rounded-lg text-sm border outline-none"
      style={accent ? selectAccentStyle : selectStyle}>
      <option value="">— Select —</option>
      {BOARD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function MarkSelect({ value, onChange, accent }: { value: string; onChange: (v: string) => void; accent?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 rounded-lg text-sm border outline-none"
      style={accent ? selectAccentStyle : selectStyle}>
      <option value="">— Select —</option>
      {MARK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

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
  if (ball === 'ball1') return ['X','9','8','7','6','5','4','3','2','1','-'];
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
        border: active ? '1.5px solid var(--accent)' : value ? '1px solid var(--border)' : '1px dashed #3a2a14',
        boxShadow: active ? '0 0 4px var(--accent)' : 'none',
      }}
    >
      {value}
    </div>
  );
}

interface Adjustment {
  frame: number;
  board: string;
  mark:  string;
}

export function ScoreScreen() {
  const {
    token, setActiveTab,
    lastBowlingAlley, lastLanePair,
    savedAlleys, addAlley,
    setLastBowlingAlley, setLastLanePair,
  } = useAppStore();
  const { saveGame } = useGames();

  const [frames, setFrames]   = useState<Frame[]>(initFrames());
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fixed session info
  const [bowlingAlley, setBowlingAlley] = useState(lastBowlingAlley);
  const [laneNumber,   setLaneNumber]   = useState(lastLanePair);
  const [oilPattern,   setOilPattern]   = useState('');

  // Starting position
  const [startBoard, setStartBoard] = useState('');
  const [startMark,  setStartMark]  = useState('');

  // Board & mark tracking
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [addingBoard, setAddingBoard]  = useState('');
  const [addingMark,  setAddingMark]   = useState('');
  const [editingIdx,  setEditingIdx]   = useState<number | null>(null);
  const [editBoard,   setEditBoard]    = useState('');
  const [editMark,    setEditMark]     = useState('');

  const current       = nextBall(frames);
  const runningScores = calcRunningScores(frames);
  const total         = runningScores.filter(Boolean).pop() ?? 0;
  const isComplete    = current === null;
  const currentFrame  = current ? current.fi + 1 : 10;

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

  function logAdjustment() {
    if (!addingBoard.trim() && !addingMark.trim()) return;
    setAdjustments((prev) => [
      ...prev,
      { frame: currentFrame, board: addingBoard.trim(), mark: addingMark.trim() },
    ]);
    setAddingBoard('');
    setAddingMark('');
  }

  function startEdit(idx: number) {
    setEditingIdx(idx);
    setEditBoard(adjustments[idx].board);
    setEditMark(adjustments[idx].mark);
  }

  function saveEdit() {
    if (editingIdx === null) return;
    setAdjustments((prev) =>
      prev.map((a, i) => i === editingIdx ? { ...a, board: editBoard.trim(), mark: editMark.trim() } : a)
    );
    setEditingIdx(null);
  }

  function newGame() {
    setFrames(initFrames());
    setSaved(false);
    setOilPattern('');
    setStartBoard('');
    setStartMark('');
    setAdjustments([]);
    setAddingBoard('');
    setAddingMark('');
    setEditingIdx(null);
  }

  async function handleSave() {
    if (!token) { setActiveTab('history'); return; }
    setSaving(true);
    setSaveError(null);
    setLastBowlingAlley(bowlingAlley);
    setLastLanePair(laneNumber);

    const startLine = (startBoard || startMark)
      ? `Start${startBoard ? ` · Board ${startBoard}` : ''}${startMark ? ` · ${startMark}` : ''}`
      : '';
    const boardLog = [
      startLine,
      ...adjustments.map((a) => `Frame ${a.frame}${a.board ? ` · Board ${a.board}` : ''}${a.mark ? ` · ${a.mark}` : ''}`),
    ].filter(Boolean).join(' | ');

    try {
      await saveGame({
        totalScore:       total as number,
        ballUsed:         null,
        laneNumber:       laneNumber ? parseInt(laneNumber) : null,
        oilPattern:       oilPattern   || null,
        bowlingAlley:     bowlingAlley || null,
        stance:           null,
        targetArrow:      null,
        boardAdjustments: boardLog     || null,
        frames,
      });
      if (bowlingAlley) addAlley(bowlingAlley);
      setSaved(true);
      setTimeout(() => newGame(), 1500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save game. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const options = current ? validOptions(frames, current.fi, current.ball) : [];

  return (
    <div className="pb-8">
      <PageHeader title="Scorecard" subtitle="Track your game" emoji="📊" />

      {/* Scorecard */}
      <div className="px-3 mb-2 overflow-x-auto">
        <div className="flex mb-0.5">
          {frames.map((_, i) => (
            <div key={i} className="text-center text-[9px] font-semibold"
              style={{ width: i === 9 ? 58 : 36, color: 'var(--text-faint)', flexShrink: 0 }}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {frames.map((frame, i) => {
            const isActive = current?.fi === i;
            const score    = runningScores[i];
            const is10     = i === 9;
            const isStrike = !is10 && frame.ball1 === 'X';
            const show3rd  = is10 && (frame.ball1 === 'X' || frame.ball2 === '/');
            return (
              <div key={i} className="flex flex-col border-r"
                style={{
                  width: is10 ? 58 : 36, flexShrink: 0, borderColor: 'var(--border)',
                  background: isActive ? 'var(--bg-muted)' : 'var(--bg-card)',
                  borderBottom: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
                }}>
                <div className="flex justify-end gap-0.5 pt-1 pr-1">
                  {!isStrike && <BallBox value={frame.ball1} active={isActive && current?.ball === 'ball1'} />}
                  {isStrike
                    ? <BallBox value={frame.ball1} active={isActive && current?.ball === 'ball1'} />
                    : <BallBox value={frame.ball2} active={isActive && current?.ball === 'ball2'} />}
                  {show3rd && <BallBox value={frame.ball3} active={isActive && current?.ball === 'ball3'} />}
                  {is10 && !show3rd && frame.ball2 !== '/' && frame.ball1 !== 'X' && <BallBox value={frame.ball3} active={false} />}
                </div>
                <div className="flex-1 flex items-center justify-center pb-1">
                  <span className="font-bold tabular-nums"
                    style={{ fontSize: score !== null && score >= 100 ? 11 : 13, color: score !== null ? 'var(--text-primary)' : 'transparent' }}>
                    {score ?? 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="mx-3 mb-3 py-2 rounded-xl text-center border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-faint)' }}>TOTAL</p>
        <p className="text-5xl font-bold leading-none" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
          {total}
        </p>
      </div>

      {/* Entry pad */}
      {current && (
        <div className="px-3 mb-3">
          <p className="text-[10px] text-center mb-2" style={{ color: 'var(--text-faint)' }}>
            Frame {current.fi + 1} &nbsp;·&nbsp;
            {current.ball === 'ball1' ? '1st ball' : current.ball === 'ball2' ? '2nd ball' : '3rd ball'}
          </p>
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {options.map((opt) => (
              <button key={opt} onClick={() => enter(opt)}
                className="py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                style={{
                  background: opt === 'X' ? '#c0392b' : opt === '/' ? '#2e6da4' : 'var(--bg-card)',
                  color: opt === 'X' || opt === '/' ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}>
                {opt}
              </button>
            ))}
          </div>
          <button onClick={undoLast} className="w-full py-2 rounded-xl text-xs border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-faint)', background: 'var(--bg-muted)' }}>
            ← Undo
          </button>
        </div>
      )}

      {/* Save / New Game */}
      {isComplete && (
        <div className="px-3 mb-4 space-y-2">
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saved || saving}
              className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}>
              {saving ? '⏳ Saving…' : saved ? '✅ Saved' : '💾 Save Game'}
            </button>
            <button onClick={newGame} className="px-4 py-3 rounded-xl text-sm border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              New Game
            </button>
          </div>
          {saveError && (
            <p className="text-xs text-center px-2" style={{ color: '#ef4444' }}>
              ⚠️ {saveError}
            </p>
          )}
        </div>
      )}

      {/* ── Game Notes ── */}
      <div className="px-3 space-y-3">

        {/* Fixed session info */}
        <div className="rounded-xl border p-3 space-y-2"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
            Session Info
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] mb-1 font-semibold" style={{ color: 'var(--text-faint)' }}>🎳 Bowling Alley</p>
              {savedAlleys.length > 0 ? (
                <select value={bowlingAlley} onChange={(e) => setBowlingAlley(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: 'var(--bg-deep)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">— Select or type below —</option>
                  {savedAlleys.map((a) => <option key={a} value={a}>{a}</option>)}
                  <option value="__new__">+ Add new alley…</option>
                </select>
              ) : null}
              {(savedAlleys.length === 0 || bowlingAlley === '__new__' || (bowlingAlley && !savedAlleys.includes(bowlingAlley))) && (
                <input
                  value={bowlingAlley === '__new__' ? '' : bowlingAlley}
                  onChange={(e) => setBowlingAlley(e.target.value)}
                  placeholder="e.g. AMF Bowlero"
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none mt-1"
                  style={{ background: 'var(--bg-deep)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              )}
            </div>
            <div>
              <p className="text-[10px] mb-1 font-semibold" style={{ color: 'var(--text-faint)' }}>🔢 Lane Pair</p>
              <input value={laneNumber} onChange={(e) => setLaneNumber(e.target.value)} placeholder="e.g. 7-8"
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: 'var(--bg-deep)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div>
            <p className="text-[10px] mb-1 font-semibold" style={{ color: 'var(--text-faint)' }}>🛢️ Oil Pattern</p>
            <input value={oilPattern} onChange={(e) => setOilPattern(e.target.value)} placeholder="e.g. Sport 40ft"
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--bg-deep)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Board & Mark tracking */}
        <div className="rounded-xl border p-3 space-y-2"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
            ↔️ Standing On & Mark Tracking
          </p>

          {/* Adjustment log */}
          {adjustments.map((adj, idx) => (
            <div key={idx}>
              {editingIdx === idx ? (
                /* Edit mode */
                <div className="rounded-lg p-2 space-y-2" style={{ background: 'var(--bg-deep)', border: '1px solid var(--accent)' }}>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-block"
                    style={{ background: 'var(--accent)22', color: 'var(--accent)' }}>
                    Frame {adj.frame}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Standing On</p>
                      <BoardSelect value={editBoard} onChange={setEditBoard} accent />
                    </div>
                    <div>
                      <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Mark / Arrow</p>
                      <MarkSelect value={editMark} onChange={setEditMark} accent />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}>
                      Save
                    </button>
                    <button onClick={() => setEditingIdx(null)}
                      className="px-3 py-1.5 rounded-lg text-xs border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                  style={{ background: 'var(--bg-deep)' }}>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: 'var(--accent)22', color: 'var(--accent)' }}>
                    Frame {adj.frame}
                  </span>
                  <span className="flex-1 text-xs" style={{ color: 'var(--text-primary)' }}>
                    {[adj.board ? `Standing On: ${adj.board}` : '', adj.mark ? `Mark: ${adj.mark}` : ''].filter(Boolean).join(' · ')}
                  </span>
                  <button onClick={() => startEdit(idx)}
                    className="text-[10px] px-2 py-0.5 rounded border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    Edit
                  </button>
                  <button onClick={() => setAdjustments((p) => p.filter((_, i) => i !== idx))}
                    className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add new entry */}
          <div className="rounded-lg p-2 space-y-2" style={{ background: 'var(--bg-deep)', border: '1px dashed var(--border)' }}>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-1 rounded flex-shrink-0"
                style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}>
                Frame {currentFrame}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                from scoreboard
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Standing On</p>
                <BoardSelect value={addingBoard} onChange={setAddingBoard} />
              </div>
              <div>
                <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Mark / Arrow</p>
                <MarkSelect value={addingMark} onChange={setAddingMark} />
              </div>
            </div>
            <button onClick={logAdjustment}
              disabled={!addingBoard.trim() && !addingMark.trim()}
              className="w-full py-2 rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}>
              + Add Frame {currentFrame} Adjustment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
