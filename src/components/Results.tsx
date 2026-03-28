"use client";

import { useMemo } from "react";
import { useTestStore } from "@/store/useTestStore";
import type { SegmentType } from "@/store/useTestStore";
import { deriveTypingDna } from "@/lib/typingDna";
import { getSegmentLabel, getSegmentColor } from "@/lib/segmentClassifier";
import RestartButton from "./RestartButton";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ResultsProps {
  onRestart: () => void;
  onRemix?: (segments: SegmentType[]) => void;
  onNewChallenge?: () => void;
}

interface StatBoxProps {
  label: string;
  value: string;
  small?: boolean;
}

export default function Results({ onRestart, onRemix, onNewChallenge }: ResultsProps) {
  const stats = useTestStore((s) => s.stats);
  const wpmHistory = useTestStore((s) => s.wpmHistory);

  const dna = useMemo(() => {
    if (!stats) return null;
    return deriveTypingDna(stats);
  }, [stats]);

  if (!stats) return null;

  const chartData = wpmHistory.map((s) => ({
    second: s.second,
    wpm: s.wpm,
    raw: s.raw,
  }));

  const segmentMetrics = stats.segmentMetrics ?? [];
  const isSource = stats.runKind === "source";
  const isBugHunt = stats.runKind === "bug-hunt";
  const hasSegmentMetrics = segmentMetrics.length > 0;

  return (
    <div className="w-full fade-in">
      <div className="flex items-end gap-8 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--sub)" }}>
            wpm
          </div>
          <div className="text-6xl font-bold tabular-nums" style={{ color: "var(--main)" }}>
            {stats.wpm}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--sub)" }}>
            acc
          </div>
          <div className="text-4xl font-bold tabular-nums" style={{ color: "var(--main)" }}>
            {stats.accuracy}%
          </div>
        </div>
        {isSource && (
          <div className="ml-auto">
            <span
              className="text-xs uppercase tracking-widest font-bold px-3 py-1 rounded"
              style={{ backgroundColor: "var(--bg-alt)", color: "var(--main)" }}
            >
              Source Run
            </span>
          </div>
        )}
        {isBugHunt && (
          <div className="ml-auto">
            <span
              className="text-xs uppercase tracking-widest font-bold px-3 py-1 rounded"
              style={{ backgroundColor: "var(--bg-alt)", color: "var(--error)" }}
            >
              Bug Hunt
            </span>
          </div>
        )}
      </div>

      {chartData.length > 1 && (
        <div className="mb-8 rounded-lg p-4" style={{ backgroundColor: "var(--bg-alt)" }}>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--sub-alt)" />
              <XAxis
                dataKey="second"
                tick={{ fill: "var(--sub)", fontSize: 10 }}
                axisLine={{ stroke: "var(--sub-alt)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--sub)", fontSize: 10 }}
                axisLine={{ stroke: "var(--sub-alt)" }}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-alt)",
                  border: "1px solid var(--sub-alt)",
                  borderRadius: "6px",
                  color: "var(--text)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="var(--main)"
                strokeWidth={2}
                dot={false}
                name="WPM"
              />
              <Line
                type="monotone"
                dataKey="raw"
                stroke="var(--sub)"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                name="Raw"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatBox label="raw" value={`${stats.raw}`} />
        <StatBox label="characters" value={`${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`} small />
        <StatBox label="consistency" value={`${stats.consistency}%`} />
        <StatBox label="time" value={`${stats.time}s`} />
      </div>

      {hasSegmentMetrics && (
        <div className="mb-6">
          <h3
            className="text-xs uppercase tracking-widest mb-3 font-bold"
            style={{ color: "var(--sub)" }}
          >
            Content Fluency
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {segmentMetrics.map((m) => {
              const accuracy = m.totalChars > 0 ? Math.round((m.correctChars / m.totalChars) * 100) : 100;
              const color = getSegmentColor(m.type);
              return (
                <div
                  key={m.type}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "var(--bg-alt)", borderLeft: `3px solid ${color}` }}
                >
                  <div className="text-xs uppercase tracking-widest mb-1" style={{ color }}>
                    {getSegmentLabel(m.type)}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold tabular-nums" style={{ color: "var(--text)" }}>
                      {m.wpm}
                    </span>
                    <span className="text-xs" style={{ color: "var(--sub)" }}>
                      wpm
                    </span>
                  </div>
                  <div className="text-xs mt-1 tabular-nums" style={{ color: "var(--sub)" }}>
                    {accuracy}% acc · {m.wordCount} words
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dna && (
        <div
          className="mb-6 rounded-lg p-4"
          style={{ backgroundColor: "var(--bg-alt)", borderLeft: "3px solid var(--main)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--main)" }}>
              ⧬ Typing DNA
            </span>
          </div>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--text)" }}>
            {dna.headline}
          </p>
          <div className="flex flex-col gap-2">
            {dna.insights.map((insight) => (
              <div key={`${insight.type}-${insight.label}`} className="flex items-start gap-2 text-xs">
                <span
                  style={{
                    color:
                      insight.type === "strength"
                        ? "var(--success)"
                        : insight.type === "weakness"
                        ? "var(--error)"
                        : "var(--sub)",
                  }}
                >
                  {insight.type === "strength" ? "▲" : insight.type === "weakness" ? "▼" : "●"}
                </span>
                <div>
                  <span className="font-bold" style={{ color: "var(--text)" }}>
                    {insight.label}
                  </span>
                  <span className="ml-1" style={{ color: "var(--sub)" }}>
                    — {insight.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isBugHunt && stats.challenge && (
        <div
          className="mb-6 rounded-lg p-4"
          style={{ backgroundColor: "var(--bg-alt)", borderLeft: "3px solid var(--error)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--error)" }}>
              The Bug
            </span>
            <span className="text-xs uppercase tracking-widest" style={{ color: "var(--sub)" }}>
              {stats.challenge.language} &middot; {stats.challenge.difficulty} &middot; {stats.challenge.bugType.replace("-", " ")}
            </span>
          </div>
          <p className="text-sm font-bold mb-2" style={{ color: "var(--text)" }}>
            {stats.challenge.title}
          </p>
          <p className="text-sm" style={{ color: "var(--sub)" }}>
            {stats.challenge.explanation}
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <RestartButton onClick={onRestart} />
        {isBugHunt && onNewChallenge && (
          <button
            onClick={onNewChallenge}
            className="px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase transition-all"
            style={{
              backgroundColor: "var(--error)",
              color: "var(--bg)",
            }}
          >
            Next Bug
          </button>
        )}
        {dna && dna.weakestSegments.length > 0 && onRemix && (
          <button
            onClick={() => onRemix(dna.weakestSegments)}
            className="px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase transition-all"
            style={{
              backgroundColor: "var(--main)",
              color: "var(--bg)",
            }}
          >
            Remix Run ↻
          </button>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, small }: StatBoxProps) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ backgroundColor: "var(--bg-alt)" }}
    >
      <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--sub)" }}>
        {label}
      </div>
      <div
        className={`font-bold tabular-nums ${small ? "text-sm" : "text-xl"}`}
        style={{ color: "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}
