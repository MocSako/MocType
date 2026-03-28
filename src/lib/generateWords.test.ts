import { describe, it, expect } from "vitest";
import { generateWords } from "./generateWords";

describe("generateWords — zen mode", () => {
  const zenOpts = {
    mode: "zen" as const,
    wordCount: 50,
    timeConfig: 30,
    quoteLength: "medium" as const,
    punctuation: false,
    numbers: false,
  };

  it("returns a single blank word for zen", () => {
    const words = generateWords(zenOpts);
    expect(words).toHaveLength(1);
    expect(words[0].letters).toHaveLength(0);
    expect(words[0].typed).toBe("");
  });

  it("ignores wordConfig for zen", () => {
    const a = generateWords({ ...zenOpts, wordCount: 10 });
    const b = generateWords({ ...zenOpts, wordCount: 100 });
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
  });
});

describe("generateWords — words mode regression", () => {
  it("still generates wordCount words for words mode", () => {
    const words = generateWords({
      mode: "words",
      wordCount: 25,
      timeConfig: 30,
      quoteLength: "medium",
      punctuation: false,
      numbers: false,
    });
    expect(words).toHaveLength(25);
  });
});
