"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "moctype-welcomed";

interface WelcomeModalProps {
  open: boolean;
  onDismiss: () => void;
  onOpenInfo?: () => void;
}

const features = [
  { icon: "⏱", label: "timed tests, word challenges & quotes" },
  { icon: "✏️", label: "paste any text or code to practice" },
  { icon: "🔍", label: "spot-the-error coding challenges" },
];

export function hasBeenWelcomed(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function markWelcomed(): void {
  localStorage.setItem(STORAGE_KEY, "true");
}

export function WelcomeModal({ open, onDismiss, onOpenInfo }: WelcomeModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();
      onDismiss();
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
            aria-label="Welcome to MocType"
            tabIndex={-1}
            className="relative max-w-md w-[90vw] rounded-2xl p-8 outline-none"
            style={{ background: "var(--bg-alt)" }}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer"
              style={{ color: "var(--sub)" }}
              aria-label="Close welcome dialog"
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sub)")}
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-[0.625rem] font-extrabold text-lg shrink-0"
                style={{ background: "var(--main)", color: "var(--bg)", letterSpacing: "0.05em" }}
              >
                M
              </span>
              <span
                className="text-sm font-bold tracking-[0.25em] uppercase"
                style={{ color: "var(--main)" }}
              >
                MOCTYPE
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
              see how fast you can type.
              <span
                className="inline-block w-[2px] h-[1.1em] align-text-bottom ml-0.5"
                style={{ background: "var(--main)", animation: "caretPulse 1s ease infinite" }}
              />
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--sub)" }}>
              choose a mode, type what appears, and track your speed.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center shrink-0">{f.icon}</span>
                  <span className="text-sm" style={{ color: "var(--sub)" }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="flex items-center justify-between mb-6 pt-4 border-t text-xs"
              style={{ borderColor: "var(--sub-alt)", color: "var(--sub)" }}
            >
              <span className="flex items-center gap-1.5">
                <kbd
                  className="inline-block px-1.5 py-0.5 rounded text-[0.7rem] font-bold"
                  style={{ background: "var(--sub-alt)", color: "var(--text)" }}
                >
                  Tab
                </kbd>
                restart test
              </span>
              {onOpenInfo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenInfo();
                  }}
                  className="underline cursor-pointer transition-colors"
                  style={{ color: "var(--sub)", background: "none", border: "none", padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--main)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sub)")}
                >
                  learn more
                </button>
              )}
            </div>

            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-xl text-sm font-bold tracking-wider transition-opacity cursor-pointer"
              style={{ background: "var(--main)", color: "var(--bg)" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              start typing
            </button>

            <p className="text-center text-[0.65rem] mt-3 select-none" style={{ color: "var(--sub)" }}>
              won&apos;t show again
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
