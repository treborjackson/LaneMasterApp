'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { apiCoachMessage } from '@/lib/api';
import type { CoachMessage } from '@/lib/types/coach';

export function useCoach() {
  const { token, selectedBall, bowlingStyle, skillLevel } = useAppStore();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!token) throw new Error('Not authenticated');

    const userMsg: CoachMessage = { role: 'user', content };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    setError(null);

    try {
      const data = await apiCoachMessage(token, {
        messages:     next,
        bowlingStyle: bowlingStyle ?? 'onehand',
        skillLevel:   skillLevel  ?? 'beginner',
        ball:         selectedBall,
      });
      const assistantMsg: CoachMessage = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Coach error');
    } finally {
      setLoading(false);
    }
  }, [token, messages, bowlingStyle, skillLevel, selectedBall]);

  function clearMessages() {
    setMessages([]);
  }

  return { messages, loading, error, sendMessage, clearMessages };
}
