"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TestConfig from "@/components/TestConfig";
import TypingArea from "@/components/TypingArea";
import Results from "@/components/Results";
import SourceInput from "@/components/SourceInput";
import { useTestStore } from "@/store/useTestStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { generateWords } from "@/lib/generateWords";
import { parseSourceText } from "@/lib/sourceParser";
import { classifyBlocks } from "@/lib/segmentClassifier";
import { buildSourceRun } from "@/lib/buildSourceRun";
import type { SegmentType, Word } from "@/store/useTestStore";

export default function Home() {
  const phase = useTestStore((s) => s.phase);
  const { handleKeyDown } = useTypingEngine();
  const [showSourceInput, setShowSourceInput] = useState(false);
  const lastSourceWordsRef = useRef<Word[]>([]);

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

  const startFresh = useCallback(() => {
    useTestStore.getState().reset();
    const cfg = useConfigStore.getState();

    if (cfg.mode === "source") {
      setShowSourceInput(true);
      return;
    }

    setShowSourceInput(false);
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
    s.setIsSourceRun(true);
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
    if (weakWords.length < 3) return;

    const s = useTestStore.getState();
    s.reset();
    const fresh: Word[] = weakWords.map((w) => ({
      letters: w.letters.map((l) => ({ char: l.char, status: "pending" as const })),
      typed: "",
      segment: w.segment,
    }));
    lastSourceWordsRef.current = fresh;
    s.setWords(fresh);
    s.setIsSourceRun(true);
    s.setPhase("idle");
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => startFresh());
    return () => cancelAnimationFrame(frame);
  }, [startFresh]);

  const handleConfigChange = useCallback(() => {
    startFresh();
  }, [startFresh]);

  const showTest = (phase === "idle" || phase === "typing") && !showSourceInput;
  const isTyping = phase === "typing";

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[1100px] mx-auto px-6">
        {showSourceInput && (
          <SourceInput onSubmit={handleSourceSubmit} onCancel={handleSourceCancel} />
        )}

        {showTest && (
          <>
            <div
              className="mb-8 w-full flex justify-center transition-opacity duration-200"
              style={{ opacity: isTyping ? 0 : 1, pointerEvents: isTyping ? "none" : "auto" }}
            >
              <TestConfig onConfigChange={handleConfigChange} />
            </div>
            <div className="w-full">
              <TypingArea onRestart={startFresh} onKeyDown={handleKeyDown} />
            </div>
          </>
        )}

        {phase === "finished" && (
          <div className="w-full">
            <Results onRestart={startFresh} onRemix={handleRemix} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
