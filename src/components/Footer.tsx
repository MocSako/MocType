"use client";

import { useConfigStore } from "@/store/useConfigStore";
import { useTestStore } from "@/store/useTestStore";

export default function Footer() {
  const mode = useConfigStore((s) => s.mode);
  const phase = useTestStore((s) => s.phase);
  const isZenTyping = mode === "zen" && phase === "typing";

  return (
    <footer className="w-full max-w-[1100px] mx-auto px-6 py-6 mt-auto">
      <div className="flex items-center justify-center gap-4 text-xs tracking-wider uppercase" style={{ color: "var(--sub)" }}>
        {isZenTyping && <span>shift + enter — finish</span>}
        <span>tab — restart</span>
      </div>
    </footer>
  );
}
