'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { apiAnalyzeForm } from '@/lib/api';
import { PROS } from '@/lib/constants/pros';
import { WoodCard } from '@/components/ui/WoodCard';
import { WoodPill } from '@/components/ui/WoodPill';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { CompareBar } from '@/components/ui/CompareBar';
import type { SoloFormResult, CompareFormResult } from '@/lib/types/form';

type Mode = 'solo' | 'compare';

export function FormAnalyzerScreen() {
  const { token, selectedBall } = useAppStore();
  const [mode, setMode]         = useState<Mode>('solo');
  const [selectedPro, setSelectedPro] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<SoloFormResult | CompareFormResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!imageBase64 || !token) return;
    setLoading(true);
    try {
      const res = await apiAnalyzeForm(token, {
        imageBase64,
        analyzeMode: mode,
        proName:     mode === 'compare' ? selectedPro : undefined,
        ball:        selectedBall,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const isSolo = (r: SoloFormResult | CompareFormResult): r is SoloFormResult => 'stance' in r;

  return (
    <div className="pb-4">
      <PageHeader title="Form Analyzer" subtitle="AI-powered form analysis" emoji="📸" />

      <div className="px-4 space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <WoodPill active={mode === 'solo'}    onClick={() => setMode('solo')}>Solo Analysis</WoodPill>
          <WoodPill active={mode === 'compare'} onClick={() => setMode('compare')}>Compare to Pro</WoodPill>
        </div>

        {/* Pro selector */}
        {mode === 'compare' && (
          <div className="flex flex-wrap gap-2">
            {PROS.map((pro) => (
              <WoodPill key={pro.name} active={selectedPro === pro.name} onClick={() => setSelectedPro(pro.name)}>
                {pro.emoji} {pro.name.split(' ')[0]}
              </WoodPill>
            ))}
          </div>
        )}

        {/* Photo upload */}
        <WoodCard onClick={() => fileRef.current?.click()} className="text-center cursor-pointer">
          {imagePreview ? (
            <img src={imagePreview} alt="Form photo" className="w-full rounded-lg object-cover max-h-48" />
          ) : (
            <div className="py-8" style={{ color: 'var(--text-faint)' }}>
              <p className="text-4xl mb-2">📷</p>
              <p className="text-sm">Tap to upload a photo of your form</p>
            </div>
          )}
        </WoodCard>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {/* Analyze button */}
        {imageBase64 && (
          <button
            onClick={analyze}
            disabled={loading || (mode === 'compare' && !selectedPro) || !token}
            className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
          >
            {loading ? 'Analyzing…' : '🔍 Analyze Form'}
          </button>
        )}

        {!token && (
          <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>Log in to use AI form analysis</p>
        )}

        {/* Results */}
        {result && isSolo(result) && (
          <WoodCard>
            <p className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Form Score</p>
            <ScoreBar label="Overall" value={result.score} />
            <div className="mt-3 space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {(['stance', 'backswing', 'release', 'followThrough', 'footwork'] as const).map((k) => (
                <div key={k}>
                  <span className="font-semibold capitalize" style={{ color: 'var(--accent)' }}>{k}: </span>
                  {result[k]}
                </div>
              ))}
            </div>
            {result.tips.length > 0 && (
              <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>💡 Tips</p>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                  {result.tips.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </div>
            )}
          </WoodCard>
        )}

        {result && !isSolo(result) && (
          <WoodCard>
            <p className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              vs {(result as CompareFormResult).proName}
            </p>
            <div className="space-y-3">
              {(result as CompareFormResult).categories.map((cat) => (
                <CompareBar key={cat.name} label={cat.name} userScore={cat.userScore} proScore={cat.proScore} />
              ))}
            </div>
            <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--bg-muted)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>🏋️ Drills to Close the Gap</p>
              <ul className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                {(result as CompareFormResult).drillsToClose.map((d, i) => <li key={i}>• {d}</li>)}
              </ul>
            </div>
          </WoodCard>
        )}
      </div>
    </div>
  );
}
