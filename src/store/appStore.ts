import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ball } from '@/lib/types/ball';
import type { BowlingStyle, SkillLevel, Handedness, CoachMessage } from '@/lib/types/coach';

interface AppState {
  activeTab:       string;
  setActiveTab:    (tab: string) => void;

  selectedBall:    Ball | null;
  setSelectedBall: (ball: Ball | null) => void;

  bowlingStyle:    BowlingStyle | null;
  skillLevel:      SkillLevel | null;
  handedness:      Handedness | null;
  goals:           string[];
  coachMessages:   CoachMessage[];
  setBowlingStyle:  (style: BowlingStyle) => void;
  setSkillLevel:    (level: SkillLevel) => void;
  setHandedness:    (hand: Handedness) => void;
  setGoals:         (goals: string[]) => void;
  setCoachMessages: (msgs: CoachMessage[]) => void;
  resetCoach:       () => void;

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
      handedness:      null,
      goals:           [],
      coachMessages:   [],
      setBowlingStyle:  (style) => set({ bowlingStyle: style }),
      setSkillLevel:    (level) => set({ skillLevel: level }),
      setHandedness:    (hand)  => set({ handedness: hand }),
      setGoals:         (goals) => set({ goals }),
      setCoachMessages: (msgs)  => set({ coachMessages: msgs }),
      resetCoach:       () => set({ bowlingStyle: null, skillLevel: null, handedness: null, goals: [], coachMessages: [] }),

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
