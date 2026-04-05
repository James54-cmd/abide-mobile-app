import { create } from "zustand";
import type { BibleReaderSettings } from "@/features/bible/types";

interface BibleReaderStore {
  settings: BibleReaderSettings;
  setSettings: (settings: BibleReaderSettings) => void;
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
}

export const useBibleReaderStore = create<BibleReaderStore>((set) => ({
  settings: {
    fontSize: "medium",
    fontFamily: "serif", 
    lineSpacing: "normal",
  },
  setSettings: (settings) => set({ settings }),
  initialized: false,
  setInitialized: (initialized) => set({ initialized }),
}));