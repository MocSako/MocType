import { describe, it, expect, beforeEach } from "vitest";
import { useTestStore } from "./useTestStore";

describe("useTestStore — appendWord", () => {
  beforeEach(() => {
    useTestStore.getState().reset();
  });

  it("appends a blank word to existing words", () => {
    useTestStore.getState().setWords([{ letters: [], typed: "" }]);
    useTestStore.getState().appendWord({ letters: [], typed: "" });
    expect(useTestStore.getState().words).toHaveLength(2);
  });

  it("preserves existing words when appending", () => {
    const existing = {
      letters: [{ char: "h", status: "correct" as const }],
      typed: "h",
    };
    useTestStore.getState().setWords([existing]);
    useTestStore.getState().appendWord({ letters: [], typed: "" });

    const words = useTestStore.getState().words;
    expect(words[0]).toEqual(existing);
    expect(words[1]).toEqual({ letters: [], typed: "" });
  });
});
