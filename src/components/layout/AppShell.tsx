'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { StatusBar } from './StatusBar';
import { TopNav } from './TopNav';
import { BottomTabBar } from './BottomTabBar';
import { BallPickerScreen } from '@/components/screens/BallPickerScreen';
import { OilPatternScreen } from '@/components/screens/OilPatternScreen';
import { CoachScreen } from '@/components/screens/CoachScreen';
import { ScoreScreen } from '@/components/screens/ScoreScreen';
import { HistoryScreen } from '@/components/screens/HistoryScreen';
import { AdminScreen } from '@/components/screens/AdminScreen';

const SEVENTY_TWO_HOURS = 72 * 60 * 60 * 1000;

const SCREENS: Record<string, React.ReactNode> = {
  picker:  <BallPickerScreen />,
  oil:     <OilPatternScreen />,
  coach:   <CoachScreen />,
  score:   <ScoreScreen />,
  history: <HistoryScreen />,
  admin:   <AdminScreen />,
};

export function AppShell() {
  const { activeTab, token, loginAt, clearAuth } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    // No token → go to login
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    // Token older than 72h → auto-logout
    if (loginAt && Date.now() - loginAt > SEVENTY_TWO_HOURS) {
      clearAuth();
      router.replace('/auth/login');
    }
  }, [token, loginAt, clearAuth, router]);

  // Don't render the app until we know the user is valid
  if (!token) return null;

  return (
    <div className="flex justify-center items-start h-[100dvh]" style={{ background: '#0a0704' }}>
      <div
        className="relative flex flex-col w-full max-w-[430px] h-[100dvh] overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg)' }}
      >
        <StatusBar />
        <TopNav />
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {SCREENS[activeTab] ?? SCREENS.picker}
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
