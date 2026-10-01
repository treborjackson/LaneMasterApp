'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';

export function TopNav() {
  const { selectedBall, setActiveTab, user } = useAppStore();
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = !!ADMIN_EMAIL && user?.email === ADMIN_EMAIL;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLoginClick() {
    window.location.href = '/auth/login';
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    router.push('/auth/login');
  }

  function handleAdmin() {
    setMenuOpen(false);
    setActiveTab('admin');
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
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex flex-col items-center justify-center gap-[5px] w-9 h-9 rounded-lg"
              style={{ background: menuOpen ? 'var(--bg-card)' : 'transparent', border: '1px solid var(--border)' }}
              aria-label="Menu"
            >
              <span className="block w-4 h-[2px] rounded-full" style={{ background: 'var(--text-muted)' }} />
              <span className="block w-4 h-[2px] rounded-full" style={{ background: 'var(--text-muted)' }} />
              <span className="block w-4 h-[2px] rounded-full" style={{ background: 'var(--text-muted)' }} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden shadow-lg z-50"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text-muted)' }}>
                    {user?.name ?? user?.email ?? 'Account'}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={handleAdmin}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:brightness-125 transition-all"
                    style={{ color: 'var(--accent)' }}
                  >
                    <span>🔐</span>
                    <span className="font-semibold">Admin</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:brightness-125 transition-all"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>🚪</span>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
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
