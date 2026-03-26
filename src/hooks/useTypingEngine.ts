"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTestStore } from "@/store/useTestStore";
import { useConfigStore } from "@/store/useConfigStore";
import { generateWords } from "@/lib/generateWords";
import { calculateWpm, calculateRawWpm, computeFinalStats } from "@/lib/calculateStats";
import type { Letter } from "@/store/useTestStore";

export function useTypingEngine() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const snapshotRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabPressedRef = useRef(false);

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
    const stats = computeFinalStats(s.words, s.wpmHistory, elapsed, s.currentWordIndex + 1);
    s.setStats(stats);
    s.setPhase("finished");
  }, [clearTimers]);

  const startTimers = useCallback(() => {
    const now = Date.now();
    useTestStore.getState().setStartTime(now);
    const { mode, timeConfig } = useConfigStore.getState();

    if (mode === "time") {
      useTestStore.getState().setTimerSeconds(timeConfig);
      let lastSecond = timeConfig;
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - now) / 1000;
        const remaining = Math.max(0, timeConfig - Math.floor(elapsed));
        if (remaining !== lastSecond) {
          lastSecond = remaining;
          useTestStore.getState().setTimerSeconds(remaining);
        }
        if (remaining <= 0) finishTest();
      }, 100);
    } else {
      let lastSecond = 0;
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - now) / 1000;
        const second = Math.floor(elapsed);
        if (second !== lastSecond) {
          lastSecond = second;
          useTestStore.getState().setTimerSeconds(second);
        }
      }, 100);
    }

    snapshotRef.current = setInterval(() => {
      const s = useTestStore.getState();
      const elapsed = (Date.now() - now) / 1000;
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
  }, [finishTest]);

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

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Tab") tabPressedRef.current = false;
    };
    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const s = useTestStore.getState();

      if (e.key === "Tab") {
        e.preventDefault();
        tabPressedRef.current = true;
        return;
      }

      if (e.key === "Enter" && tabPressedRef.current) {
        e.preventDefault();
        tabPressedRef.current = false;
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
        }
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        if (s.currentLetterIndex === 0) return;

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
      s.setCurrentLetterIndex(letterIndex + 1);
    },
    [initTest, startTimers, finishTest]
  );

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return { initTest, handleKeyDown, finishTest };
}
