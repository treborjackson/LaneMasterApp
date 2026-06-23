'use client';

import { useAppStore } from '@/store/appStore';

const TABS = [
  { id: 'picker',   label: 'Balls',    emoji: '🎳' },
  { id: 'oil',      label: 'Oil',      emoji: '🛢️' },
  { id: 'coach',    label: 'Coach',    emoji: '🧑‍🏫' },
  { id: 'form',     label: 'Form',     emoji: '📸' },
  { id: 'score',    label: 'Score',    emoji: '📊' },
  { id: 'history',  label: 'History',  emoji: '📜' },
];

export function BottomTabBar() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav
      className="flex items-center border-t flex-shrink-0"
      style={{
        background: 'var(--bg-deep)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-1 flex-col items-center pt-2 pb-1 gap-0.5 relative transition-all"
            style={{ opacity: active ? 1 : 0.45 }}
          >
            {active && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
            <span className={`leading-none transition-transform ${active ? 'text-xl scale-110' : 'text-lg'}`}>
              {tab.emoji}
            </span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: active ? 'var(--accent)' : 'var(--text-faint)' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
