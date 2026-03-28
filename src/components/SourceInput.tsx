"use client";

import { useState } from "react";

interface SourceInputProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

const PLACEHOLDER = `Paste text here…

README
article
essay
docs
code`;

export default function SourceInput({ onSubmit, onCancel }: SourceInputProps) {
  const [text, setText] = useState("");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = wordCount >= 5;

  return (
    <div className="w-full fade-in" style={{ maxWidth: 700 }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            className="text-lg font-bold tracking-widest uppercase"
            style={{ color: "var(--main)" }}
          >
            Source Run
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--sub)" }}>
            Paste text to build a custom run
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs tracking-wider px-3 py-1 rounded transition-colors"
          style={{ color: "var(--sub)", backgroundColor: "var(--bg-alt)" }}
        >
          ← back
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        className="w-full rounded-lg p-4 text-sm leading-relaxed resize-none outline-none transition-colors"
        style={{
          backgroundColor: "var(--bg-alt)",
          color: "var(--text)",
          border: "1px solid var(--sub-alt)",
          minHeight: 200,
          fontFamily: "var(--font-mono)",
        }}
        autoFocus
        spellCheck={false}
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs tabular-nums" style={{ color: "var(--sub)" }}>
          {wordCount} word{wordCount !== 1 ? "s" : ""}
          {wordCount > 0 && wordCount < 5 && " — need at least 5"}
        </span>

        <button
          onClick={() => onSubmit(text)}
          disabled={!canSubmit}
          className="px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase transition-all"
          style={{
            backgroundColor: canSubmit ? "var(--main)" : "var(--sub-alt)",
            color: canSubmit ? "var(--bg)" : "var(--sub)",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.6,
          }}
        >
          Start Run →
        </button>
      </div>
    </div>
  );
}
