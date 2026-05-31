import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ball } from '@/lib/types/ball';
import type { BowlingStyle, SkillLevel } from '@/lib/types/coach';

interface AppState {
  activeTab:       string;
  setActiveTab:    (tab: string) => void;

  selectedBall:    Ball | null;
  setSelectedBall: (ball: Ball | null) => void;

  bowlingStyle:    BowlingStyle | null;
  skillLevel:      SkillLevel | null;
  setBowlingStyle: (style: BowlingStyle) => void;
  setSkillLevel:   (level: SkillLevel) => void;
  resetCoach:      () => void;

  favBrands:   string[];
  toggleBrand: (brand: string) => void;
  clearBrands: () => void;

  token: string | null;
  user:  { id: string; email: string; name?: string } | null;
  setAuth:   (token: string, user: { id: string; email: string; name?: string }) => void;
  clearAuth: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab:    'picker',
      setActiveTab: (tab) => set({ activeTab: tab }),

      selectedBall:    null,
      setSelectedBall: (ball) => set({ selectedBall: ball }),

      bowlingStyle:    null,
      skillLevel:      null,
      setBowlingStyle: (style) => set({ bowlingStyle: style }),
      setSkillLevel:   (level) => set({ skillLevel: level }),
      resetCoach:      () => set({ bowlingStyle: null, skillLevel: null }),

      favBrands:   [],
      toggleBrand: (brand) =>
        set((s) => ({
          favBrands: s.favBrands.includes(brand)
            ? s.favBrands.filter((b) => b !== brand)
            : [...s.favBrands, brand],
        })),
      clearBrands: () => set({ favBrands: [] }),

      token: null,
      user:  null,
      setAuth:   (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    { name: 'lane-master-store' }
  )
);
