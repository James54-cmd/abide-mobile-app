import { create } from "zustand";
import type { StreakState } from "@/types";

interface StreakStore extends StreakState {
  setStreak: (next: Partial<StreakState>) => void;
}

export const useStreakStore = create<StreakStore>((set) => ({
  streakCount: 0,
  streakLastActive: null,
  treeStage: 1,
  longestStreak: 0,
  setStreak: (next) => set((state) => ({ ...state, ...next }))
}));
