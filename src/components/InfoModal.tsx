"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InfoModalProps {
  open: boolean;
  onDismiss: () => void;
}

const stats = [
  {
    term: "WPM",
    desc: "Words per minute — your typing speed. Every 5 keystrokes counts as one \"word.\" Higher is faster.",
  },
  {
    term: "Raw WPM",
    desc: "Your speed counting all keystrokes, including mistakes. Shows how fast your fingers actually move.",
  },
  {
    term: "Accuracy",
    desc: "Percentage of characters you got right. 100% means zero typos.",
  },
  {
    term: "Consistency",
    desc: "How steady your speed was throughout the test. 100% means perfectly even pacing; lower means your speed varied a lot.",
  },
  {
    term: "Characters",
    desc: "Breakdown shown as correct / incorrect / extra / missed. \"Extra\" means letters typed beyond the word. \"Missed\" means letters you skipped.",
  },
  {
    term: "Time",
    desc: "How long the test took in seconds.",
  },
];

const modes = [
  { name: "Time", desc: "Countdown timer — type as much as you can before time runs out." },
  { name: "Words", desc: "Fixed number of words to type." },
  { name: "Quote", desc: "Type a passage from a real quote." },
  { name: "Zen", desc: "Free typing — no target text. Type whatever you want, press Shift+Enter when done." },
  { name: "Source", desc: "Paste your own code or text and type it back. Shows which parts slow you down." },
  { name: "Bug Hunt", desc: "See broken code, then type the corrected version." },
];

export function InfoModal({ open, onDismiss }: InfoModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onDismiss();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onDismiss]);

  useEffect(() => {
    if (open) cardRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onDismiss}
        >
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />

          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-label="About MocType"
            tabIndex={-1}
            className="relative max-w-lg w-[90vw] max-h-[80vh] rounded-2xl outline-none flex flex-col"
            style={{ background: "var(--bg-alt)" }}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header (sticky) */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
              <h2 className="text-lg font-bold tracking-wide" style={{ color: "var(--main)" }}>
                About MocType
              </h2>
              <button
                onClick={onDismiss}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer"
                style={{ color: "var(--sub)" }}
                aria-label="Close info dialog"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--main)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sub)")}
              >
                ✕
              </button>
            </div>

            {/* scrollable content */}
            <div className="overflow-y-auto px-8 pb-8 flex-1 min-h-0">
              {/* intro */}
              <p className="text-sm mb-6" style={{ color: "var(--sub)" }}>
                A free typing speed test. Pick a mode, type what appears on screen, and see how fast and accurate you are.
              </p>

              {/* stats */}
              <SectionTitle>What each stat means</SectionTitle>
              <div className="flex flex-col gap-3 mb-6">
                {stats.map((s) => (
                  <div key={s.term}>
                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                      {s.term}
                    </span>
                    <span className="text-sm ml-2" style={{ color: "var(--sub)" }}>
                      {s.desc}
                    </span>
                  </div>
                ))}
              </div>

              {/* chart */}
              <SectionTitle>The chart</SectionTitle>
              <p className="text-sm mb-6" style={{ color: "var(--sub)" }}>
                After each test you&apos;ll see a line graph. The <strong style={{ color: "var(--text)" }}>solid line</strong> is
                your WPM each second, and the <strong style={{ color: "var(--text)" }}>dashed line</strong> is your raw WPM.
                It lets you see exactly where you sped up or slowed down.
              </p>

              {/* modes */}
              <SectionTitle>Modes</SectionTitle>
              <div className="flex flex-col gap-2 mb-6">
                {modes.map((m) => (
                  <div key={m.name} className="flex gap-2">
                    <span
                      className="text-xs font-bold uppercase tracking-wider shrink-0 mt-0.5 px-2 py-0.5 rounded"
                      style={{ background: "var(--bg)", color: "var(--text)" }}
                    >
                      {m.name}
                    </span>
                    <span className="text-sm" style={{ color: "var(--sub)" }}>
                      {m.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs font-bold uppercase tracking-widest mb-3 pt-4 border-t"
      style={{ color: "var(--main)", borderColor: "var(--sub-alt)" }}
    >
      {children}
    </h3>
  );
}
