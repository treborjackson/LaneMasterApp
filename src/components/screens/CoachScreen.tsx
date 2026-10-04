'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useCoach } from '@/hooks/useCoach';
import { WoodPill } from '@/components/ui/WoodPill';
import { PageHeader } from '@/components/ui/PageHeader';
import type { BowlingStyle, Handedness } from '@/lib/types/coach';

const STYLES: { id: BowlingStyle; label: string }[] = [
  { id: 'onehand', label: '✋ One-Handed' },
  { id: 'twohand', label: '🤲 Two-Handed' },
];

const HANDS: { id: Handedness; label: string }[] = [
  { id: 'right', label: '👉 Right-Handed' },
  { id: 'left',  label: '👈 Left-Handed'  },
];

const GOAL_SUGGESTIONS = [
  'Bowl a 200 game',
  'Improve my spare shooting',
  'Increase my average by 10 pins',
  'Learn to read oil patterns',
  'Fix my release consistency',
  'Bowl a turkey (3 strikes in a row)',
];

export function CoachScreen() {
  const { bowlingStyle, handedness, goals, setBowlingStyle, setHandedness, setGoals, token } = useAppStore();
  const { messages, loading, error: coachError, sendMessage, clearMessages } = useCoach();
  const [input, setInput]         = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [editingGoals, setEditingGoals] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading || !token) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  }

  function addGoal(text: string) {
    const trimmed = text.trim();
    if (!trimmed || goals.length >= 3 || goals.includes(trimmed)) return;
    setGoals([...goals, trimmed]);
    setGoalInput('');
  }

  function removeGoal(goal: string) {
    setGoals(goals.filter((g) => g !== goal));
  }

  // Setup screen — collect style, hand, and at least one goal
  if (!bowlingStyle || !handedness || goals.length === 0) {
    return (
      <div className="px-4 pb-4">
        <PageHeader title="AI Coach" subtitle="Your personal bowling coach" emoji="🧑‍🏫" />
        <div className="mt-4 space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>How do you bowl?</p>
            <div className="flex gap-2">
              {STYLES.map((s) => (
                <WoodPill key={s.id} active={bowlingStyle === s.id} onClick={() => setBowlingStyle(s.id)}>
                  {s.label}
                </WoodPill>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Which hand?</p>
            <div className="flex gap-2">
              {HANDS.map((h) => (
                <WoodPill key={h.id} active={handedness === h.id} onClick={() => setHandedness(h.id)}>
                  {h.label}
                </WoodPill>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              What are your bowling goals? <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(up to 3)</span>
            </p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
              Your coach will focus every conversation on helping you reach these.
            </p>

            {/* Current goals */}
            {goals.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {goals.map((g) => (
                  <span
                    key={g}
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
                  >
                    🎯 {g}
                    <button onClick={() => removeGoal(g)} className="ml-1 opacity-70 hover:opacity-100">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {goals.length < 3 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {GOAL_SUGGESTIONS.filter((s) => !goals.includes(s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => addGoal(s)}
                    className="text-xs px-3 py-1 rounded-full border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-card)' }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}

            {/* Custom goal input */}
            {goals.length < 3 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGoal(goalInput)}
                  placeholder="Or type your own goal…"
                  maxLength={60}
                  className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  onClick={() => addGoal(goalInput)}
                  disabled={!goalInput.trim()}
                  className="px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
                  style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main chat screen
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="AI Coach" emoji="🧑‍🏫" />

      {/* Style / hand toggles + goals */}
      <div className="px-4 pb-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {STYLES.map((s) => (
            <WoodPill key={s.id} active={bowlingStyle === s.id} onClick={() => { clearMessages(); setBowlingStyle(s.id); }}>
              {s.label}
            </WoodPill>
          ))}
          {HANDS.map((h) => (
            <WoodPill key={h.id} active={handedness === h.id} onClick={() => { clearMessages(); setHandedness(h.id); }}>
              {h.label}
            </WoodPill>
          ))}
        </div>

        {/* Goals row */}
        <div className="flex items-start gap-2 flex-wrap">
          {goals.map((g) => (
            <span
              key={g}
              className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
            >
              🎯 {g}
            </span>
          ))}
          <button
            onClick={() => setEditingGoals(!editingGoals)}
            className="text-[11px] px-2 py-0.5 rounded-full border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
          >
            {editingGoals ? 'Done' : 'Edit goals'}
          </button>
        </div>

        {/* Inline goal editor */}
        {editingGoals && (
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--bg-card)' }}>
            {goals.map((g) => (
              <div key={g} className="flex items-center justify-between gap-2">
                <span className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>🎯 {g}</span>
                <button
                  onClick={() => removeGoal(g)}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ background: 'var(--bg-muted)', color: 'var(--red)' }}
                >
                  Remove
                </button>
              </div>
            ))}
            {goals.length < 3 && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGoal(goalInput)}
                  placeholder="Add a goal…"
                  maxLength={60}
                  className="flex-1 px-2 py-1 rounded-lg text-xs border outline-none"
                  style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  onClick={() => addGoal(goalInput)}
                  disabled={!goalInput.trim()}
                  className="px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-40"
                  style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center mt-8" style={{ color: 'var(--text-faint)' }}>
            <p className="text-4xl mb-2">🎳</p>
            <p className="text-sm">Your coach knows your goals — ask anything!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[80%] rounded-2xl px-4 py-2 text-sm"
              style={{
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                color:      msg.role === 'user' ? 'var(--bg-deep)' : 'var(--text-primary)',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2 text-sm" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
              Thinking…
            </div>
          </div>
        )}
        {coachError && (
          <div className="rounded-xl px-4 py-3 text-xs font-mono break-all" style={{ background: 'var(--bg-card)', color: 'var(--red)', border: '1px solid var(--red)' }}>
            ⚠️ {coachError}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={token ? 'Ask your coach...' : 'Log in to chat with your coach'}
          disabled={!token || loading}
          className="flex-1 px-3 py-2 rounded-xl text-sm border outline-none"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading || !token}
          className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
          style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
