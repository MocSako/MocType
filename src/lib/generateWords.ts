import { englishTop200, englishTop1000 } from "./words";
import { getQuotesByLength } from "./quotes";
import type { Mode } from "@/store/useConfigStore";
import type { Word } from "@/store/useTestStore";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addPunctuation(word: string, index: number, total: number): string {
  if (index === 0) {
    word = word.charAt(0).toUpperCase() + word.slice(1);
  }
  const rand = Math.random();
  if (rand < 0.08 && index < total - 1) {
    word += ",";
  } else if (rand < 0.12 && index < total - 1) {
    word += ";";
  } else if (index === total - 1) {
    word += ".";
  }
  return word;
}

function addNumber(): string {
  return String(Math.floor(Math.random() * 1000));
}

function createWords(words: string[]): Word[] {
  return words.map((word) => ({
    letters: word.split("").map((ch) => ({ char: ch, status: "pending" as const })),
    typed: "",
  }));
}

function textToWords(text: string): Word[] {
  return createWords(text.split(" "));
}

export function generateWords(opts: {
  mode: Mode;
  wordCount: number;
  timeConfig: number;
  quoteLength: "all" | "short" | "medium" | "long";
  punctuation: boolean;
  numbers: boolean;
}): Word[] {
  const { mode, wordCount, timeConfig, punctuation, numbers } = opts;

  if (mode === "source" || mode === "bug-hunt") {
    return [];
  }

  if (mode === "quote") {
    const pool = getQuotesByLength(opts.quoteLength);
    const quote = pick(pool);
    return textToWords(quote.text);
  }

  const count = mode === "time" ? Math.max(100, timeConfig * 4) : wordCount;
  const pool = count > 50 ? englishTop1000 : englishTop200;
  const raw: string[] = [];

  for (let i = 0; i < count; i++) {
    if (numbers && Math.random() < 0.1) {
      raw.push(addNumber());
    } else {
      raw.push(pick(pool));
    }
  }

  const total = raw.length;
  const processed = raw.map((w, i) => (punctuation ? addPunctuation(w, i, total) : w));

  return createWords(processed);
}
