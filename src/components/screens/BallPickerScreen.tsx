'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { BALLS, BRANDS } from '@/lib/constants/balls';
import { BALL_REVIEWS } from '@/lib/constants/ballReviews';
import { WoodCard } from '@/components/ui/WoodCard';
import { WoodPill } from '@/components/ui/WoodPill';
import { PageHeader } from '@/components/ui/PageHeader';
import { VideoModal } from '@/components/ui/VideoModal';
import type { Ball } from '@/lib/types/ball';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

interface MonthPick {
  ballName:  string;
  brand:     string;
  reasoning: string;
}

interface BomData {
  picks:   MonthPick[];
  sources: string[];
}

function BallsOfMonthSection({
  data,
  onSelectBall,
}: {
  data: BomData | null;
  onSelectBall: (name: string) => void;
}) {
  if (!data || data.picks.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="px-4 flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            🏆 Balls of the Month
          </h2>
          <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
            AI-curated · updated monthly
          </p>
        </div>
        {data.sources.length > 0 && (
          <a
            href={data.sources[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-2 py-1 rounded-lg border"
            style={{ color: 'var(--accent)', borderColor: 'var(--accent)', opacity: 0.8 }}
          >
            Sources ↗
          </a>
        )}
      </div>

      <div className="px-4 flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {data.picks.map((pick, i) => (
          <button
            key={pick.ballName}
            onClick={() => onSelectBall(pick.ballName)}
            className="flex-shrink-0 w-44 rounded-2xl p-3 text-left flex flex-col gap-1.5"
            style={{
              background:   'var(--bg-card)',
              border:       '1px solid var(--border)',
              minHeight:    '130px',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{MEDALS[i]}</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: 'var(--accent)22', color: 'var(--accent)' }}
              >
                #{i + 1}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {pick.ballName}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--accent)' }}>{pick.brand}</p>
            </div>
            <p className="text-[10px] leading-relaxed mt-auto" style={{ color: 'var(--text-muted)' }}>
              {pick.reasoning}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

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

function BallCard({
  ball,
  rank,
  isOpen,
  onToggle,
  onWatch,
  hasVideo,
}: {
  ball: Ball;
  rank?: number;
  isOpen: boolean;
  onToggle: () => void;
  onWatch: () => void;
  hasVideo: boolean;
}) {
  return (
    <WoodCard
      onClick={onToggle}
      className={isOpen ? 'ring-2' : ''}
      style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2 transition-all relative"
          style={{
            background:  ball.color,
            borderColor: isOpen ? 'var(--accent)' : 'var(--border)',
            boxShadow:   isOpen ? '0 0 10px var(--accent)44' : 'none',
          }}
        >
          {ball.emoji}
          {rank !== undefined && (
            <span
              className="absolute -top-1 -right-1 text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
              style={{ background: 'var(--bg-deep)', border: '1px solid var(--accent)', color: 'var(--accent)' }}
            >
              {rank + 1}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              {rank !== undefined && (
                <span className="text-sm flex-shrink-0">{MEDALS[rank]}</span>
              )}
              <h3 className="font-bold text-sm truncate" style={{ color: isOpen ? 'var(--accent)' : 'var(--text-primary)' }}>
                {ball.name}
              </h3>
            </div>
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

      {isOpen && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }} onClick={(e) => e.stopPropagation()}>
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

          <div className="space-y-2 mb-4">
            <StatBar label="Hook Potential" value={ball.hook} color="var(--accent)" />
            <StatBar label="Ball Speed"     value={ball.speed} color="var(--blue)" />
          </div>

          <div className="flex gap-2">
            {hasVideo && (
              <button
                onClick={onWatch}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5"
                style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
              >
                ▶ Watch Official Video
              </button>
            )}
            <button
              onClick={onToggle}
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
}

// Minimal card for BoM picks that aren't in the hardcoded list
function FeaturedBallCard({
  pick,
  rank,
}: {
  pick: MonthPick;
  rank: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <WoodCard onClick={() => setOpen(!open)}>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2"
          style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}
        >
          🎳
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{MEDALS[rank]}</span>
            <h3 className="font-bold text-sm truncate" style={{ color: open ? 'var(--accent)' : 'var(--text-primary)' }}>
              {pick.ballName}
            </h3>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pick.brand}</p>
          <span
            className="inline-block text-[9px] px-1.5 py-0.5 rounded-full font-semibold mt-1"
            style={{ background: 'var(--accent)22', color: 'var(--accent)' }}
          >
            AI Pick
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t text-xs leading-relaxed" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          {pick.reasoning}
        </div>
      )}
    </WoodCard>
  );
}

export function BallPickerScreen() {
  const { selectedBall, setSelectedBall, favBrands, toggleBrand } = useAppStore();
  const [video, setVideo] = useState<{ youtubeId: string; title: string } | null>(null);
  const [bom, setBom] = useState<BomData | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch('/api/balls-of-month')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data?.picks)) setBom(data); })
      .catch(() => {});
  }, []);

  // Names of BoM picks that exist in the hardcoded list (for badge display)
  const bomNames = new Set((bom?.picks ?? []).map((p) => p.ballName));
  const bomRank  = new Map((bom?.picks ?? []).map((p, i) => [p.ballName, i]));

  // BoM picks that are NOT in the hardcoded list → show as featured extras
  const extraPicks = (bom?.picks ?? []).filter((p) => !BALLS.find((b) => b.name === p.ballName));

  const filtered = BALLS.filter((b) =>
    favBrands.length === 0 || favBrands.includes(b.brand)
  );

  function handleSelectFromBom(ballName: string) {
    const ball = BALLS.find((b) => b.name === ballName);
    if (ball) {
      setSelectedBall(ball);
      setTimeout(() => {
        cardRefs.current[ballName]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }

  function openReview(ball: Ball) {
    const rev = BALL_REVIEWS.find((r) => r.ballName === ball.name);
    if (rev) setVideo({ youtubeId: rev.youtubeId, title: rev.title });
  }

  return (
    <div className="pb-4">
      <PageHeader title="Ball Picker" subtitle="Find your perfect ball" emoji="🎳" />

      <BallsOfMonthSection data={bom} onSelectBall={handleSelectFromBom} />

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

      {/* AI-featured balls not in the local list */}
      {extraPicks.length > 0 && (
        <div className="px-4 mb-4">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>
            🏆 Featured This Month
          </p>
          <div className="flex flex-col gap-3">
            {extraPicks.map((pick) => (
              <FeaturedBallCard key={pick.ballName} pick={pick} rank={bomRank.get(pick.ballName) ?? 0} />
            ))}
          </div>
        </div>
      )}

      {/* Main ball list */}
      <div className="px-4 flex flex-col gap-3">
        {filtered.map((ball) => {
          const isOpen   = selectedBall?.name === ball.name;
          const hasVideo = BALL_REVIEWS.some((r) => r.ballName === ball.name);
          const rank     = bomNames.has(ball.name) ? bomRank.get(ball.name) : undefined;

          return (
            <div key={ball.name} ref={(el) => { cardRefs.current[ball.name] = el; }}>
              <BallCard
                ball={ball}
                rank={rank}
                isOpen={isOpen}
                onToggle={() => setSelectedBall(isOpen ? null : ball)}
                onWatch={() => openReview(ball)}
                hasVideo={hasVideo}
              />
            </div>
          );
        })}
      </div>

      {video && (
        <VideoModal youtubeId={video.youtubeId} title={video.title} onClose={() => setVideo(null)} />
      )}
    </div>
  );
}
