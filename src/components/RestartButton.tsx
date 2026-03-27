"use client";

interface RestartButtonProps {
  onClick: () => void;
}

export default function RestartButton({ onClick }: RestartButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-full transition-colors hover:opacity-70"
      style={{ color: "var(--sub)" }}
      aria-label="Restart Test"
      tabIndex={-1}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
      </svg>
    </button>
  );
}
