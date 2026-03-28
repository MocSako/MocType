import { describe, it, expect } from "vitest";
import { selectChallenge } from "./selectChallenge";
import type { BugHuntChallenge } from "./types";

const STUB_CHALLENGES: BugHuntChallenge[] = [
  {
    id: "easy-1",
    title: "Missing bracket",
    language: "javascript",
    difficulty: "easy",
    bugType: "syntax",
    brokenCode: "function greet(name {\n  return `Hello, ${name}!`;\n}",
    correctedCode: "function greet(name) {\n  return `Hello, ${name}!`;\n}",
    explanation: "Missing closing parenthesis after the parameter list.",
  },
  {
    id: "medium-1",
    title: "Wrong operator",
    language: "typescript",
    difficulty: "medium",
    bugType: "logic",
    brokenCode: "const isEven = (n: number) => n % 2 !== 0;",
    correctedCode: "const isEven = (n: number) => n % 2 === 0;",
    explanation: "Used !== instead of === for an even check.",
  },
];

describe("selectChallenge", () => {
  it("returns a challenge from the pool", () => {
    const result = selectChallenge(STUB_CHALLENGES);
    expect(STUB_CHALLENGES).toContainEqual(result);
  });

  it("filters by difficulty when specified", () => {
    const result = selectChallenge(STUB_CHALLENGES, { difficulty: "easy" });
    expect(result.difficulty).toBe("easy");
  });

  it("avoids the previously used challenge id when possible", () => {
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const r = selectChallenge(STUB_CHALLENGES, { lastId: "easy-1" });
      results.add(r.id);
    }
    expect(results.has("medium-1")).toBe(true);
  });

  it("falls back to any challenge when all are excluded", () => {
    const single = [STUB_CHALLENGES[0]];
    const result = selectChallenge(single, { lastId: "easy-1" });
    expect(result.id).toBe("easy-1");
  });
});
