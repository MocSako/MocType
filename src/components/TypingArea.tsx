"use client";

import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { useTestStore } from "@/store/useTestStore";
import { useConfigStore } from "@/store/useConfigStore";
import { getSegmentColor } from "@/lib/segmentClassifier";
import RestartButton from "./RestartButton";

interface TypingAreaProps {
  onRestart: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

export default function TypingArea({ onRestart, onKeyDown }: TypingAreaProps) {
  const { words, currentWordIndex, currentLetterIndex, phase, timerSeconds, isSourceRun } = useTestStore();
  const config = useConfigStore();
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
    if (wordTop > lineHeight * 1.5) {
      const newOffset = wordTop - lineHeight;
      lineOffsetRef.current = newOffset;
      container.style.transform = `translateY(-${newOffset}px)`;
    }
  }, [currentWordIndex, currentLetterIndex, words, phase]);

  if (words.length === 0) {
    return <div style={{ height: "4.8em" }} />;
  }

  const showTimer = config.mode === "time" && phase === "typing";
  const showWordCount = (config.mode === "words" || config.mode === "source") && phase === "typing";

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
          <span
            className="text-2xl font-bold tabular-nums tracking-wider"
            style={{ color: "var(--main)" }}
          >
            {showTimer && `${timerSeconds}`}
            {showWordCount && `${currentWordIndex}/${words.length}`}
          </span>
          {isSourceRun && currentSegment && phase === "typing" && (
            <span
              className="text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded transition-all duration-200"
              style={{
                color: segColor,
                backgroundColor: "var(--bg-alt)",
                borderLeft: `3px solid ${segColor}`,
              }}
            >
              {currentSegment.replace("_", " ")}
            </span>
          )}
        </div>
      )}

      {phase === "idle" && config.mode === "time" && (
        <div className="text-2xl font-bold mb-4 tabular-nums tracking-wider" style={{ color: "var(--main)" }}>
          {config.timeConfig}
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
          {words.map((word, wi) => {
            const seg = word.segment;
            const isActive = wi === currentWordIndex;
            const segIndicatorColor = isSourceRun && seg ? getSegmentColor(seg) : undefined;

            return (
              <div
                key={wi}
                data-word-index={wi}
                className="word"
                style={
                  isSourceRun && seg && isActive
                    ? { borderBottom: `2px solid ${segIndicatorColor}`, paddingBottom: "1px" }
                    : undefined
                }
              >
                {word.letters.map((letter, li) => (
                  <span
                    key={li}
                    className={`letter ${letter.status}`}
                    style={
                      isSourceRun && seg && letter.status === "pending"
                        ? { color: segIndicatorColor, opacity: 0.5 }
                        : undefined
                    }
                  >
                    {letter.char}
                  </span>
                ))}
              </div>
            );
          })}
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
