'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { apiGetPreferences, apiSavePreferences } from '@/lib/api';
import type { UserPreferences } from '@/lib/types/user';

export function usePreferences() {
  const { token } = useAppStore();
  const [prefs, setPrefs]     = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrefs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetPreferences(token);
      if (data) setPrefs(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const savePrefs = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!token) throw new Error('Not authenticated');
    const updated = await apiSavePreferences(token, updates);
    setPrefs(updated);
    return updated;
  }, [token]);

  return { prefs, loading, fetchPrefs, savePrefs };
}
