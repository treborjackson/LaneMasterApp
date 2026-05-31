'use client';

import { useState } from 'react';
import { OIL_PATTERNS } from '@/lib/constants/oilPatterns';
import { WoodCard } from '@/components/ui/WoodCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { LaneVisual } from '@/components/ui/LaneVisual';

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy:   'var(--blue)',
  Medium: 'var(--accent)',
  Hard:   'var(--red)',
  Sport:  '#8e44ad',
};

export function OilPatternScreen() {
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = OIL_PATTERNS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.difficulty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-4">
      <PageHeader title="Oil Patterns" subtitle="Know the lane before you bowl" emoji="🛢️" />

      <div className="px-4 mb-4">
        <input
          type="text"
          placeholder="Search patterns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
          style={{
            background:   'var(--bg-card)',
            borderColor:  'var(--border)',
            color:        'var(--text-primary)',
          }}
        />
      </div>

      <div className="px-4 flex flex-col gap-3">
        {filtered.map((pattern) => {
          const isOpen = expanded === pattern.name;
          const color  = DIFFICULTY_COLORS[pattern.difficulty];
          return (
            <WoodCard key={pattern.name} onClick={() => setExpanded(isOpen ? null : pattern.name)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{pattern.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pattern.length} ft · Ratio {pattern.ratio}</p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: color, color: '#fff' }}
                >
                  {pattern.difficulty}
                </span>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-3">
                  <LaneVisual length={pattern.length} difficulty={pattern.difficulty} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pattern.description}</p>
                  <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>💡 Pro Tip</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pattern.tip}</p>
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
