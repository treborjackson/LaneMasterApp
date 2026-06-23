'use client';

import { useAppStore } from '@/store/appStore';
import { StatusBar } from './StatusBar';
import { TopNav } from './TopNav';
import { BottomTabBar } from './BottomTabBar';
import { BallPickerScreen } from '@/components/screens/BallPickerScreen';
import { OilPatternScreen } from '@/components/screens/OilPatternScreen';
import { CoachScreen } from '@/components/screens/CoachScreen';
import { FormAnalyzerScreen } from '@/components/screens/FormAnalyzerScreen';
import { ScoreScreen } from '@/components/screens/ScoreScreen';
import { HistoryScreen } from '@/components/screens/HistoryScreen';

const SCREENS: Record<string, React.ReactNode> = {
  picker:  <BallPickerScreen />,
  oil:     <OilPatternScreen />,
  coach:   <CoachScreen />,
  form:    <FormAnalyzerScreen />,
  score:   <ScoreScreen />,
  history: <HistoryScreen />,
};

export function AppShell() {
  const { activeTab } = useAppStore();

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
