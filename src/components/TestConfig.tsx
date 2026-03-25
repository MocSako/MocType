"use client";

import { useConfigStore, type Mode } from "@/store/useConfigStore";

interface TestConfigProps {
  onConfigChange: () => void;
}

export default function TestConfig({ onConfigChange }: TestConfigProps) {
  const {
    mode, timeConfig, wordConfig, quoteLength,
    punctuation, numbers,
    setMode, setTimeConfig, setWordConfig, setQuoteLength,
    togglePunctuation, toggleNumbers,
  } = useConfigStore();

  const wrap = (fn: () => void) => () => { fn(); onConfigChange(); };

  const modeIcons: Record<Mode, string> = {
    time: "⏱",
    words: "A",
    quote: "❝",
    zen: "△",
    source: "⚡",
  };

  const modeOptions: Mode[] = ["time", "words", "quote", "zen", "source"];
  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];
  const quoteOptions = ["all", "short", "medium", "long"] as const;

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs tracking-wider"
        style={{ backgroundColor: "var(--bg-alt)" }}
      >
        {(mode === "time" || mode === "words") && (
          <>
            <button
              onClick={wrap(togglePunctuation)}
              className="px-2 py-1 rounded transition-colors"
              style={{
                color: punctuation ? "var(--main)" : "var(--sub)",
              }}
            >
              @ punctuation
            </button>
            <button
              onClick={wrap(toggleNumbers)}
              className="px-2 py-1 rounded transition-colors"
              style={{
                color: numbers ? "var(--main)" : "var(--sub)",
              }}
            >
              # numbers
            </button>
            <span className="mx-1" style={{ color: "var(--sub-alt)" }}>|</span>
          </>
        )}

        {modeOptions.map((m) => (
          <button
            key={m}
            onClick={wrap(() => setMode(m))}
            className="px-2 py-1 rounded transition-colors"
            style={{
              color: mode === m ? "var(--main)" : "var(--sub)",
            }}
          >
            <span className="mr-1">{modeIcons[m]}</span>
            {m}
          </button>
        ))}

        <span className="mx-1" style={{ color: "var(--sub-alt)" }}>|</span>

        {mode === "time" &&
          timeOptions.map((t) => (
            <button
              key={t}
              onClick={wrap(() => setTimeConfig(t))}
              className="px-2 py-1 rounded transition-colors"
              style={{
                color: timeConfig === t ? "var(--main)" : "var(--sub)",
              }}
            >
              {t}
            </button>
          ))}

        {mode === "words" &&
          wordOptions.map((w) => (
            <button
              key={w}
              onClick={wrap(() => setWordConfig(w))}
              className="px-2 py-1 rounded transition-colors"
              style={{
                color: wordConfig === w ? "var(--main)" : "var(--sub)",
              }}
            >
              {w}
            </button>
          ))}

        {mode === "quote" &&
          quoteOptions.map((q) => (
            <button
              key={q}
              onClick={wrap(() => setQuoteLength(q))}
              className="px-2 py-1 rounded transition-colors"
              style={{
                color: quoteLength === q ? "var(--main)" : "var(--sub)",
              }}
            >
              {q}
            </button>
          ))}

        {mode === "zen" && (
          <span className="px-2 py-1" style={{ color: "var(--sub)" }}>
            just type
          </span>
        )}

        {mode === "source" && (
          <span className="px-2 py-1" style={{ color: "var(--sub)" }}>
            paste anything
          </span>
        )}
      </div>
    </div>
  );
}
