'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { apiCoachMessage } from '@/lib/api';
import type { CoachMessage } from '@/lib/types/coach';

export function useCoach() {
  const { token, selectedBall, bowlingStyle, handedness, goals, coachMessages, setCoachMessages } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!token) throw new Error('Not authenticated');

    const userMsg: CoachMessage = { role: 'user', content };
    const next = [...coachMessages, userMsg];
    setCoachMessages(next);
    setLoading(true);
    setError(null);

    try {
      const data = await apiCoachMessage(token, {
        messages:     next,
        bowlingStyle: bowlingStyle ?? 'onehand',
        handedness:   handedness  ?? 'right',
        goals,
        ball:         selectedBall,
      });
      if (data.error) {
        setError(`API error: ${data.error}`);
      } else {
        const assistantMsg: CoachMessage = { role: 'assistant', content: data.reply };
        setCoachMessages([...next, assistantMsg]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Coach error');
    } finally {
      setLoading(false);
    }
  }, [token, coachMessages, bowlingStyle, handedness, goals, selectedBall, setCoachMessages]);

  function clearMessages() {
    setCoachMessages([]);
  }

  return { messages: coachMessages, loading, error, sendMessage, clearMessages };
}
