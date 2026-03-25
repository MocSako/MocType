import type { Word } from "@/store/useTestStore";
import type { ClassifiedWord } from "./segmentClassifier";

export function buildSourceRun(classified: ClassifiedWord[]): Word[] {
  return classified.map((cw) => ({
    letters: cw.text.split("").map((ch) => ({
      char: ch,
      status: "pending" as const,
    })),
    typed: "",
    segment: cw.segment,
  }));
}
