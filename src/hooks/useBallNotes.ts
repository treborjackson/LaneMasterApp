'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import type { BallNote } from '@/lib/types/ball';

export function useBallNotes() {
  const { token } = useAppStore();
  const [notes, setNotes]     = useState<BallNote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ball-notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotes(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  const saveNote = useCallback(async (note: Omit<BallNote, 'id' | 'dateAdded'>) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/ball-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error('Failed to save note');
    const saved = await res.json();
    setNotes((prev) => {
      const exists = prev.findIndex((n) => n.id === saved.id);
      return exists >= 0
        ? prev.map((n) => (n.id === saved.id ? saved : n))
        : [saved, ...prev];
    });
    return saved;
  }, [token]);

  const deleteNote = useCallback(async (id: string) => {
    if (!token) throw new Error('Not authenticated');
    await fetch(`/api/ball-notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, [token]);

  return { notes, loading, fetchNotes, saveNote, deleteNote };
}
