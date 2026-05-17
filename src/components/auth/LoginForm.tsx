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
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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
        <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Password</label>
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
