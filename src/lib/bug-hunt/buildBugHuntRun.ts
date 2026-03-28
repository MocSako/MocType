import type { Word } from "@/store/useTestStore";

export function buildBugHuntRun(correctedCode: string): Word[] {
  const tokens = correctedCode
    .split(/\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .flatMap((line) => line.split(/\s+/).filter(Boolean));

  return tokens.map((token) => ({
    letters: token.split("").map((ch) => ({ char: ch, status: "pending" as const })),
    typed: "",
  }));
}
