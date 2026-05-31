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

function SelectedBallHero({ ball, onWatch, onDeselect }: {
  ball: Ball;
  onWatch: () => void;
  onDeselect: () => void;
}) {
  const hasVideo = BALL_REVIEWS.some((r) => r.ballName === ball.name);

  return (
    <div className="mx-4 mb-4 rounded-xl overflow-hidden border-2" style={{ borderColor: 'var(--accent)', background: 'var(--bg-card)' }}>
      {/* Gold header banner */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'var(--accent)' }}>
        <span className="text-xs font-bold" style={{ color: 'var(--bg-deep)' }}>✓ SELECTED BALL</span>
      </div>

      <div className="p-4">
        {/* Ball identity row */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 flex-shrink-0 shadow-lg"
            style={{ background: ball.color, borderColor: 'var(--accent)' }}
          >
            {ball.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {ball.name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--accent)' }}>{ball.brand}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ball.cover}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{ball.weight}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{ball.price}</p>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
            >
              {ball.skill}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <StatBar label="Hook Potential" value={ball.hook} color="var(--accent)" />
          <StatBar label="Ball Speed" value={ball.speed} color="var(--blue)" />
        </div>

        {/* Lane condition */}
        <div className="rounded-lg px-3 py-2 mb-4 flex items-center gap-2" style={{ background: 'var(--bg-muted)' }}>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Best on:</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{ball.lane} Oil</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {hasVideo && (
            <button
              onClick={onWatch}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
            >
              ▶ Watch Official Video
            </button>
          )}
          <button
            onClick={onDeselect}
            className="px-4 py-2.5 rounded-lg text-sm border font-semibold"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-muted)' }}
          >
            Deselect
          </button>
        </div>
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

      {/* Selected ball hero */}
      {selectedBall && (
        <SelectedBallHero
          ball={selectedBall}
          onWatch={() => openReview(selectedBall)}
          onDeselect={() => setSelectedBall(null)}
        />
      )}

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
          const selected = selectedBall?.name === ball.name;
          const hasVideo = BALL_REVIEWS.some((r) => r.ballName === ball.name);

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
                    <h3 className="font-bold text-sm truncate" style={{ color: selected ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {ball.name}
                    </h3>
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
                    {hasVideo && (
                      <span className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}>▶ video</span>
                    )}
                  </div>
                </div>
              </div>
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
