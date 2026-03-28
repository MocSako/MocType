import type { Mode } from "@/store/useConfigStore";

export interface ModeVisual {
  glyph: string;
  label: string;
  contextLabel: string;
}

export const modeVisuals: Record<Mode, ModeVisual> = {
  time: { glyph: "<>", label: "time", contextLabel: "tempo" },
  words: { glyph: "//", label: "words", contextLabel: "batch" },
  quote: { glyph: "[]", label: "quote", contextLabel: "excerpt" },
  zen: { glyph: "..", label: "zen", contextLabel: "flow" },
  source: { glyph: "{/}", label: "source", contextLabel: "source" },
  "bug-hunt": { glyph: "!!", label: "bug hunt", contextLabel: "debug" },
};
