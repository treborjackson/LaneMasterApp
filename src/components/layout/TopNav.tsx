'use client';

import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/hooks/useAuth';

export function TopNav() {
  const { selectedBall, setActiveTab } = useAppStore();
  const { user, logout, isAuthenticated } = useAuth();

  function handleLoginClick() {
    window.location.href = '/auth/login';
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <h1
        className="text-lg font-bold tracking-wide cursor-pointer"
        style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
        onClick={() => setActiveTab('picker')}
      >
        🎳 Lane Master
      </h1>

      <div className="flex items-center gap-2">
        {selectedBall && (
          <div
            className="text-xs px-2 py-1 rounded-full font-semibold"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {selectedBall.emoji} {selectedBall.name}
          </div>
        )}

        {isAuthenticated ? (
          <button
            onClick={logout}
            className="text-xs px-2 py-1 rounded-full font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
            title={`Logged in as ${user?.email}`}
          >
            {user?.name ? user.name.split(' ')[0] : '👤'} ×
          </button>
        ) : (
          <button
            onClick={handleLoginClick}
            className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
          >
            Log In
          </button>
        )}
      </div>
    </div>
  );
}
