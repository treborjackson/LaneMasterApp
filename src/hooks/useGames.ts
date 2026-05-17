'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { apiGetGames, apiSaveGame, apiDeleteGame } from '@/lib/api';
import type { GameSession } from '@/lib/types/game';

export function useGames() {
  const { token } = useAppStore();
  const [games, setGames]     = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetGames(token);
      setGames(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const saveGame = useCallback(async (game: Omit<GameSession, 'id' | 'datePlayed'>) => {
    if (!token) throw new Error('Not authenticated');
    const saved = await apiSaveGame(token, game);
    setGames((prev) => [saved, ...prev]);
    return saved;
  }, [token]);

  const deleteGame = useCallback(async (id: string) => {
    if (!token) throw new Error('Not authenticated');
    await apiDeleteGame(token, id);
    setGames((prev) => prev.filter((g) => g.id !== id));
  }, [token]);

  return { games, loading, error, fetchGames, saveGame, deleteGame };
}
