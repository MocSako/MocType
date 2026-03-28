import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BugHuntDifficulty } from "@/lib/bug-hunt/types";

export type Mode = "time" | "words" | "quote" | "zen" | "source" | "bug-hunt";

interface ConfigState {
  mode: Mode;
  timeConfig: number;
  wordConfig: number;
  quoteLength: "all" | "short" | "medium" | "long";
  punctuation: boolean;
  numbers: boolean;
  bugHuntDifficulty: BugHuntDifficulty;

  setMode: (mode: Mode) => void;
  setTimeConfig: (t: number) => void;
  setWordConfig: (w: number) => void;
  setQuoteLength: (q: "all" | "short" | "medium" | "long") => void;
  togglePunctuation: () => void;
  toggleNumbers: () => void;
  setBugHuntDifficulty: (d: BugHuntDifficulty) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      mode: "time",
      timeConfig: 30,
      wordConfig: 50,
      quoteLength: "medium",
      punctuation: false,
      numbers: false,
      bugHuntDifficulty: "easy",

      setMode: (mode) => set({ mode }),
      setTimeConfig: (timeConfig) => set({ timeConfig }),
      setWordConfig: (wordConfig) => set({ wordConfig }),
      setQuoteLength: (quoteLength) => set({ quoteLength }),
      togglePunctuation: () => set((s) => ({ punctuation: !s.punctuation })),
      toggleNumbers: () => set((s) => ({ numbers: !s.numbers })),
      setBugHuntDifficulty: (bugHuntDifficulty) => set({ bugHuntDifficulty }),
    }),
    { name: "moctype-config" }
  )
);
