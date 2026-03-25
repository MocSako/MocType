import type { SegmentType } from "@/store/useTestStore";
import type { ParsedBlock } from "./sourceParser";

export interface ClassifiedWord {
  text: string;
  segment: SegmentType;
}

export function classifyBlocks(blocks: ParsedBlock[]): ClassifiedWord[] {
  const result: ClassifiedWord[] = [];

  for (const block of blocks) {
    const words = block.text.split(/\s+/).filter((w) => w.length > 0);

    for (const word of words) {
      const segment = classifyWord(word, block.lineType);
      result.push({ text: word, segment });
    }
  }

  return result;
}

function classifyWord(word: string, lineType: ParsedBlock["lineType"]): SegmentType {
  if (lineType === "heading") return "heading";
  if (lineType === "code") return "code";

  if (/^\d[\d,.:%/$]*$/.test(word)) return "numbers";

  const symbolCount = (word.match(/[{}()[\]<>=;|&@$\/\\:]/g) || []).length;
  if (symbolCount / word.length > 0.3 && word.length > 2) return "code";

  if (word.includes("_") || word.includes("::") || word.includes("->") || word.includes(".")) {
    if (/[a-zA-Z]/.test(word)) return "code";
  }

  const punctCount = (word.match(/[.,;:!?"'()\-—]/g) || []).length;
  if (punctCount / word.length > 0.35 && word.length > 1) return "punctuation_heavy";

  if (/^[A-Z][a-z]/.test(word) && !/^(The|A|An|In|On|At|To|For|Of|And|But|Or|Is|It|He|She|We|My|As|Do|If|So|No|Up|By)$/.test(word)) {
    return "proper_noun";
  }

  return "prose";
}

export function getSegmentLabel(segment: SegmentType): string {
  const labels: Record<SegmentType, string> = {
    prose: "Prose",
    numbers: "Numbers",
    punctuation_heavy: "Punctuation",
    proper_noun: "Proper Nouns",
    code: "Code / Symbols",
    heading: "Headings",
  };
  return labels[segment];
}

export function getSegmentColor(segment: SegmentType): string {
  const colors: Record<SegmentType, string> = {
    prose: "var(--sub)",
    numbers: "#e2b714",
    punctuation_heavy: "#bb86fc",
    proper_noun: "#03dac6",
    code: "#ff7043",
    heading: "#64b5f6",
  };
  return colors[segment];
}
