'use client';

import { useState, useEffect } from 'react';
import { WoodCard } from '@/components/ui/WoodCard';
import { PageHeader } from '@/components/ui/PageHeader';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
const MEDAL_LABELS = ['1st Place', '2nd Place', '3rd Place', '4th Place', '5th Place'];

interface MonthPick {
  ballName:  string;
  brand:     string;
  reasoning: string;
}

interface BomData {
  picks:   MonthPick[];
  sources: string[];
}

export function BallPickerScreen() {
  const [bom, setBom]       = useState<BomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]     = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/balls-of-month')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data?.picks)) setBom(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-6">
      <PageHeader title="Top 5 Balls" subtitle="Best balls this month" emoji="🎳" />

      {loading && (
        <div className="px-4 mt-8 text-center" style={{ color: 'var(--text-faint)' }}>
          <p className="text-3xl mb-2">⏳</p>
          <p className="text-sm">Loading picks…</p>
        </div>
      )}

      {!loading && (!bom || bom.picks.length === 0) && (
        <div className="px-4 mt-8 text-center" style={{ color: 'var(--text-faint)' }}>
          <p className="text-3xl mb-2">🎳</p>
          <p className="text-sm">No picks available yet.</p>
        </div>
      )}

      {bom && bom.picks.length > 0 && (
        <div className="px-4 space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              AI-curated · updated monthly
            </p>
            {bom.sources.length > 0 && (
              <a
                href={bom.sources[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] px-2 py-1 rounded-lg border"
                style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
              >
                Sources ↗
              </a>
            )}
          </div>

          {bom.picks.map((pick, i) => {
            const isOpen = open === i;
            const isTop3 = i < 3;
            return (
              <WoodCard
                key={pick.ballName}
                onClick={() => setOpen(isOpen ? null : i)}
                className={isTop3 ? 'ring-1' : ''}
                style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
              >
                <div className="flex items-center gap-3">
                  {/* Medal circle */}
                  <div
                    className="w-14 h-14 rounded-full flex flex-col items-center justify-center flex-shrink-0 border-2"
                    style={{
                      background:  isTop3 ? 'var(--accent)18' : 'var(--bg-muted)',
                      borderColor: isTop3 ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    <span className="text-2xl leading-none">{MEDALS[i]}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className="font-bold text-base truncate"
                        style={{ color: isTop3 ? 'var(--accent)' : 'var(--text-primary)' }}
                      >
                        {pick.ballName}
                      </h3>
                      <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pick.brand}</p>
                    <span
                      className="inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1"
                      style={{
                        background: isTop3 ? 'var(--accent)22' : 'var(--bg-deep)',
                        color:      isTop3 ? 'var(--accent)' : 'var(--text-faint)',
                      }}
                    >
                      {MEDAL_LABELS[i]}
                    </span>
                  </div>
                </div>

                {/* Expanded reasoning */}
                {isOpen && (
                  <div
                    className="mt-3 pt-3 border-t text-sm leading-relaxed"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {pick.reasoning}
                  </div>
                )}
              </WoodCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
