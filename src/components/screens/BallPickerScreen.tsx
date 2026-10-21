'use client';

import { useState, useEffect } from 'react';
import { WoodCard } from '@/components/ui/WoodCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { VideoModal } from '@/components/ui/VideoModal';
import type { BrandGroup, BrandPick } from '@/app/api/balls-of-month/route';

const MEDALS = ['🥇', '🥈', '🥉'];

const BRAND_COLORS: Record<string, string> = {
  'Storm':      '#e63946',
  'Brunswick':  '#457b9d',
  'Hammer':     '#e76f51',
  'Roto Grip':  '#2a9d8f',
  'Motiv':      '#8338ec',
};

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
          style={{ width: `${(value || 0) * 10}%`, background: color }}
        />
      </div>
    </div>
  );
}

function BallCard({
  pick, index, brandColor, videoLoading, onOpen, onClose, isOpen, onVideo,
}: {
  pick: BrandPick;
  index: number;
  brandColor: string;
  videoLoading: boolean;
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
  onVideo: () => void;
}) {
  return (
    <WoodCard
      onClick={() => isOpen ? onClose() : onOpen()}
      className={index === 0 ? 'ring-1' : ''}
      style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
        <div
          className="w-14 h-14 rounded-xl border-2 overflow-hidden flex items-center justify-center"
          style={{
            background:  index === 0 ? `${brandColor}22` : 'var(--bg-muted)',
            borderColor: index === 0 ? brandColor : 'var(--border)',
          }}
        >
          {pick.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pick.imageUrl}
              alt={pick.ballName}
              className="w-full h-full object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.parentElement as HTMLElement).dataset.fallback = '1'; }}
            />
          ) : pick.youtubeId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://img.youtube.com/vi/${pick.youtubeId}/default.jpg`}
              alt={pick.ballName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl">{MEDALS[index]}</span>
          )}
        </div>
        {(pick.imageUrl || pick.youtubeId) && (
          <span className="absolute -bottom-1 -right-1 text-sm leading-none">{MEDALS[index]}</span>
        )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4
              className="font-bold text-sm truncate"
              style={{ color: index === 0 ? brandColor : 'var(--text-primary)' }}
            >
              {pick.ballName}
            </h4>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              {pick.price && (
                <span className="text-xs font-bold" style={{ color: brandColor }}>{pick.price}</span>
              )}
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{isOpen ? '▲' : '▼'}</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {pick.cover}{pick.lane ? ` · ${pick.lane}` : ''}
          </p>
        </div>
      </div>

      {isOpen && (
        <div
          className="mt-4 pt-4 border-t space-y-3"
          style={{ borderColor: 'var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {(pick.hook > 0 || pick.speed > 0) && (
            <div className="space-y-2">
              {pick.hook  > 0 && <StatBar label="Hook Potential" value={pick.hook}  color={brandColor} />}
              {pick.speed > 0 && <StatBar label="Ball Speed"     value={pick.speed} color="var(--blue)" />}
            </div>
          )}
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {pick.reasoning}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onVideo}
              disabled={videoLoading}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{ background: brandColor, color: '#fff' }}
            >
              {videoLoading ? 'Finding video…' : '▶ Watch Video'}
            </button>
            <button
              onClick={onClose}
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

export function BallPickerScreen() {
  const [brands, setBrands]       = useState<BrandGroup[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string>('Storm');
  const [openKey, setOpenKey]     = useState<string | null>(null);
  const [video, setVideo]         = useState<{ youtubeId: string; title: string } | null>(null);
  const [videoLoading, setVideoLoading] = useState<string | null>(null);

  const now       = new Date();
  const monthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    fetch('/api/balls-of-month')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.brands)) {
          setBrands(data.brands);
          if (data.brands.length > 0) setActiveBrand(data.brands[0].brand);
        } else if (data?.error) setFetchError(data.error);
      })
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function openVideo(pick: BrandPick, key: string) {
    if (pick.youtubeId) {
      setVideo({ youtubeId: pick.youtubeId, title: `${pick.ballName} Review` });
      return;
    }
    setVideoLoading(key);
    try {
      const res  = await fetch('/api/youtube-id', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ballName: pick.ballName, brand: pick.brand }),
      });
      const data = await res.json();
      if (data.youtubeId) {
        setVideo({ youtubeId: data.youtubeId, title: `${pick.ballName} Review` });
      } else {
        alert(`No video found for ${pick.ballName} yet.`);
      }
    } finally {
      setVideoLoading(null);
    }
  }

  const activeGroup = brands.find((g) => g.brand === activeBrand);
  const activeColor = BRAND_COLORS[activeBrand] ?? 'var(--accent)';

  return (
    <div className="pb-6">
      <PageHeader title="Top Balls" subtitle={`Best picks for ${monthYear}`} emoji="🎳" />

      {loading && (
        <div className="px-4 mt-8 text-center" style={{ color: 'var(--text-faint)' }}>
          <p className="text-3xl mb-2">⏳</p>
          <p className="text-sm">Loading picks…</p>
        </div>
      )}

      {!loading && fetchError && (
        <div className="mx-4 mt-4 rounded-xl px-4 py-3 text-xs break-all" style={{ background: 'var(--bg-card)', color: 'var(--red)', border: '1px solid var(--red)' }}>
          ⚠️ {fetchError}
        </div>
      )}

      {!loading && !fetchError && brands.length === 0 && (
        <div className="px-4 mt-8 text-center" style={{ color: 'var(--text-faint)' }}>
          <p className="text-3xl mb-2">🎳</p>
          <p className="text-sm">No picks available yet.</p>
        </div>
      )}

      {brands.length > 0 && (
        <>
          {/* Brand tabs */}
          <div className="overflow-x-auto px-4 mb-4 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <div className="flex gap-2 min-w-max">
              {brands.map((group) => {
                const color    = BRAND_COLORS[group.brand] ?? 'var(--accent)';
                const isActive = group.brand === activeBrand;
                return (
                  <button
                    key={group.brand}
                    onClick={() => { setActiveBrand(group.brand); setOpenKey(null); }}
                    className="px-4 py-2 rounded-full text-xs font-bold transition-all"
                    style={{
                      background:  isActive ? color : 'var(--bg-card)',
                      color:       isActive ? '#fff' : color,
                      border:      `2px solid ${color}`,
                      opacity:     isActive ? 1 : 0.7,
                    }}
                  >
                    {group.brand}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active brand picks */}
          {activeGroup && (
            <div className="px-4 space-y-2">
              <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
                AI-curated · updated monthly
              </p>
              {activeGroup.picks.map((pick, i) => {
                const key = `${activeGroup.brand}-${i}`;
                return (
                  <BallCard
                    key={key}
                    pick={pick}
                    index={i}
                    brandColor={activeColor}
                    isOpen={openKey === key}
                    videoLoading={videoLoading === key}
                    onOpen={() => setOpenKey(key)}
                    onClose={() => setOpenKey(null)}
                    onVideo={() => openVideo(pick, key)}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {video && (
        <VideoModal youtubeId={video.youtubeId} title={video.title} onClose={() => setVideo(null)} />
      )}
    </div>
  );
}
