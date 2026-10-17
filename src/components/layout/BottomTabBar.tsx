'use client';

import { useAppStore } from '@/store/appStore';

const TABS = [
  { id: 'picker',   label: 'Balls',    emoji: '🎳'  },
  { id: 'myballs',  label: 'My Bag',   emoji: '🏆'  },
  { id: 'practice', label: 'Practice', emoji: '🏋️'  },
  { id: 'coach',    label: 'Coach',    emoji: '🧑‍🏫' },
  { id: 'score',    label: 'Notes',    emoji: '📊'  },
  { id: 'history',  label: 'Log',      emoji: '📜'  },
];

export function BottomTabBar() {
  const { activeTab, setActiveTab } = useAppStore();
  const tabs = TABS;

  return (
    <nav
      className="border-t flex-shrink-0 overflow-x-auto"
      style={{
        background: 'var(--bg-deep)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex items-center min-w-max px-1">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center pt-2 pb-1 gap-0.5 relative transition-all"
            style={{ minWidth: '64px' }}
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
      </div>
    </nav>
  );
}
