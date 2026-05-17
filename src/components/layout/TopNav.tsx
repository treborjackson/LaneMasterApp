'use client';

import { useAppStore } from '@/store/appStore';

export function TopNav() {
  const { selectedBall } = useAppStore();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <div>
        <h1 className="text-lg font-bold tracking-wide" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
          🎳 Lane Master
        </h1>
      </div>
      {selectedBall && (
        <div
          className="text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
        >
          {selectedBall.emoji} {selectedBall.name}
        </div>
      )}
    </div>
  );
}
