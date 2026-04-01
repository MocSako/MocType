"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TypingArea from "@/components/TypingArea";
import Results from "@/components/Results";
import SourceInput from "@/components/SourceInput";
import BugHuntInput from "@/components/BugHuntInput";
import { WelcomeModal, hasBeenWelcomed, markWelcomed } from "@/components/WelcomeModal";
import { InfoModal } from "@/components/InfoModal";
import { useTestStore } from "@/store/useTestStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { useFocusMode } from "@/hooks/useFocusMode";
import { generateWords } from "@/lib/generateWords";
import { parseSourceText } from "@/lib/sourceParser";
import { classifyBlocks } from "@/lib/segmentClassifier";
import { buildSourceRun } from "@/lib/buildSourceRun";
import { challenges } from "@/lib/bug-hunt/challenges";
import { selectChallenge } from "@/lib/bug-hunt/selectChallenge";
import { buildBugHuntRun } from "@/lib/bug-hunt/buildBugHuntRun";
import type { SegmentType, Word } from "@/store/useTestStore";
import type { BugHuntChallenge } from "@/lib/bug-hunt/types";

export default function Home() {
  const phase = useTestStore((s) => s.phase);
  const { handleKeyDown, finishTest, clearTimers } = useTypingEngine();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [showBugHuntInput, setShowBugHuntInput] = useState(false);
  const lastSourceWordsRef = useRef<Word[]>([]);
  const lastChallengeRef = useRef<BugHuntChallenge | null>(null);

  // localStorage is only available after mount; avoid SSR/client mismatch on first paint.
  useEffect(() => {
    if (!hasBeenWelcomed()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: read localStorage after hydration
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = useCallback(() => {
    markWelcomed();
    setShowWelcome(false);
  }, []);

  const openInfo = useCallback(() => {
    if (showWelcome) {
      markWelcomed();
      setShowWelcome(false);
    }
    setShowInfo(true);
  }, [showWelcome]);

  const closeInfo = useCallback(() => {
    setShowInfo(false);
  }, []);

  const loadGeneratedRun = useCallback(() => {
    const s = useTestStore.getState();
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
  }, []);

  const loadBugHuntChallenge = useCallback(() => {
    const s = useTestStore.getState();
    const cfg = useConfigStore.getState();
    s.reset();
    const challenge = selectChallenge(challenges, {
      difficulty: cfg.bugHuntDifficulty,
      lastId: lastChallengeRef.current?.id,
    });
    lastChallengeRef.current = challenge;
    s.setActiveChallenge(challenge);
    s.setRunKind("bug-hunt");
    setShowBugHuntInput(true);
  }, []);

  const startFresh = useCallback(() => {
    clearTimers();
    useTestStore.getState().reset();
    const cfg = useConfigStore.getState();

    setShowSourceInput(false);
    setShowBugHuntInput(false);

    if (cfg.mode === "source") {
      setShowSourceInput(true);
      return;
    }

    if (cfg.mode === "bug-hunt") {
      loadBugHuntChallenge();
      return;
    }

    loadGeneratedRun();
  }, [clearTimers, loadGeneratedRun, loadBugHuntChallenge]);

  const handleBugHuntStart = useCallback(() => {
    const s = useTestStore.getState();
    const challenge = s.activeChallenge;
    if (!challenge) return;
    const words = buildBugHuntRun(challenge.correctedCode);
    s.setWords(words);
    s.setRunKind("bug-hunt");
    setShowBugHuntInput(false);
    s.setPhase("idle");
  }, []);

  const handleBugHuntCancel = useCallback(() => {
    setShowBugHuntInput(false);
    useConfigStore.getState().setMode("time");
    useTestStore.getState().reset();
    loadGeneratedRun();
  }, [loadGeneratedRun]);

  const handleSourceSubmit = useCallback((text: string) => {
    const s = useTestStore.getState();
    s.reset();
    const blocks = parseSourceText(text);
    const classified = classifyBlocks(blocks);
    const words = buildSourceRun(classified);
    lastSourceWordsRef.current = words;
    s.setWords(words);
    s.setRunKind("source");
    setShowSourceInput(false);
    s.setPhase("idle");
  }, []);

  const handleSourceCancel = useCallback(() => {
    setShowSourceInput(false);
    useConfigStore.getState().setMode("time");
    useTestStore.getState().reset();
    loadGeneratedRun();
  }, [loadGeneratedRun]);

  const handleRemix = useCallback((weakSegments: SegmentType[]) => {
    const stored = lastSourceWordsRef.current;
    if (stored.length === 0) return;

    const weakWords = stored.filter((w) => w.segment && weakSegments.includes(w.segment));
    if (weakWords.length === 0) return;

    const s = useTestStore.getState();
    s.reset();
    const fresh: Word[] = weakWords.map((w) => ({
      letters: w.letters.map((l) => ({ char: l.char, status: "pending" as const })),
      typed: "",
      segment: w.segment,
    }));
    lastSourceWordsRef.current = fresh;
    s.setWords(fresh);
    s.setRunKind("source");
    s.setPhase("idle");
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => startFresh());
    return () => cancelAnimationFrame(frame);
  }, [startFresh]);

  useEffect(() => {
    function onGlobalKeyDown(e: KeyboardEvent) {
      if (showWelcome || showInfo) return;
      if (e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Tab") {
        e.preventDefault();
        startFresh();
        return;
      }

      if (e.key === "Escape") {
        startFresh();
        return;
      }

      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        const cfg = useConfigStore.getState();
        const test = useTestStore.getState();
        if (cfg.mode === "zen" && test.phase === "typing") {
          finishTest();
        } else {
          startFresh();
        }
      }
    }
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [startFresh, finishTest, showWelcome, showInfo]);

  const showTest = (phase === "idle" || phase === "typing") && !showSourceInput && !showBugHuntInput;
  const isTyping = phase === "typing";
  const dimChrome = useFocusMode(isTyping);

  return (
    <>
      <div
        className="transition-opacity duration-200"
        style={{ opacity: dimChrome ? 0.3 : 1 }}
      >
        <Header onConfigChange={startFresh} onOpenInfo={openInfo} />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[1100px] mx-auto px-6">
        {showSourceInput && (
          <SourceInput onSubmit={handleSourceSubmit} onCancel={handleSourceCancel} />
        )}

        {showBugHuntInput && (
          <BugHuntInput onStart={handleBugHuntStart} onCancel={handleBugHuntCancel} />
        )}

        {showTest && (
          <div className="w-full">
            <TypingArea onRestart={startFresh} onKeyDown={handleKeyDown} />
          </div>
        )}

        {phase === "finished" && (
          <div className="w-full">
            <Results onRestart={startFresh} onRemix={handleRemix} onNewChallenge={loadBugHuntChallenge} />
          </div>
        )}
      </main>
      <div
        className="transition-opacity duration-200"
        style={{ opacity: dimChrome ? 0.3 : 1 }}
      >
        <Footer />
      </div>
      <WelcomeModal open={showWelcome} onDismiss={dismissWelcome} onOpenInfo={openInfo} />
      <InfoModal open={showInfo} onDismiss={closeInfo} />
    </>
  );
}
