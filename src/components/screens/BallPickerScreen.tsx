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

export function BallPickerScreen() {
  const { selectedBall, setSelectedBall, favBrands, toggleBrand } = useAppStore();
  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [video, setVideo] = useState<{ youtubeId: string; title: string } | null>(null);

  const filtered = BALLS.filter((b) => {
    const skillOk  = skillFilter === 'All' || b.skill === skillFilter;
    const brandOk  = favBrands.length === 0 || favBrands.includes(b.brand);
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
      <div className="px-4 mb-4 flex gap-2">
        {SKILL_LEVELS.map((s) => (
          <WoodPill key={s} active={skillFilter === s} onClick={() => setSkillFilter(s)}>
            {s}
          </WoodPill>
        ))}
      </div>

      {/* Ball list */}
      <div className="px-4 flex flex-col gap-3">
        {filtered.map((ball) => {
          const selected = selectedBall?.name === ball.name;
          return (
            <WoodCard
              key={ball.name}
              onClick={() => setSelectedBall(selected ? null : ball)}
              className={selected ? 'ring-2' : ''}
              style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2"
                  style={{ background: ball.color, borderColor: selected ? 'var(--accent)' : 'var(--border)' }}
                >
                  {ball.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{ball.name}</h3>
                    <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--accent)' }}>{ball.price}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ball.brand} · {ball.cover}</p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{ball.lane} · {ball.skill}</p>

                  <div className="flex gap-3 mt-2">
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-faint)' }}>Hook </span>
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>{ball.hook}/10</span>
                    </div>
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-faint)' }}>Speed </span>
                      <span className="font-bold" style={{ color: 'var(--brown-2)' }}>{ball.speed}/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {selected && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openReview(ball); }}
                    className="flex-1 text-xs py-1.5 rounded-lg font-semibold border"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    ▶ Review Video
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedBall(null); }}
                    className="text-xs px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    Deselect
                  </button>
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
