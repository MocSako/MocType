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

describe("calculateWpm / calculateRawWpm", () => {
  it("returns 0 when elapsed is 0", () => {
    expect(calculateWpm(50, 0)).toBe(0);
    expect(calculateRawWpm(50, 0)).toBe(0);
  });

  it("computes correct WPM for 60 seconds", () => {
    expect(calculateWpm(50, 60)).toBe(10);
  });
});
