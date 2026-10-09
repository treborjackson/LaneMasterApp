'use client';

import { useEffect, useState } from 'react';
import { useGames } from '@/hooks/useGames';
import { useAppStore } from '@/store/appStore';
import { WoodCard } from '@/components/ui/WoodCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDate } from '@/lib/utils';
import type { GameSession } from '@/lib/types/game';

export function HistoryScreen() {
  const { token } = useAppStore();
  const { games, loading, fetchGames, deleteGame } = useGames();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterAlley, setFilterAlley] = useState<string>('all');

  useEffect(() => {
    if (token) fetchGames();
  }, [token, fetchGames]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 px-4">
        <p className="text-3xl">🔒</p>
        <p className="text-sm text-center" style={{ color: 'var(--text-faint)' }}>
          Log in to view your game history
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p style={{ color: 'var(--text-faint)' }}>Loading…</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 px-4">
        <p className="text-3xl">🎳</p>
        <p className="text-sm text-center" style={{ color: 'var(--text-faint)' }}>
          No games saved yet — finish a game and tap Save!
        </p>
      </div>
    );
  }

  // Build unique alley list
  const alleys = Array.from(
    new Set(games.map((g) => g.bowlingAlley).filter(Boolean))
  ) as string[];

  const filtered = filterAlley === 'all'
    ? games
    : games.filter((g) => g.bowlingAlley === filterAlley);

  // Group by alley name (or "No Alley" if none)
  const groups: Record<string, GameSession[]> = {};
  for (const game of filtered) {
    const key = game.bowlingAlley || 'No Alley';
    if (!groups[key]) groups[key] = [];
    groups[key].push(game);
  }

  return (
    <div className="pb-4">
      <PageHeader title="Game History" subtitle={`${games.length} game${games.length !== 1 ? 's' : ''} saved`} emoji="📜" />

      {/* Alley filter */}
      {alleys.length > 0 && (
        <div className="px-4 mb-3">
          <select
            value={filterAlley}
            onChange={(e) => setFilterAlley(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <option value="all">All Bowling Alleys</option>
            {alleys.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      )}

      <div className="px-4 flex flex-col gap-4">
        {Object.entries(groups).map(([alley, alleyGames]) => (
          <div key={alley}>
            {/* Group header */}
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-faint)' }}>
              🎳 {alley}
            </p>

            <div className="flex flex-col gap-2">
              {alleyGames.map((game: GameSession) => {
                const isOpen = expanded === game.id;
                const notes = game.boardAdjustments
                  ? game.boardAdjustments.split(' | ').filter(Boolean)
                  : [];

                return (
                  <WoodCard key={game.id} onClick={() => setExpanded(isOpen ? null : game.id)}>
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg leading-none" style={{ color: 'var(--accent)' }}>
                          {game.totalScore}
                          <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-faint)' }}>pts</span>
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(game.datePlayed)}
                          {game.laneNumber && ` · Lanes ${game.laneNumber}`}
                          {game.oilPattern && ` · ${game.oilPattern}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{isOpen ? '▲' : '▼'}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteGame(game.id); }}
                          className="text-xs px-2 py-1 rounded-lg border"
                          style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Notes preview (always visible) */}
                    {notes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {notes.map((note, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--bg-deep)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                            {note}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expanded: frame grid */}
                    {isOpen && (
                      <div className="mt-3 grid grid-cols-5 gap-1">
                        {game.frames.map((frame, i) => (
                          <div key={i} className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-muted)' }}>
                            <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>F{i + 1}</p>
                            <p className="text-xs font-bold" style={{ color: frame.ball1 === 'X' ? 'var(--red)' : 'var(--text-primary)' }}>
                              {frame.ball1 || '—'}{frame.ball2 ? `·${frame.ball2}` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </WoodCard>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
