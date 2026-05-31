'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useCoach } from '@/hooks/useCoach';
import { WoodPill } from '@/components/ui/WoodPill';
import { PageHeader } from '@/components/ui/PageHeader';
import type { BowlingStyle, SkillLevel } from '@/lib/types/coach';

const STYLES:  { id: BowlingStyle; label: string }[] = [
  { id: 'onehand', label: '✋ One-Handed' },
  { id: 'twohand', label: '🤲 Two-Handed' },
];
const LEVELS: { id: SkillLevel; label: string }[] = [
  { id: 'beginner',     label: '🌱 Beginner' },
  { id: 'intermediate', label: '⚡ Intermediate' },
  { id: 'advanced',     label: '🏆 Advanced' },
];

export function CoachScreen() {
  const { bowlingStyle, skillLevel, setBowlingStyle, setSkillLevel, token } = useAppStore();
  const { messages, loading, sendMessage, clearMessages } = useCoach();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ready = bowlingStyle && skillLevel;

  async function handleSend() {
    if (!input.trim() || loading || !token) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  }

  if (!ready) {
    return (
      <div className="px-4 pb-4">
        <PageHeader title="AI Coach" subtitle="Personalized bowling coaching" emoji="🧑‍🏫" />
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Your bowling style</p>
            <div className="flex gap-2">
              {STYLES.map((s) => (
                <WoodPill key={s.id} active={bowlingStyle === s.id} onClick={() => setBowlingStyle(s.id)}>
                  {s.label}
                </WoodPill>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Your skill level</p>
            <div className="flex flex-col gap-2">
              {LEVELS.map((l) => (
                <WoodPill key={l.id} active={skillLevel === l.id} onClick={() => setSkillLevel(l.id)}>
                  {l.label}
                </WoodPill>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="AI Coach" emoji="🧑‍🏫" />

      <div className="px-4 pb-2 flex gap-2">
        {STYLES.map((s) => (
          <WoodPill key={s.id} active={bowlingStyle === s.id} onClick={() => { clearMessages(); setBowlingStyle(s.id); }}>
            {s.label}
          </WoodPill>
        ))}
        {LEVELS.map((l) => (
          <WoodPill key={l.id} active={skillLevel === l.id} onClick={() => { clearMessages(); setSkillLevel(l.id); }}>
            {l.label}
          </WoodPill>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center mt-8" style={{ color: 'var(--text-faint)' }}>
            <p className="text-4xl mb-2">🎳</p>
            <p className="text-sm">Ask your coach anything about bowling!</p>
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
