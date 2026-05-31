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
      className="flex items-center border-t"
      style={{ background: 'var(--bg-deep)', borderColor: 'var(--border)' }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-1 flex-col items-center py-2 gap-0.5 transition-opacity"
            style={{ opacity: active ? 1 : 0.5 }}
          >
            <span className="text-lg leading-none">{tab.emoji}</span>
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
