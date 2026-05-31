'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';

interface SignupFormProps {
  onSuccess?: () => void;
  onLogin?:   () => void;
}

export function SignupForm({ onSuccess, onLogin }: SignupFormProps) {
  const { signup } = useAuth();
  const { setActiveTab } = useAppStore();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await signup(email, password, name || undefined);
      onSuccess?.() ?? setActiveTab('picker');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
      </div>
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
        <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Password (min 8 chars)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
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
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
      {onLogin && (
        <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
          Already have an account?{' '}
          <button type="button" onClick={onLogin} style={{ color: 'var(--accent)' }}>Log in</button>
        </p>
      )}
    </form>
  );
}
