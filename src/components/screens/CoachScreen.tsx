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

export function CoachScreen() {
  const { bowlingStyle, handedness, setBowlingStyle, setHandedness, token } = useAppStore();
  const { messages, loading, sendMessage, clearMessages } = useCoach();
  const [input, setInput] = useState('');
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

  if (!bowlingStyle || !handedness) {
    return (
      <div className="px-4 pb-4">
        <PageHeader title="AI Coach" subtitle="Your personal bowling coach" emoji="🧑‍🏫" />
        <div className="mt-4 space-y-5">
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
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Which hand do you bowl with?</p>
            <div className="flex gap-2">
              {HANDS.map((h) => (
                <WoodPill key={h.id} active={handedness === h.id} onClick={() => setHandedness(h.id)}>
                  {h.label}
                </WoodPill>
              ))}
            </div>
          </div>
          {bowlingStyle && handedness === null && (
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Pick your bowling hand to continue</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="AI Coach" emoji="🧑‍🏫" />

      <div className="px-4 pb-2 flex gap-2 flex-wrap">
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
