'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';

interface LoginFormProps {
  onSuccess?: () => void;
  onSignup?:  () => void;
}

export function LoginForm({ onSuccess, onSignup }: LoginFormProps) {
  const { login } = useAuth();
  const { setActiveTab } = useAppStore();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent]   = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onSuccess?.() ?? setActiveTab('picker');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Enter your email above first'); return; }
    setResetLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.debug === 'no user found') {
        setError('No account found for that email');
        return;
      }
      if (data.emailError) {
        setError('Email error: ' + data.emailError);
        return;
      }
      setResetSent(true);
    } finally {
      setResetLoading(false);
    }
  }

  if (showForgot) {
    return (
      <div className="flex flex-col gap-4">
        {resetSent ? (
          <div className="text-center py-4">
            <p className="text-3xl mb-3">📧</p>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Check your email</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              If <strong>{email}</strong> has an account, a reset link is on its way. It expires in 1 hour.
            </p>
            <button onClick={() => { setShowForgot(false); setResetSent(false); }}
              className="mt-5 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              ← Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="flex flex-col gap-4">
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Reset your password</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Enter your email and we'll send you a link to set a new password.
            </p>
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
            <button type="submit" disabled={resetLoading}
              className="py-3 rounded-xl font-bold text-sm disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}>
              {resetLoading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => setShowForgot(false)}
              className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
              ← Back to login
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Password</label>
          <button type="button" onClick={() => setShowForgot(true)}
            className="text-xs" style={{ color: 'var(--accent)' }}>
            Forgot password?
          </button>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="py-3 rounded-xl font-bold text-sm disabled:opacity-50"
        style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
      >
        {loading ? 'Logging in…' : 'Log In'}
      </button>
      {onSignup && (
        <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
          No account?{' '}
          <button type="button" onClick={onSignup} style={{ color: 'var(--accent)' }}>Sign up</button>
        </p>
      )}
    </form>
  );
}
