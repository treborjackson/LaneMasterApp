'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAppStore } from '@/store/appStore';

export default function LoginPage() {
  const [view, setView]   = useState<'login' | 'signup'>('login');
  const { setActiveTab }  = useAppStore();

  return (
    <div className="flex justify-center items-start min-h-screen" style={{ background: '#0a0704' }}>
      <div
        className="flex flex-col w-full max-w-[430px] min-h-screen p-6"
        style={{ background: 'var(--bg)' }}
      >
        {/* Header */}
        <div className="text-center mb-8 mt-12">
          <p className="text-5xl mb-3">🎳</p>
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
          >
            Lane Master
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            AI-powered bowling coaching
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden border mb-6" style={{ borderColor: 'var(--border)' }}>
          {(['login', 'signup'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: view === v ? 'var(--accent)' : 'var(--bg-card)',
                color:      view === v ? 'var(--bg-deep)' : 'var(--text-muted)',
              }}
            >
              {v === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {view === 'login' ? (
          <LoginForm
            onSuccess={() => setActiveTab('picker')}
            onSignup={() => setView('signup')}
          />
        ) : (
          <SignupForm
            onSuccess={() => setActiveTab('picker')}
            onLogin={() => setView('login')}
          />
        )}

        <button
          onClick={() => setActiveTab('picker')}
          className="mt-6 text-xs text-center"
          style={{ color: 'var(--text-faint)' }}
        >
          Continue without account →
        </button>
      </div>
    </div>
  );
}
