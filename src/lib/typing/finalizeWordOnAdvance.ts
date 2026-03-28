import type { Letter } from "@/store/useTestStore";

export function finalizeWordOnAdvance(
  letters: Letter[],
  cursorIndex: number,
): Letter[] {
  return letters.map((letter, index) =>
    index >= cursorIndex && letter.status === "pending"
      ? { ...letter, status: "incorrect" as const }
      : letter
  );
}
