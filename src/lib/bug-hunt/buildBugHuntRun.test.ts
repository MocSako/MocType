import { describe, it, expect } from "vitest";
import { buildBugHuntRun } from "./buildBugHuntRun";

describe("buildBugHuntRun", () => {
  it("converts single-line code to Word[]", () => {
    const words = buildBugHuntRun("const x = 42;");
    expect(words).toHaveLength(4);
    expect(words[0].letters.map((l) => l.char).join("")).toBe("const");
    expect(words[1].letters.map((l) => l.char).join("")).toBe("x");
    expect(words[2].letters.map((l) => l.char).join("")).toBe("=");
    expect(words[3].letters.map((l) => l.char).join("")).toBe("42;");
  });

  it("normalises multi-line code into flat tokens", () => {
    const code = `function greet(name) {
  return "Hello, " + name;
}`;
    const words = buildBugHuntRun(code);
    const text = words.map((w) => w.letters.map((l) => l.char).join("")).join(" ");
    expect(text).toBe('function greet(name) { return "Hello, " + name; }');
  });

  it("skips empty lines", () => {
    const words = buildBugHuntRun("a\n\nb");
    expect(words).toHaveLength(2);
  });

  it("sets all letters to pending", () => {
    const words = buildBugHuntRun("let x = 1;");
    for (const word of words) {
      for (const letter of word.letters) {
        expect(letter.status).toBe("pending");
      }
    }
  });
});
