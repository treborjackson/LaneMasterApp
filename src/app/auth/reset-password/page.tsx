'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

function ResetPasswordContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get('token') ?? '';
  const { setAuth } = useAppStore();

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Reset failed'); return; }
      setAuth(data.token, data.user);
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: 'var(--bg-card)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="flex flex-col gap-4">
      {!token ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Invalid reset link</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            This link is missing or invalid. Request a new one from the login screen.
          </p>
          <button onClick={() => router.push('/auth/login')}
            className="mt-4 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            ← Back to login
          </button>
        </div>
      ) : success ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-3">🎳</p>
          <p className="text-sm font-bold" style={{ color: '#10b981' }}>Password updated!</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Taking you to the app…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Choose a new password</p>
          <div>
            <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoFocus
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your new password"
              required
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
              style={inputStyle}
            />
          </div>
          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}>
            {loading ? 'Saving…' : 'Set New Password'}
          </button>
          <button type="button" onClick={() => router.push('/auth/login')}
            className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
            ← Back to login
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center items-start min-h-screen" style={{ background: '#0a0704' }}>
      <div className="flex flex-col w-full max-w-[430px] min-h-screen p-6"
        style={{ background: 'var(--bg)' }}>
        <div className="text-center mb-8 mt-12">
          <p className="text-5xl mb-3">🎳</p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
            Lane Master
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Reset your password</p>
        </div>
        <Suspense fallback={null}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
