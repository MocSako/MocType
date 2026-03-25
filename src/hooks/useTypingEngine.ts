"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTestStore } from "@/store/useTestStore";
import { useConfigStore } from "@/store/useConfigStore";
import { generateWords } from "@/lib/generateWords";
import { calculateWpm, calculateRawWpm, computeFinalStats } from "@/lib/calculateStats";
import type { Letter } from "@/store/useTestStore";

export function useTypingEngine() {
  const {
    setWords, setPhase, setTimerSeconds, setStartTime,
    setCurrentWordIndex, setCurrentLetterIndex,
    updateWord, addWpmSnapshot, setStats, reset,
  } = useTestStore();

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
    const store = useTestStore.getState();
    const elapsed = store.startTime ? (Date.now() - store.startTime) / 1000 : 0;
    const stats = computeFinalStats(store.words, store.wpmHistory, elapsed, store.currentWordIndex + 1);
    setStats(stats);
    setPhase("finished");
  }, [clearTimers, setStats, setPhase]);

  const startTimers = useCallback(() => {
    const now = Date.now();
    setStartTime(now);
    const { mode, timeConfig } = useConfigStore.getState();

    if (mode === "time") {
      setTimerSeconds(timeConfig);
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - now) / 1000;
        const remaining = Math.max(0, timeConfig - Math.floor(elapsed));
        setTimerSeconds(remaining);
        if (remaining <= 0) {
          finishTest();
        }
      }, 100);
    } else {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - now) / 1000;
        setTimerSeconds(Math.floor(elapsed));
      }, 100);
    }

    snapshotRef.current = setInterval(() => {
      const store = useTestStore.getState();
      const elapsed = (Date.now() - now) / 1000;
      const second = Math.floor(elapsed);
      if (second < 1) return;

      let correct = 0;
      let total = 0;
      for (let i = 0; i <= store.currentWordIndex && i < store.words.length; i++) {
        for (const l of store.words[i].letters) {
          if (l.status === "correct") correct++;
          if (l.status !== "pending") total++;
        }
      }

      addWpmSnapshot({
        second,
        wpm: calculateWpm(correct, elapsed),
        raw: calculateRawWpm(total, elapsed),
      });
    }, 1000);
  }, [setStartTime, setTimerSeconds, finishTest, addWpmSnapshot]);

  const initTest = useCallback(() => {
    clearTimers();
    reset();
    const cfg = useConfigStore.getState();
    const newWords = generateWords({
      mode: cfg.mode,
      wordCount: cfg.wordConfig,
      timeConfig: cfg.timeConfig,
      quoteLength: cfg.quoteLength,
      punctuation: cfg.punctuation,
      numbers: cfg.numbers,
    });
    setWords(newWords);
    setPhase("idle");
  }, [clearTimers, reset, setWords, setPhase]);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Tab") tabPressedRef.current = false;
    };
    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const store = useTestStore.getState();

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

      if (store.phase === "finished") return;

      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Shift" || e.key === "CapsLock" || e.key === "Escape" || e.key === "Enter") return;

      if (store.words.length === 0) return;

      if (store.phase === "idle") {
        setPhase("typing");
        startTimers();
      }

      const word = store.words[store.currentWordIndex];
      if (!word) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        if (store.currentLetterIndex > 0) {
          const newLetterIndex = store.currentLetterIndex - 1;
          const letters = [...word.letters];

          if (letters[newLetterIndex]?.status === "extra") {
            letters.splice(newLetterIndex, 1);
          } else if (letters[newLetterIndex]) {
            letters[newLetterIndex] = { ...letters[newLetterIndex], status: "pending" };
          }

          const newTyped = word.typed.slice(0, -1);
          updateWord(store.currentWordIndex, { ...word, letters, typed: newTyped });
          setCurrentLetterIndex(newLetterIndex);
        }
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        if (store.currentLetterIndex === 0) return;

        const nextWordIndex = store.currentWordIndex + 1;
        const cfgMode = useConfigStore.getState().mode;

        if (cfgMode !== "time" && nextWordIndex >= store.words.length) {
          finishTest();
          return;
        }

        setCurrentWordIndex(nextWordIndex);
        setCurrentLetterIndex(0);
        return;
      }

      if (e.key.length !== 1) return;

      e.preventDefault();
      const letterIndex = store.currentLetterIndex;
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
      updateWord(store.currentWordIndex, { ...word, letters, typed: newTyped });
      setCurrentLetterIndex(letterIndex + 1);
    },
    [initTest, startTimers, finishTest, setPhase, setCurrentWordIndex, setCurrentLetterIndex, updateWord]
  );

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return { initTest, handleKeyDown, finishTest };
}
