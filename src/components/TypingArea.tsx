"use client";

import { useEffect, useLayoutEffect, useRef, useCallback, useState, memo } from "react";
import { useTestStore } from "@/store/useTestStore";
import { useConfigStore } from "@/store/useConfigStore";
import { getSegmentColor } from "@/lib/segmentClassifier";
import RestartButton from "./RestartButton";
import type { Word } from "@/store/useTestStore";

function TimerDisplay() {
  const timerSeconds = useTestStore((s) => s.timerSeconds);
  return (
    <span
      className="text-2xl font-bold tabular-nums tracking-wider inline-block min-w-[1.5ch]"
      style={{ color: "var(--main)" }}
    >
      {timerSeconds}
    </span>
  );
}

function WordCounter() {
  const currentWordIndex = useTestStore((s) => s.currentWordIndex);
  const wordCount = useTestStore((s) => s.words.length);
  return (
    <span
      className="text-2xl font-bold tabular-nums tracking-wider"
      style={{ color: "var(--main)" }}
    >
      {currentWordIndex}/{wordCount}
    </span>
  );
}

const WordRow = memo(function WordRow({
  word,
  isActive,
  hasSegments,
  wordIndex,
}: {
  word: Word;
  isActive: boolean;
  hasSegments: boolean;
  wordIndex: number;
}) {
  const seg = word.segment;
  const segIndicatorColor = hasSegments && seg ? getSegmentColor(seg) : undefined;

  return (
    <div
      data-word-index={wordIndex}
      className="word"
      style={
        hasSegments && seg && isActive
          ? { borderBottom: `2px solid ${segIndicatorColor}`, paddingBottom: "1px" }
          : undefined
      }
    >
      {word.letters.map((letter, li) => (
        <span
          key={li}
          className={`letter ${letter.status}`}
          style={
            hasSegments && seg && letter.status === "pending"
              ? { color: segIndicatorColor, opacity: 0.5 }
              : undefined
          }
        >
          {letter.char}
        </span>
      ))}
    </div>
  );
});

interface TypingAreaProps {
  onRestart: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

export default function TypingArea({ onRestart, onKeyDown }: TypingAreaProps) {
  const words = useTestStore((s) => s.words);
  const currentWordIndex = useTestStore((s) => s.currentWordIndex);
  const currentLetterIndex = useTestStore((s) => s.currentLetterIndex);
  const phase = useTestStore((s) => s.phase);
  const runKind = useTestStore((s) => s.runKind);
  const isSourceRun = runKind === "source";
  const isBugHunt = runKind === "bug-hunt";
  const activeChallenge = useTestStore((s) => s.activeChallenge);

  const mode = useConfigStore((s) => s.mode);
  const timeConfig = useConfigStore((s) => s.timeConfig);

  const inputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(true);
  const lineOffsetRef = useRef(0);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
    setIsFocused(true);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  useLayoutEffect(() => {
    if (!wordsRef.current || !caretRef.current) return;
    const container = wordsRef.current;

    if (phase === "idle") {
      lineOffsetRef.current = 0;
      container.style.transition = "none";
      container.style.transform = "translateY(0px)";
    }

    const activeWord = container.querySelector<HTMLElement>(
      `[data-word-index="${currentWordIndex}"]`
    );
    if (!activeWord) return;

    const letters = activeWord.children;
    let targetEl: HTMLElement;

    if (currentLetterIndex < letters.length) {
      targetEl = letters[currentLetterIndex] as HTMLElement;
    } else if (letters.length > 0) {
      targetEl = letters[letters.length - 1] as HTMLElement;
    } else {
      targetEl = activeWord;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    let left: number;
    if (currentLetterIndex < letters.length) {
      left = targetRect.left - containerRect.left;
    } else {
      left = targetRect.right - containerRect.left;
    }
    const top = targetRect.top - containerRect.top;

    caretRef.current.style.left = `${left}px`;
    caretRef.current.style.top = `${top}px`;
    caretRef.current.style.height = `${targetRect.height}px`;

    const lineHeight = targetRect.height;
    const wordTop = activeWord.offsetTop;
    const lineTop = Math.round(wordTop / lineHeight) * lineHeight;
    if (lineTop !== lineOffsetRef.current) {
      lineOffsetRef.current = lineTop;
      container.style.transition = "transform 120ms ease-out";
      container.style.transform = `translateY(-${lineTop}px)`;
    }
  }, [currentWordIndex, currentLetterIndex, words, phase]);

  if (words.length === 0) {
    return <div style={{ height: "4.8em" }} />;
  }

  const showTimer = mode === "time" && phase === "typing";
  const showWordCount = (mode === "words" || mode === "source" || mode === "bug-hunt") && phase === "typing";

  const currentSegment = words[currentWordIndex]?.segment;
  const segColor = currentSegment ? getSegmentColor(currentSegment) : undefined;

  return (
    <div className="relative w-full" onClick={focusInput}>
      <input
        ref={inputRef}
        className="absolute opacity-0 w-0 h-0"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        tabIndex={0}
      />

      {(showTimer || showWordCount) && (
        <div className="flex items-center gap-3 mb-4">
          {showTimer && <TimerDisplay />}
          {showWordCount && <WordCounter />}
          {isSourceRun && currentSegment && phase === "typing" && (
            <span
              className="text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded"
              style={{
                color: segColor,
                backgroundColor: "var(--bg-alt)",
                borderLeft: `3px solid ${segColor}`,
              }}
            >
              {currentSegment.replace("_", " ")}
            </span>
          )}
          {isBugHunt && activeChallenge && phase === "typing" && (
            <span
              className="text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded"
              style={{
                color: "var(--error)",
                backgroundColor: "var(--bg-alt)",
                borderLeft: "3px solid var(--error)",
              }}
            >
              {activeChallenge.bugType.replace("-", " ")}
            </span>
          )}
        </div>
      )}

      {phase === "idle" && mode === "time" && (
        <div
          className="text-2xl font-bold mb-4 tabular-nums tracking-wider"
          style={{ color: "var(--main)" }}
        >
          {timeConfig}
        </div>
      )}

      <div className="relative overflow-hidden" style={{ height: "4.8em" }}>
        <div
          ref={wordsRef}
          className="relative flex flex-wrap gap-x-[0.6em] leading-[1.6em] text-2xl"
        >
          <div
            ref={caretRef}
            className={`caret ${phase === "typing" ? "typing" : ""}`}
            style={{ display: isFocused ? "block" : "none" }}
          />
          {words.map((word, wi) => (
            <WordRow
              key={wi}
              word={word}
              isActive={wi === currentWordIndex}
              hasSegments={isSourceRun}
              wordIndex={wi}
            />
          ))}
        </div>

        {!isFocused && phase !== "finished" && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: "var(--bg)", opacity: 0.85 }}
            onClick={focusInput}
          >
            <span className="text-sm tracking-wider" style={{ color: "var(--sub)" }}>
              Click here or press any key to focus
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <RestartButton onClick={onRestart} />
      </div>
    </div>
  );
}
