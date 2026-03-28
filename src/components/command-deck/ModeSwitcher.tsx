"use client";

import { motion, LayoutGroup } from "framer-motion";
import { useConfigStore, type Mode } from "@/store/useConfigStore";
import { modeVisuals } from "./nav-language";

interface ModeSwitcherProps {
  id: string;
  onModeChange: (mode: Mode) => void;
}

export function ModeSwitcher({ id, onModeChange }: ModeSwitcherProps) {
  const mode = useConfigStore((s) => s.mode);

  return (
    <LayoutGroup id={id}>
      <div className="type-atelier-mode-rail">
        {(Object.entries(modeVisuals) as [Mode, (typeof modeVisuals)[Mode]][]).map(([key, visual]) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className="relative z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs tracking-wider transition-colors whitespace-nowrap"
            style={{ color: mode === key ? "var(--main)" : "var(--sub)" }}
          >
            {mode === key && (
              <motion.div
                layoutId="type-atelier-tab"
                className="type-atelier-active-tab"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10" style={{ opacity: mode === key ? 1 : 0.7 }}>
              {visual.glyph}
            </span>
            <span className="relative z-10">{visual.label}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}
