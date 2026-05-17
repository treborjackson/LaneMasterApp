'use client';

import { useRouter } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAppStore } from '@/store/appStore';

export default function SignupPage() {
  const router       = useRouter();
  const { setActiveTab } = useAppStore();

  return (
    <div className="flex justify-center items-start min-h-screen" style={{ background: '#0a0704' }}>
      <div
        className="flex flex-col w-full max-w-[430px] min-h-screen p-6"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center mb-8 mt-12">
          <p className="text-5xl mb-3">🎳</p>
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
          >
            Create Account
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Join Lane Master and start coaching
          </p>
        </div>

        <SignupForm
          onSuccess={() => { setActiveTab('picker'); router.push('/'); }}
          onLogin={() => router.push('/auth/login')}
        />
      </div>
    </div>
  );
}
