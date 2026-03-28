import { describe, it, expect } from "vitest";
import {
  calculateAccuracy,
  calculateWpm,
  calculateRawWpm,
  computeFinalStats,
} from "./calculateStats";
import type { Word } from "@/store/useTestStore";

function mkWord(chars: string, statuses: Word["letters"][number]["status"][], typed: string): Word {
  return {
    letters: chars.split("").map((char, i) => ({ char, status: statuses[i] })),
    typed,
  };
}

describe("calculateAccuracy", () => {
  it("returns 100 when all chars are correct", () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
  });

  it("returns 100 when totalChars is 0", () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  it("returns a rounded percentage", () => {
    expect(calculateAccuracy(3, 4)).toBe(75);
  });
});

describe("computeFinalStats", () => {
  it("counts skipped characters (incorrect via early advance) against accuracy", () => {
    const words: Word[] = [
      mkWord("hello,", ["correct", "correct", "correct", "correct", "correct", "incorrect"], "hello"),
      mkWord("world", ["correct", "correct", "correct", "correct", "correct"], "world"),
    ];

    const stats = computeFinalStats(words, [], 10, 2);

    expect(stats.correctChars).toBe(10 + 2);
    expect(stats.incorrectChars).toBe(1);
    expect(stats.missedChars).toBe(0);
    expect(stats.accuracy).toBeLessThan(100);
  });

  it("includes pending (missed) chars in accuracy denominator at test end", () => {
    const words: Word[] = [
      mkWord("abc", ["correct", "correct", "pending"], "ab"),
    ];

    const stats = computeFinalStats(words, [], 10, 1);

    expect(stats.missedChars).toBe(1);
    expect(stats.accuracy).toBeLessThan(100);
    expect(stats.correctChars).toBe(2 + 1);
    const expectedTotal = stats.correctChars + stats.incorrectChars + stats.extraChars + stats.missedChars;
    expect(expectedTotal).toBe(4);
  });

  it("preserves correct/incorrect/extra/missed breakdown", () => {
    const words: Word[] = [
      mkWord("ab", ["correct", "incorrect"], "ax"),
      mkWord("cd", ["correct", "pending"], "c"),
    ];

    const stats = computeFinalStats(words, [], 10, 2);

    expect(stats.correctChars).toBe(1 + 1 + 2);
    expect(stats.incorrectChars).toBe(1);
    expect(stats.extraChars).toBe(0);
    expect(stats.missedChars).toBe(1);
  });

  it("extra chars count in total", () => {
    const letters = [
      { char: "a", status: "correct" as const },
      { char: "b", status: "correct" as const },
      { char: "x", status: "extra" as const },
    ];
    const words: Word[] = [{ letters, typed: "abx" }];

    const stats = computeFinalStats(words, [], 10, 1);

    expect(stats.extraChars).toBe(1);
    expect(stats.correctChars).toBe(2 + 1);
    const expectedTotal = stats.correctChars + stats.incorrectChars + stats.extraChars + stats.missedChars;
    expect(expectedTotal).toBe(4);
  });
});

describe("computeFinalStats — zen-shaped data", () => {
  it("handles all-correct words with no predefined targets", () => {
    const words: Word[] = [
      {
        letters: [
          { char: "h", status: "correct" },
          { char: "i", status: "correct" },
        ],
        typed: "hi",
      },
      {
        letters: [
          { char: "w", status: "correct" },
          { char: "o", status: "correct" },
        ],
        typed: "wo",
      },
    ];

    const stats = computeFinalStats(words, [], 10, 2);
    expect(stats.incorrectChars).toBe(0);
    expect(stats.accuracy).toBe(100);
    expect(stats.correctChars).toBe(4 + 2);
  });

  it("handles partial zen run where typedWordCount < words.length", () => {
    const words: Word[] = [
      {
        letters: [{ char: "a", status: "correct" }],
        typed: "a",
      },
      { letters: [], typed: "" },
      { letters: [], typed: "" },
    ];

    const stats = computeFinalStats(words, [], 5, 1);
    expect(stats.correctChars).toBe(1 + 1);
    expect(stats.missedChars).toBe(0);
  });
});

describe("calculateWpm / calculateRawWpm", () => {
  it("returns 0 when elapsed is 0", () => {
    expect(calculateWpm(50, 0)).toBe(0);
    expect(calculateRawWpm(50, 0)).toBe(0);
  });

  it("computes correct WPM for 60 seconds", () => {
    expect(calculateWpm(50, 60)).toBe(10);
  });
});
