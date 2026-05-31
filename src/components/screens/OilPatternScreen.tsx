'use client';

import { useState } from 'react';
import { OIL_PATTERNS, OIL_PATTERN_DETAILS } from '@/lib/constants/oilPatterns';
import { WoodCard } from '@/components/ui/WoodCard';
import { WoodPill } from '@/components/ui/WoodPill';
import { PageHeader } from '@/components/ui/PageHeader';
import { LaneVisual } from '@/components/ui/LaneVisual';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard', 'Sport'] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy:   'var(--blue)',
  Medium: 'var(--accent)',
  Hard:   'var(--red)',
  Sport:  '#8e44ad',
};

type Section = 'overview' | 'line' | 'adjustments' | 'mistakes' | 'tips';

const SECTIONS: { id: Section; label: string; emoji: string }[] = [
  { id: 'overview',     label: 'Overview',    emoji: '📋' },
  { id: 'line',         label: 'Line',         emoji: '🎯' },
  { id: 'adjustments',  label: 'Adjustments',  emoji: '🔧' },
  { id: 'mistakes',     label: 'Mistakes',     emoji: '⚠️' },
  { id: 'tips',         label: 'Pro Tips',     emoji: '🏆' },
];

export function OilPatternScreen() {
  const [search, setSearch]       = useState('');
  const [difficulty, setDifficulty] = useState<string>('All');
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [section, setSection]     = useState<Section>('overview');

  const filtered = OIL_PATTERNS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchDiff   = difficulty === 'All' || p.difficulty === difficulty;
    return matchSearch && matchDiff;
  });

  function togglePattern(name: string) {
    if (expanded === name) {
      setExpanded(null);
    } else {
      setExpanded(name);
      setSection('overview');
    }
  }

  return (
    <div className="pb-4">
      <PageHeader title="Oil Patterns" subtitle="Know the lane before you bowl" emoji="🛢️" />

      {/* Search */}
      <div className="px-4 mb-3">
        <input
          type="text"
          placeholder="Search patterns or descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Difficulty filter */}
      <div className="px-4 mb-4 flex gap-2 flex-wrap">
        {DIFFICULTIES.map((d) => (
          <WoodPill key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
            {d}
          </WoodPill>
        ))}
      </div>

      {/* Results count */}
      {search && (
        <p className="px-4 mb-2 text-xs" style={{ color: 'var(--text-faint)' }}>
          {filtered.length} pattern{filtered.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Pattern list */}
      <div className="px-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-faint)' }}>
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No patterns match "{search}"</p>
          </div>
        )}

        {filtered.map((pattern) => {
          const isOpen  = expanded === pattern.name;
          const color   = DIFFICULTY_COLORS[pattern.difficulty];
          const detail  = OIL_PATTERN_DETAILS[pattern.name];

          return (
            <WoodCard key={pattern.name} onClick={() => togglePattern(pattern.name)}>
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {pattern.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {pattern.length} ft · Ratio {pattern.ratio}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: color, color: '#fff' }}
                  >
                    {pattern.difficulty}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  {/* Lane visual */}
                  <LaneVisual length={pattern.length} difficulty={pattern.difficulty} />

                  {/* Section tabs */}
                  <div className="flex gap-1.5 mt-4 flex-wrap">
                    {SECTIONS.map((s) => (
                      <WoodPill
                        key={s.id}
                        active={section === s.id}
                        onClick={() => setSection(s.id)}
                        className="text-[11px]"
                      >
                        {s.emoji} {s.label}
                      </WoodPill>
                    ))}
                  </div>

                  {/* Overview */}
                  {section === 'overview' && (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {pattern.description}
                      </p>

                      {detail && (
                        <>
                          {/* Best for */}
                          <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                              🎳 Best For
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{detail.bestFor}</p>
                          </div>

                          {/* Ball recommendations */}
                          <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                              🎱 Ball Recommendations
                            </p>
                            <ul className="space-y-1">
                              {detail.ballRecommendations.map((b, i) => (
                                <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--text-muted)' }}>
                                  <span style={{ color: 'var(--accent)' }}>•</span> {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {/* Quick tip */}
                      <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)', borderLeft: '3px solid var(--accent)' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>💡 Quick Tip</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pattern.tip}</p>
                      </div>
                    </div>
                  )}

                  {/* Line to play */}
                  {section === 'line' && detail && (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>🎯 Line to Play</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {detail.lineToPlay}
                        </p>
                      </div>

                      {/* Board diagram */}
                      <div className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>📐 Board Reference</p>
                        <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-faint)' }}>
                          {[39, 30, 20, 15, 10, 5, 1].map((b) => (
                            <span key={b}>{b}</span>
                          ))}
                        </div>
                        <div
                          className="h-2 rounded-full mt-1 relative overflow-hidden"
                          style={{ background: 'var(--bg-deep)' }}
                        >
                          <div
                            className="absolute top-0 bottom-0 rounded-full opacity-60"
                            style={{
                              left:  `${100 - (pattern.length / 60) * 100}%`,
                              right: '0%',
                              background: color,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] mt-1" style={{ color: 'var(--text-faint)' }}>
                          <span>← Gutter</span>
                          <span>Center →</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Adjustments */}
                  {section === 'adjustments' && detail && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>🔧 In-Game Adjustments</p>
                      {detail.adjustments.map((adj, i) => {
                        const [situation, action] = adj.includes('→') ? adj.split('→') : [adj, ''];
                        return (
                          <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                            {action ? (
                              <>
                                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  {situation.trim()}
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>
                                  → {action.trim()}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{adj}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Common mistakes */}
                  {section === 'mistakes' && detail && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--red)' }}>⚠️ Common Mistakes</p>
                      {detail.commonMistakes.map((m, i) => (
                        <div key={i} className="rounded-lg p-3 flex gap-2" style={{ background: 'var(--bg-muted)' }}>
                          <span style={{ color: 'var(--red)' }}>✕</span>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pro tips */}
                  {section === 'tips' && detail && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>🏆 Pro Tips</p>
                      {detail.proTips.map((tip, i) => (
                        <div
                          key={i}
                          className="rounded-lg p-3 flex gap-2"
                          style={{ background: 'var(--bg-muted)', borderLeft: '3px solid var(--accent)' }}
                        >
                          <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--accent)' }}>
                            {i + 1}.
                          </span>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </WoodCard>
          );
        })}
      </div>
    </div>
  );
}
