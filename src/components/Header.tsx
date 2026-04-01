"use client";

import { useConfigStore, type Mode } from "@/store/useConfigStore";
import { ModeSwitcher } from "./command-deck/ModeSwitcher";
import { ContextControls } from "./command-deck/ContextControls";
import { BrandMark } from "./command-deck/BrandMark";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onConfigChange: () => void;
  onOpenInfo?: () => void;
}

export default function Header({ onConfigChange, onOpenInfo }: HeaderProps) {
  const setMode = useConfigStore((s) => s.setMode);

  const handleModeChange = (mode: Mode) => {
    setMode(mode);
    onConfigChange();
  };

  return (
    <header className="command-deck w-full max-w-[1100px] mx-auto px-6 pt-6 pb-2">
      <div className="type-atelier-shell px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <BrandMark onClick={onConfigChange} />
          <div className="hidden md:flex min-w-0 shrink">
            <ModeSwitcher id="desktop" onModeChange={handleModeChange} />
          </div>
          <div className="flex items-center gap-1">
            {onOpenInfo && (
              <button
                onClick={onOpenInfo}
                className="type-atelier-theme-toggle"
                aria-label="About MocType"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        <div
          className="flex md:hidden justify-center mt-2 pt-2 border-t"
          style={{ borderColor: "var(--sub-alt)" }}
        >
          <ModeSwitcher id="mobile" onModeChange={handleModeChange} />
        </div>

        <div
          className="flex justify-center mt-2 pt-2 border-t"
          style={{ borderColor: "var(--sub-alt)" }}
        >
          <ContextControls onConfigChange={onConfigChange} />
        </div>
      </div>
    </header>
  );
}
