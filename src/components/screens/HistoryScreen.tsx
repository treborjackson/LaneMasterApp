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

  return (
    <div className="pb-4">
      <PageHeader title="Game History" subtitle={`${games.length} game${games.length !== 1 ? 's' : ''} saved`} emoji="📜" />

      <div className="px-4 flex flex-col gap-3">
        {games.map((game: GameSession) => {
          const isOpen = expanded === game.id;
          return (
            <WoodCard key={game.id} onClick={() => setExpanded(isOpen ? null : game.id)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Score: <span style={{ color: 'var(--accent)' }}>{game.totalScore}</span>
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(game.datePlayed)}
                    {game.ballUsed && ` · ${game.ballUsed}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{isOpen ? '▲' : '▼'}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteGame(game.id); }}
                    className="text-xs px-2 py-1 rounded-lg border"
                    style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 grid grid-cols-5 gap-1">
                  {game.frames.map((frame, i) => (
                    <div key={i} className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-muted)' }}>
                      <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>F{i + 1}</p>
                      <p className="text-xs font-bold" style={{ color: frame.ball1 === 'X' ? 'var(--red)' : 'var(--text-primary)' }}>
                        {frame.ball1 || '—'}{frame.ball2 ? `·${frame.ball2}` : ''}
                      </p>
                      {frame.note && (
                        <p className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--text-faint)' }}>{frame.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </WoodCard>
          );
        })}
      </div>
    </div>
  );
}
