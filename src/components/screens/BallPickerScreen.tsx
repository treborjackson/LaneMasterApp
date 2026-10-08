'use client';

import { useState, useEffect } from 'react';
import { WoodCard } from '@/components/ui/WoodCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { VideoModal } from '@/components/ui/VideoModal';
import { BALL_REVIEWS } from '@/lib/constants/ballReviews';


const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
const MEDAL_LABELS = ['1st Place', '2nd Place', '3rd Place', '4th Place', '5th Place'];

interface MonthPick {
  ballName:  string;
  brand:     string;
  cover:     string;
  lane:      string;
  hook:      number;
  speed:     number;
  price:     string;
  reasoning: string;
}

interface BomData {
  picks:   MonthPick[];
  sources: string[];
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
          style={{ width: `${(value || 0) * 10}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function BallPickerScreen() {
  const [bom, setBom]             = useState<BomData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [open, setOpen]           = useState<number | null>(null);
  const [video, setVideo] = useState<{ youtubeId?: string; searchQuery?: string; title: string } | null>(null);

  useEffect(() => {
    fetch('/api/balls-of-month')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.picks)) setBom(data);
        else if (data?.error) setFetchError(data.error);
      })
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openVideo(pick: MonthPick) {
    const rev = BALL_REVIEWS.find((r) => r.ballName.toLowerCase() === pick.ballName.toLowerCase());
    if (rev) {
      setVideo({ youtubeId: rev.youtubeId, title: rev.title });
    } else {
      setVideo({
        searchQuery: `${pick.brand} ${pick.ballName} bowling ball review`,
        title: `${pick.ballName} Videos`,
      });
    }
  }

  return (
    <div className="pb-6">
      <PageHeader title="Top 5 Balls" subtitle="Best balls this month" emoji="🎳" />

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

      {!loading && !fetchError && (!bom || bom.picks.length === 0) && (
        <div className="px-4 mt-8 text-center" style={{ color: 'var(--text-faint)' }}>
          <p className="text-3xl mb-2">🎳</p>
          <p className="text-sm">No picks available yet.</p>
        </div>
      )}

      {bom && bom.picks.length > 0 && (
        <div className="px-4 space-y-3">
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
            const isOpen  = open === i;
            const isTop3  = i < 3;
            const hasVideo = BALL_REVIEWS.some((r) => r.ballName.toLowerCase() === pick.ballName.toLowerCase());

            return (
              <WoodCard
                key={pick.ballName}
                onClick={() => setOpen(isOpen ? null : i)}
                className={isTop3 ? 'ring-1' : ''}
                style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
              >
                {/* Collapsed row */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-full flex flex-col items-center justify-center flex-shrink-0 border-2"
                    style={{
                      background:  isTop3 ? 'var(--accent)18' : 'var(--bg-muted)',
                      borderColor: isTop3 ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    <span className="text-2xl leading-none">{MEDALS[i]}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className="font-bold text-base truncate"
                        style={{ color: isTop3 ? 'var(--accent)' : 'var(--text-primary)' }}
                      >
                        {pick.ballName}
                      </h3>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {pick.price && (
                          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{pick.price}</span>
                        )}
                        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pick.brand}{pick.cover ? ` · ${pick.cover}` : ''}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className="inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: isTop3 ? 'var(--accent)22' : 'var(--bg-deep)',
                          color:      isTop3 ? 'var(--accent)' : 'var(--text-faint)',
                        }}
                      >
                        {MEDAL_LABELS[i]}
                      </span>
                      {!isOpen && (
                        <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>▶ video</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div
                    className="mt-4 pt-4 border-t space-y-4"
                    style={{ borderColor: 'var(--border)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Large medal + details */}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl flex-shrink-0 border-4 shadow-lg"
                        style={{ background: isTop3 ? 'var(--accent)18' : 'var(--bg-muted)', borderColor: 'var(--accent)' }}
                      >
                        {MEDALS[i]}
                      </div>
                      <div className="flex-1 space-y-1">
                        {pick.cover && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pick.cover}</p>
                        )}
                        {pick.lane && (
                          <div
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg"
                            style={{ background: 'var(--bg-muted)' }}
                          >
                            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Best on:</span>
                            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>{pick.lane}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stat bars */}
                    {(pick.hook > 0 || pick.speed > 0) && (
                      <div className="space-y-2">
                        {pick.hook  > 0 && <StatBar label="Hook Potential" value={pick.hook}  color="var(--accent)" />}
                        {pick.speed > 0 && <StatBar label="Ball Speed"     value={pick.speed} color="var(--blue)"   />}
                      </div>
                    )}

                    {/* Reasoning */}
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {pick.reasoning}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openVideo(pick)}
                        className="flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5"
                        style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
                      >
                        ▶ Watch Video
                      </button>
                      <button
                        onClick={() => setOpen(null)}
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
      )}

      {video && (
        <VideoModal
          youtubeId={video.youtubeId}
          searchQuery={video.searchQuery}
          title={video.title}
          onClose={() => setVideo(null)}
        />
      )}
    </div>
  );
}
