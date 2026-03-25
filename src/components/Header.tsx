"use client";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="w-full max-w-[1100px] mx-auto px-6 pt-6 pb-2 grid grid-cols-3 items-center">
      <div />
      <h1
        className="text-2xl font-bold tracking-widest uppercase text-center"
        style={{ color: "var(--main)" }}
      >
        moctype
      </h1>
      <div className="flex items-center justify-end gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
