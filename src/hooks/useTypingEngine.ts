"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTestStore } from "@/store/useTestStore";
import { useConfigStore } from "@/store/useConfigStore";
import { generateWords } from "@/lib/generateWords";
import { calculateWpm, calculateRawWpm, computeFinalStats } from "@/lib/calculateStats";
import { finalizeWordOnAdvance } from "@/lib/typing/finalizeWordOnAdvance";
import type { Letter } from "@/store/useTestStore";

export function useTypingEngine() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const snapshotRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (snapshotRef.current) {
      clearInterval(snapshotRef.current);
      snapshotRef.current = null;
    }
  }, []);

  const finishTest = useCallback(() => {
    clearTimers();
    const s = useTestStore.getState();
    const elapsed = s.startTime ? (Date.now() - s.startTime) / 1000 : 0;
    const stats = computeFinalStats(
      s.words, s.wpmHistory, elapsed, s.currentWordIndex + 1,
      s.runKind, s.activeChallenge ?? undefined,
    );
    s.setStats(stats);
    s.setPhase("finished");
  }, [clearTimers]);

  const startTimers = useCallback(() => {
    clearTimers();
    const wallStart = Date.now();
    const perfStart = performance.now();
    useTestStore.getState().setStartTime(wallStart);
    const { mode, timeConfig } = useConfigStore.getState();

    if (mode === "time") {
      const deadline = perfStart + timeConfig * 1000;
      useTestStore.getState().setTimerSeconds(timeConfig);
      let lastSecond = timeConfig;
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.floor((deadline - performance.now()) / 1000));
        if (remaining !== lastSecond) {
          lastSecond = remaining;
          useTestStore.getState().setTimerSeconds(remaining);
        }
        if (remaining <= 0) finishTest();
      }, 100);
    } else {
      let lastSecond = 0;
      timerRef.current = setInterval(() => {
        const elapsed = (performance.now() - perfStart) / 1000;
        const second = Math.floor(elapsed);
        if (second !== lastSecond) {
          lastSecond = second;
          useTestStore.getState().setTimerSeconds(second);
        }
      }, 100);
    }

    snapshotRef.current = setInterval(() => {
      const s = useTestStore.getState();
      const elapsed = (performance.now() - perfStart) / 1000;
      const second = Math.floor(elapsed);
      if (second < 1) return;

      let correct = 0;
      let total = 0;
      for (let i = 0; i <= s.currentWordIndex && i < s.words.length; i++) {
        for (const l of s.words[i].letters) {
          if (l.status === "correct") correct++;
          if (l.status !== "pending") total++;
        }
      }

      s.addWpmSnapshot({
        second,
        wpm: calculateWpm(correct, elapsed),
        raw: calculateRawWpm(total, elapsed),
      });
    }, 1000);
  }, [clearTimers, finishTest]);

  const initTest = useCallback(() => {
    clearTimers();
    const s = useTestStore.getState();
    s.reset();
    const cfg = useConfigStore.getState();
    const newWords = generateWords({
      mode: cfg.mode,
      wordCount: cfg.wordConfig,
      timeConfig: cfg.timeConfig,
      quoteLength: cfg.quoteLength,
      punctuation: cfg.punctuation,
      numbers: cfg.numbers,
    });
    s.setWords(newWords);
    s.setPhase("idle");
  }, [clearTimers]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const s = useTestStore.getState();

      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        initTest();
        return;
      }

      if (s.phase === "finished") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Shift" || e.key === "CapsLock" || e.key === "Escape" || e.key === "Enter") return;
      if (s.words.length === 0) return;

      if (s.phase === "idle") {
        s.setPhase("typing");
        startTimers();
      }

      const word = s.words[s.currentWordIndex];
      if (!word) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        if (s.currentLetterIndex > 0) {
          const newLetterIndex = s.currentLetterIndex - 1;
          const letters = [...word.letters];

          if (letters[newLetterIndex]?.status === "extra") {
            letters.splice(newLetterIndex, 1);
          } else if (letters[newLetterIndex]) {
            letters[newLetterIndex] = { ...letters[newLetterIndex], status: "pending" };
          }

          const newTyped = word.typed.slice(0, -1);
          s.updateWord(s.currentWordIndex, { ...word, letters, typed: newTyped });
          s.setCurrentLetterIndex(newLetterIndex);
        } else if (s.currentWordIndex > 0) {
          const prevWordIndex = s.currentWordIndex - 1;
          const prevWord = s.words[prevWordIndex];
          s.setCurrentWordIndex(prevWordIndex);
          s.setCurrentLetterIndex(prevWord.typed.length);
        }
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        if (s.currentLetterIndex === 0) return;

        if (s.currentLetterIndex < word.letters.length) {
          const finalized = finalizeWordOnAdvance(word.letters, s.currentLetterIndex);
          s.updateWord(s.currentWordIndex, { ...word, letters: finalized });
        }

        const nextWordIndex = s.currentWordIndex + 1;
        const cfgMode = useConfigStore.getState().mode;

        if (cfgMode !== "time" && nextWordIndex >= s.words.length) {
          finishTest();
          return;
        }

        s.setCurrentWordIndex(nextWordIndex);
        s.setCurrentLetterIndex(0);
        return;
      }

      if (e.key.length !== 1) return;

      e.preventDefault();
      const letterIndex = s.currentLetterIndex;
      const letters = [...word.letters];

      if (letterIndex < letters.length) {
        const expected = letters[letterIndex].char;
        const status = e.key === expected ? "correct" : "incorrect";
        letters[letterIndex] = { ...letters[letterIndex], status };
      } else {
        const extraLetter: Letter = { char: e.key, status: "extra" };
        letters.push(extraLetter);
      }

      const newTyped = word.typed + e.key;
      s.updateWord(s.currentWordIndex, { ...word, letters, typed: newTyped });

      const newLetterIndex = letterIndex + 1;
      s.setCurrentLetterIndex(newLetterIndex);

      const cfgMode = useConfigStore.getState().mode;
      if (
        cfgMode !== "time" &&
        s.currentWordIndex === s.words.length - 1 &&
        newLetterIndex >= word.letters.length
      ) {
        finishTest();
      }
    },
    [initTest, startTimers, finishTest]
  );

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return { initTest, handleKeyDown, finishTest, clearTimers };
}
