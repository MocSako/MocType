"use client";

import type { ReactNode } from "react";
import { useConfigStore } from "@/store/useConfigStore";
import type { BugHuntDifficulty } from "@/lib/bug-hunt/types";
import { modeVisuals } from "./nav-language";

const timeOptions = [15, 30, 60, 120];
const wordOptions = [10, 25, 50, 100];
const quoteOptions = ["all", "short", "medium", "long"] as const;
const difficultyOptions: BugHuntDifficulty[] = ["easy", "medium", "hard"];

interface ContextControlsProps {
  onConfigChange: () => void;
}

export function ContextControls({ onConfigChange }: ContextControlsProps) {
  const mode = useConfigStore((s) => s.mode);
  const timeConfig = useConfigStore((s) => s.timeConfig);
  const wordConfig = useConfigStore((s) => s.wordConfig);
  const quoteLength = useConfigStore((s) => s.quoteLength);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const setTimeConfig = useConfigStore((s) => s.setTimeConfig);
  const setWordConfig = useConfigStore((s) => s.setWordConfig);
  const setQuoteLength = useConfigStore((s) => s.setQuoteLength);
  const togglePunctuation = useConfigStore((s) => s.togglePunctuation);
  const toggleNumbers = useConfigStore((s) => s.toggleNumbers);
  const bugHuntDifficulty = useConfigStore((s) => s.bugHuntDifficulty);
  const setBugHuntDifficulty = useConfigStore((s) => s.setBugHuntDifficulty);

  function applyChange(action: () => void) {
    action();
    onConfigChange();
  }

  const hasPunctuationNumbers = mode === "time" || mode === "words";

  return (
    <div className="flex items-center gap-1 text-xs tracking-wider">
      <div
        className="flex items-center gap-1 transition-opacity duration-150"
        style={{
          opacity: hasPunctuationNumbers ? 1 : 0,
          pointerEvents: hasPunctuationNumbers ? "auto" : "none",
        }}
      >
        <button
          onClick={() => applyChange(togglePunctuation)}
          className="type-atelier-slot-btn"
          style={{ color: punctuation ? "var(--main)" : "var(--sub)" }}
          tabIndex={hasPunctuationNumbers ? 0 : -1}
        >
          @ punctuation
        </button>
        <button
          onClick={() => applyChange(toggleNumbers)}
          className="type-atelier-slot-btn"
          style={{ color: numbers ? "var(--main)" : "var(--sub)" }}
          tabIndex={hasPunctuationNumbers ? 0 : -1}
        >
          # numbers
        </button>
        <span className="mx-1 select-none" style={{ color: "var(--sub-alt)" }}>|</span>
      </div>

      <div className="grid">
        <PresetLayer visible={mode === "time"}>
          <PresetGroup
            options={timeOptions}
            active={timeConfig}
            onSelect={(time) => applyChange(() => setTimeConfig(time))}
            interactive={mode === "time"}
          />
        </PresetLayer>

        <PresetLayer visible={mode === "words"}>
          <PresetGroup
            options={wordOptions}
            active={wordConfig}
            onSelect={(count) => applyChange(() => setWordConfig(count))}
            interactive={mode === "words"}
          />
        </PresetLayer>

        <PresetLayer visible={mode === "quote"}>
          <div className="flex items-center gap-0.5">
            {quoteOptions.map((q) => (
              <button
                key={q}
                onClick={() => applyChange(() => setQuoteLength(q))}
                className="type-atelier-slot-btn"
                style={{ color: quoteLength === q ? "var(--main)" : "var(--sub)" }}
                tabIndex={mode === "quote" ? 0 : -1}
              >
                {q}
              </button>
            ))}
          </div>
        </PresetLayer>

        <PresetLayer visible={mode === "zen"}>
          <span className="px-2 py-1" style={{ color: "var(--sub)" }}>{modeVisuals.zen.contextLabel}</span>
        </PresetLayer>

        <PresetLayer visible={mode === "source"}>
          <span className="px-2 py-1" style={{ color: "var(--sub)" }}>{modeVisuals.source.contextLabel}</span>
        </PresetLayer>

        <PresetLayer visible={mode === "bug-hunt"}>
          <div className="flex items-center gap-0.5">
            {difficultyOptions.map((d) => (
              <button
                key={d}
                onClick={() => applyChange(() => setBugHuntDifficulty(d))}
                className="type-atelier-slot-btn"
                style={{ color: bugHuntDifficulty === d ? "var(--main)" : "var(--sub)" }}
                tabIndex={mode === "bug-hunt" ? 0 : -1}
              >
                {d}
              </button>
            ))}
          </div>
        </PresetLayer>
      </div>
    </div>
  );
}

interface PresetLayerProps {
  visible: boolean;
  children: ReactNode;
}

function PresetLayer({ visible, children }: PresetLayerProps) {
  return (
    <div
      className="transition-opacity duration-150 flex items-center"
      style={{
        gridArea: "1 / 1",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}

interface PresetGroupProps {
  options: number[];
  active: number;
  onSelect: (val: number) => void;
  interactive?: boolean;
}

function PresetGroup({ options, active, onSelect, interactive = true }: PresetGroupProps) {
  return (
    <div className="flex items-center gap-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="type-atelier-slot-btn"
          style={{ color: active === opt ? "var(--main)" : "var(--sub)" }}
          tabIndex={interactive ? 0 : -1}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
