'use client';

import { useState } from 'react';
import { SURFACE_PROFILES } from '@/lib/constants/surfaces';
import { OIL_PATTERNS } from '@/lib/constants/oilPatterns';
import { WoodCard } from '@/components/ui/WoodCard';
import { PageHeader } from '@/components/ui/PageHeader';

export function SurfaceGuideScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded(expanded === id ? null : id);
  }

  return (
    <div className="pb-4">
      <PageHeader
        title="Ball Surfaces"
        subtitle="Match your cover's grit & finish to the oil"
        emoji="🧽"
      />

      {/* 101 explainer */}
      <div className="px-4 mb-4">
        <WoodCard>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>
            💡 How Surface Affects Hook
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Lower grit (duller, sanded) means more friction — the ball reads the lane and hooks earlier.
            Higher grit (polished, pearl) means less friction — the ball skids longer and saves its
            move for the backend. Pick the surface that matches how much oil is actually on the lane.
          </p>
        </WoodCard>
      </div>

      <div className="px-4 flex flex-col gap-3">
        {SURFACE_PROFILES.map((surface) => {
          const isOpen = expanded === surface.id;
          const matchedPatterns = OIL_PATTERNS.filter((p) =>
            surface.bestOilPatterns.includes(p.name)
          );

          return (
            <WoodCard key={surface.id} onClick={() => toggle(surface.id)} className={isOpen ? 'ring-2' : ''}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: surface.color }}
                  >
                    {surface.emoji}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {surface.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {surface.grit}
                    </p>
                  </div>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }} onClick={(e) => e.stopPropagation()}>
                  <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                      🛢️ Best Oil Condition
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{surface.oilCondition}</p>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {surface.description}
                  </p>

                  <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                      📈 Ball Motion
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{surface.motion}</p>
                  </div>

                  {matchedPatterns.length > 0 && (
                    <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                        🎯 Matching Patterns
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedPatterns.map((p) => (
                          <span
                            key={p.name}
                            className="text-[10px] px-2 py-1 rounded-full font-semibold"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                          >
                            {p.name} · {p.length}ft
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)', borderLeft: '3px solid var(--accent)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>💡 Tip</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{surface.tip}</p>
                  </div>
                </div>
              )}
            </WoodCard>
          );
        })}
      </div>
    </div>
  );
}
