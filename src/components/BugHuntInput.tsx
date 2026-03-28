"use client";

import { useTestStore } from "@/store/useTestStore";

interface BugHuntInputProps {
  onStart: () => void;
  onCancel: () => void;
}

export default function BugHuntInput({ onStart, onCancel }: BugHuntInputProps) {
  const challenge = useTestStore((s) => s.activeChallenge);

  if (!challenge) return null;

  return (
    <div className="w-full fade-in" style={{ maxWidth: 700 }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            className="text-lg font-bold tracking-widest uppercase"
            style={{ color: "var(--error)" }}
          >
            Bug Hunt
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--sub)" }}>
            Read the broken code, then type the corrected version
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

      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded"
          style={{ backgroundColor: "var(--bg-alt)", color: "var(--main)" }}
        >
          {challenge.language}
        </span>
        <span
          className="text-xs uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ backgroundColor: "var(--bg-alt)", color: "var(--sub)" }}
        >
          {challenge.difficulty}
        </span>
        <span
          className="text-xs uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ backgroundColor: "var(--bg-alt)", color: "var(--error)" }}
        >
          {challenge.bugType.replaceAll("-", " ")}
        </span>
      </div>

      <div
        className="rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap"
        style={{
          backgroundColor: "var(--bg-alt)",
          color: "var(--text)",
          border: "1px solid var(--sub-alt)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {challenge.brokenCode}
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs" style={{ color: "var(--sub)" }}>
          {challenge.title}
        </span>
        <button
          onClick={onStart}
          className="px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase transition-all"
          style={{
            backgroundColor: "var(--error)",
            color: "var(--bg)",
          }}
        >
          Fix It →
        </button>
      </div>
    </div>
  );
}
