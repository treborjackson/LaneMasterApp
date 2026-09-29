'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';

interface SignupFormProps {
  onSuccess?:   () => void;
  onLogin?:     () => void;
  inviteToken?: string;
  inviteEmail?: string;
}

export function SignupForm({ onSuccess, onLogin, inviteToken, inviteEmail }: SignupFormProps) {
  const { signup } = useAuth();
  const { setActiveTab } = useAppStore();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState(inviteEmail ?? '');
  const [password, setPassword] = useState('');
  const [token, setToken]       = useState(inviteToken ?? '');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!token.trim()) { setError('An invite code is required to sign up'); return; }
    setLoading(true);
    setError('');
    try {
      await signup(email, password, name || undefined, token.trim());
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
          readOnly={!!inviteEmail}
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
          style={{
            background:  'var(--bg-card)',
            borderColor: 'var(--border)',
            color:       'var(--text-primary)',
            opacity:     inviteEmail ? 0.7 : 1,
          }}
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
      <div>
        <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          Invite Code
          {inviteToken && <span className="ml-1 text-[10px]" style={{ color: 'var(--accent)' }}>✓ applied</span>}
        </label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          readOnly={!!inviteToken}
          placeholder="Paste invite code here"
          className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none font-mono"
          style={{
            background:  'var(--bg-card)',
            borderColor: inviteToken ? 'var(--accent)' : 'var(--border)',
            color:       'var(--text-primary)',
            opacity:     inviteToken ? 0.7 : 1,
          }}
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
