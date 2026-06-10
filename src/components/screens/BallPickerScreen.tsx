'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { BALLS, BRANDS } from '@/lib/constants/balls';
import { BALL_REVIEWS } from '@/lib/constants/ballReviews';
import { WoodCard } from '@/components/ui/WoodCard';
import { WoodPill } from '@/components/ui/WoodPill';
import { PageHeader } from '@/components/ui/PageHeader';
import { VideoModal } from '@/components/ui/VideoModal';
import type { Ball } from '@/lib/types/ball';

const SKILL_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span style={{ color: 'var(--text-faint)' }}>{label}</span>
        <span className="font-bold" style={{ color }}>{value}/10</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value * 10}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function BallPickerScreen() {
  const { selectedBall, setSelectedBall, favBrands, toggleBrand } = useAppStore();
  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [video, setVideo] = useState<{ youtubeId: string; title: string } | null>(null);

  const filtered = BALLS.filter((b) => {
    const skillOk = skillFilter === 'All' || b.skill === skillFilter;
    const brandOk = favBrands.length === 0 || favBrands.includes(b.brand);
    return skillOk && brandOk;
  });

  function openReview(ball: Ball) {
    const rev = BALL_REVIEWS.find((r) => r.ballName === ball.name);
    if (rev) setVideo({ youtubeId: rev.youtubeId, title: rev.title });
  }

  return (
    <div className="pb-4">
      <PageHeader title="Ball Picker" subtitle="Find your perfect ball" emoji="🎳" />

      {/* Brand filter */}
      <div className="px-4 mb-3">
        <p className="text-xs mb-2" style={{ color: 'var(--text-faint)' }}>Filter by brand</p>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <WoodPill key={brand} active={favBrands.includes(brand)} onClick={() => toggleBrand(brand)}>
              {brand}
            </WoodPill>
          ))}
        </div>
      </div>

      {/* Skill filter */}
      <div className="px-4 mb-4 flex gap-2 flex-wrap">
        {SKILL_LEVELS.map((s) => (
          <WoodPill key={s} active={skillFilter === s} onClick={() => setSkillFilter(s)}>
            {s}
          </WoodPill>
        ))}
      </div>

      {/* Ball list */}
      <div className="px-4 flex flex-col gap-3">
        {filtered.map((ball) => {
          const isOpen   = selectedBall?.name === ball.name;
          const hasVideo = BALL_REVIEWS.some((r) => r.ballName === ball.name);

          return (
            <WoodCard
              key={ball.name}
              onClick={() => setSelectedBall(isOpen ? null : ball)}
              className={isOpen ? 'ring-2' : ''}
              style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
            >
              {/* Collapsed header — always visible */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2 transition-all"
                  style={{
                    background:   ball.color,
                    borderColor:  isOpen ? 'var(--accent)' : 'var(--border)',
                    boxShadow:    isOpen ? '0 0 10px var(--accent)44' : 'none',
                  }}
                >
                  {ball.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm truncate" style={{ color: isOpen ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {ball.name}
                    </h3>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{ball.price}</span>
                      <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ball.brand} · {ball.cover}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      Hook <span className="font-bold" style={{ color: 'var(--accent)' }}>{ball.hook}/10</span>
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      Speed <span className="font-bold" style={{ color: 'var(--brown-2)' }}>{ball.speed}/10</span>
                    </span>
                    {hasVideo && !isOpen && (
                      <span className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}>▶ video</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }} onClick={(e) => e.stopPropagation()}>
                  {/* Larger ball + details */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-4xl flex-shrink-0 border-4 shadow-lg"
                      style={{ background: ball.color, borderColor: 'var(--accent)' }}
                    >
                      {ball.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ball.cover}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{ball.weight}</p>
                      <div
                        className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg"
                        style={{ background: 'var(--bg-muted)' }}
                      >
                        <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Best on:</span>
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>{ball.lane}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat bars */}
                  <div className="space-y-2 mb-4">
                    <StatBar label="Hook Potential" value={ball.hook} color="var(--accent)" />
                    <StatBar label="Ball Speed"     value={ball.speed} color="var(--blue)" />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {hasVideo && (
                      <button
                        onClick={() => openReview(ball)}
                        className="flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5"
                        style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
                      >
                        ▶ Watch Official Video
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedBall(null)}
                      className="px-4 py-2.5 rounded-lg text-sm border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-muted)' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </WoodCard>
          );
        })}
      </div>

      {video && (
        <VideoModal youtubeId={video.youtubeId} title={video.title} onClose={() => setVideo(null)} />
      )}
    </div>
  );
}
