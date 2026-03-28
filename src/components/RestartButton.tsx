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
      aria-label="Restart test"
      tabIndex={-1}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    </button>
  );
}
