'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { PageHeader } from '@/components/ui/PageHeader';

interface Drill {
  id: string;
  emoji: string;
  name: string;
  description: string;
  goal: number;
  goalLabel: string;
  type: string;
  tip: string;
}

interface Plan {
  title: string;
  theme: string;
  duration: string;
  drills: Drill[];
}

const TYPE_COLORS: Record<string, string> = {
  spare:       '#f59e0b',
  accuracy:    '#3b82f6',
  consistency: '#10b981',
  speed:       '#ef4444',
  mental:      '#8b5cf6',
};

const FOCUS_OPTIONS = [
  { id: 'spare',    label: 'Spare Shooting', emoji: '🎯' },
  { id: 'accuracy', label: 'Accuracy',        emoji: '🏹' },
  { id: 'hook',     label: 'Hook & Entry',    emoji: '🔄' },
  { id: 'speed',    label: 'Ball Speed',      emoji: '⚡' },
  { id: 'mental',   label: 'Mental Game',     emoji: '🧠' },
  { id: 'general',  label: 'Full Game',        emoji: '🎳' },
];

export function PracticeScreen() {
  const { token, skillLevel, handedness, goals } = useAppStore();
  const [plan, setPlan]         = useState<Plan | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [focus, setFocus]       = useState('general');
  const [counts, setCounts]       = useState<Record<string, number>>({});
  const [done, setDone]           = useState<Record<string, boolean>>({});
  const [expandTip, setExpandTip] = useState<string | null>(null);

  async function generatePlan() {
    if (!token) return;
    setLoading(true);
    setError('');
    setCounts({});
    setDone({});
    setPlan(null);
    try {
      const res = await fetch('/api/practice-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          skillLevel,
          handedness,
          goals,
          focus: FOCUS_OPTIONS.find((f) => f.id === focus)?.label,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate plan');
      setPlan(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function addShot(id: string, goal: number) {
    setCounts((prev) => {
      const next = (prev[id] ?? 0) + 1;
      if (next >= goal) setDone((d) => ({ ...d, [id]: true }));
      return { ...prev, [id]: next };
    });
  }

  function removeShot(id: string) {
    setCounts((prev) => {
      const next = Math.max((prev[id] ?? 0) - 1, 0);
      setDone((d) => ({ ...d, [id]: false }));
      return { ...prev, [id]: next };
    });
  }

  function toggleDone(id: string) {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const allDone = plan && plan.drills.every((d) => done[d.id]);
  const completedCount = plan ? plan.drills.filter((d) => done[d.id]).length : 0;

  return (
    <div className="pb-10">
      <PageHeader title="Practice Planner" subtitle="AI-powered drills built for you" emoji="🏋️" />

      {/* Focus picker */}
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>TODAY'S FOCUS</p>
        <div className="grid grid-cols-3 gap-2">
          {FOCUS_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFocus(f.id)}
              className="py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all"
              style={{
                background: focus === f.id ? 'var(--accent)' : 'var(--bg-card)',
                borderColor: focus === f.id ? 'var(--accent)' : 'var(--border)',
                color: focus === f.id ? 'var(--bg-deep)' : 'var(--text-muted)',
              }}>
              <span className="text-lg">{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="px-4 mb-5">
        <button
          onClick={generatePlan}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}>
          {loading ? (
            <>
              <span className="animate-spin">⚙️</span> Building your plan…
            </>
          ) : (
            <>{plan ? '🔄 Generate New Plan' : '⚡ Build My Practice Plan'}</>
          )}
        </button>
        {error && <p className="text-xs mt-2 text-center" style={{ color: '#ef4444' }}>{error}</p>}
      </div>

      {/* Plan */}
      {plan && (
        <div className="px-4 space-y-4">
          {/* Plan header */}
          <div className="rounded-2xl p-4 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)' }}>
            <p className="text-xl font-black" style={{ color: 'var(--accent)' }}>{plan.title}</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{plan.theme}</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: 'var(--bg-deep)', color: 'var(--text-faint)' }}>
                ⏱ {plan.duration}
              </span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: 'var(--bg-deep)', color: 'var(--text-faint)' }}>
                {plan.drills.length} drills
              </span>
              {completedCount > 0 && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: '#10b98120', color: '#10b981' }}>
                  ✅ {completedCount}/{plan.drills.length} done
                </span>
              )}
            </div>
          </div>

          {/* All done celebration */}
          {allDone && (
            <div className="rounded-2xl p-5 text-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b20, #10b98120)', border: '1px solid #f59e0b' }}>
              <p className="text-3xl mb-2">🏆</p>
              <p className="text-lg font-black" style={{ color: '#f59e0b' }}>Practice Complete!</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Great work! You crushed every drill.</p>
            </div>
          )}

          {/* Drills */}
          {plan.drills.map((drill) => {
            const count   = counts[drill.id] ?? 0;
            const isDone  = done[drill.id] ?? false;
            const progress = Math.min(count / drill.goal, 1);
            const typeColor = TYPE_COLORS[drill.type] ?? 'var(--accent)';
            const tipOpen   = expandTip === drill.id;

            return (
              <div key={drill.id}
                className="rounded-2xl overflow-hidden border transition-all"
                style={{
                  background: isDone ? '#10b98112' : 'var(--bg-card)',
                  borderColor: isDone ? '#10b981' : 'var(--border)',
                }}>
                {/* Progress bar */}
                <div className="h-1.5 w-full" style={{ background: 'var(--bg-deep)' }}>
                  <div className="h-full transition-all duration-300"
                    style={{ width: `${progress * 100}%`, background: isDone ? '#10b981' : typeColor }} />
                </div>

                <div className="p-4">
                  {/* Title row */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl flex-shrink-0">{drill.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm" style={{ color: isDone ? '#10b981' : 'var(--text-primary)' }}>
                        {drill.name}
                      </p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {drill.description}
                      </p>
                    </div>
                  </div>

                  {/* Counter + checkbox row */}
                  <div className="flex items-center gap-3">
                    {/* Shot counter */}
                    <button
                      onClick={() => removeShot(drill.id)}
                      disabled={count === 0}
                      className="w-9 h-9 rounded-full text-lg font-bold flex items-center justify-center disabled:opacity-30 border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      −
                    </button>

                    <div className="flex-1 text-center">
                      <p className="text-3xl font-black leading-none"
                        style={{ color: isDone ? '#10b981' : typeColor }}>
                        {count}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        of {drill.goal} {drill.goalLabel}
                      </p>
                    </div>

                    <button
                      onClick={() => addShot(drill.id, drill.goal)}
                      disabled={isDone}
                      className="w-9 h-9 rounded-full text-lg font-bold flex items-center justify-center disabled:opacity-30"
                      style={{ background: typeColor, color: '#fff' }}>
                      +
                    </button>

                    {/* Divider */}
                    <div className="w-px h-8 mx-1" style={{ background: 'var(--border)' }} />

                    {/* Checkmark */}
                    <button
                      onClick={() => toggleDone(drill.id)}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        borderColor: isDone ? '#10b981' : 'var(--border)',
                        background:  isDone ? '#10b981' : 'transparent',
                      }}>
                      {isDone
                        ? <span className="text-white font-black text-base">✓</span>
                        : <span className="text-base" style={{ color: 'var(--text-faint)' }}>✓</span>
                      }
                    </button>
                  </div>

                  {/* Tip */}
                  {drill.tip && (
                    <div className="mt-2">
                      <button
                        onClick={() => setExpandTip(tipOpen ? null : drill.id)}
                        className="text-[11px] font-semibold flex items-center gap-1"
                        style={{ color: 'var(--accent)' }}>
                        💡 Pro Tip {tipOpen ? '▲' : '▼'}
                      </button>
                      {tipOpen && (
                        <p className="text-xs mt-1 leading-relaxed px-2 py-1.5 rounded-lg"
                          style={{ background: 'var(--bg-deep)', color: 'var(--text-muted)' }}>
                          {drill.tip}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!plan && !loading && (
        <div className="flex flex-col items-center justify-center h-40 gap-2 px-8 text-center">
          <p className="text-4xl">🎳</p>
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            Pick a focus above and let AI build a custom practice plan just for you.
          </p>
        </div>
      )}
    </div>
  );
}
