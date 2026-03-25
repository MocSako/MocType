import { create } from "zustand";

export type LetterStatus = "pending" | "correct" | "incorrect" | "extra";

export type SegmentType =
  | "prose"
  | "numbers"
  | "punctuation_heavy"
  | "proper_noun"
  | "code"
  | "heading";

export interface Letter {
  char: string;
  status: LetterStatus;
}

export interface Word {
  letters: Letter[];
  typed: string;
  segment?: SegmentType;
}

export interface WpmSnapshot {
  second: number;
  wpm: number;
  raw: number;
}

export interface SegmentMetric {
  type: SegmentType;
  wordCount: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  wpm: number;
}

export interface TestStats {
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  time: number;
  segmentMetrics?: SegmentMetric[];
  isSourceRun?: boolean;
}

export type TestPhase = "idle" | "typing" | "finished";

interface TestState {
  words: Word[];
  currentWordIndex: number;
  currentLetterIndex: number;
  phase: TestPhase;
  timerSeconds: number;
  startTime: number | null;
  wpmHistory: WpmSnapshot[];
  stats: TestStats | null;
  isSourceRun: boolean;

  setWords: (words: Word[]) => void;
  setPhase: (phase: TestPhase) => void;
  setTimerSeconds: (s: number) => void;
  setStartTime: (t: number | null) => void;
  setCurrentWordIndex: (i: number) => void;
  setCurrentLetterIndex: (i: number) => void;
  updateWord: (index: number, word: Word) => void;
  addWpmSnapshot: (snapshot: WpmSnapshot) => void;
  setStats: (stats: TestStats) => void;
  setIsSourceRun: (v: boolean) => void;
  reset: () => void;
}

const initialState = {
  words: [] as Word[],
  currentWordIndex: 0,
  currentLetterIndex: 0,
  phase: "idle" as TestPhase,
  timerSeconds: 0,
  startTime: null as number | null,
  wpmHistory: [] as WpmSnapshot[],
  stats: null as TestStats | null,
  isSourceRun: false,
};

export const useTestStore = create<TestState>()((set) => ({
  ...initialState,

  setWords: (words) => set({ words }),
  setPhase: (phase) => set({ phase }),
  setTimerSeconds: (timerSeconds) => set({ timerSeconds }),
  setStartTime: (startTime) => set({ startTime }),
  setCurrentWordIndex: (currentWordIndex) => set({ currentWordIndex }),
  setCurrentLetterIndex: (currentLetterIndex) => set({ currentLetterIndex }),
  updateWord: (index, word) =>
    set((state) => {
      const words = [...state.words];
      words[index] = word;
      return { words };
    }),
  addWpmSnapshot: (snapshot) =>
    set((state) => ({ wpmHistory: [...state.wpmHistory, snapshot] })),
  setStats: (stats) => set({ stats }),
  setIsSourceRun: (isSourceRun) => set({ isSourceRun }),
  reset: () => set({ ...initialState }),
}));
