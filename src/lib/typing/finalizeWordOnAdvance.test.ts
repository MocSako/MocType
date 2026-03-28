import { describe, it, expect } from "vitest";
import { finalizeWordOnAdvance } from "./finalizeWordOnAdvance";
import type { Letter } from "@/store/useTestStore";

function mkLetters(chars: string, statuses: Letter["status"][]): Letter[] {
  return chars.split("").map((char, i) => ({ char, status: statuses[i] }));
}

describe("finalizeWordOnAdvance", () => {
  it("marks trailing pending letters as incorrect", () => {
    const letters = mkLetters("hello,", [
      "correct", "correct", "correct", "correct", "correct", "pending",
    ]);
    const result = finalizeWordOnAdvance(letters, 5);

    expect(result[4].status).toBe("correct");
    expect(result[5].status).toBe("incorrect");
    expect(result[5].char).toBe(",");
  });

  it("marks multiple remaining pending letters as incorrect", () => {
    const letters = mkLetters("test.", [
      "correct", "correct", "pending", "pending", "pending",
    ]);
    const result = finalizeWordOnAdvance(letters, 2);

    expect(result[0].status).toBe("correct");
    expect(result[1].status).toBe("correct");
    expect(result[2].status).toBe("incorrect");
    expect(result[3].status).toBe("incorrect");
    expect(result[4].status).toBe("incorrect");
  });

  it("does not touch already-typed or extra letters", () => {
    const letters: Letter[] = [
      { char: "a", status: "correct" },
      { char: "b", status: "incorrect" },
      { char: "z", status: "extra" },
      { char: "c", status: "pending" },
    ];
    const result = finalizeWordOnAdvance(letters, 2);

    expect(result[0].status).toBe("correct");
    expect(result[1].status).toBe("incorrect");
    expect(result[2].status).toBe("extra");
    expect(result[3].status).toBe("incorrect");
  });

  it("returns an unchanged copy when cursor is at end", () => {
    const letters = mkLetters("ok", ["correct", "correct"]);
    const result = finalizeWordOnAdvance(letters, 2);

    expect(result).toEqual(letters);
    expect(result).not.toBe(letters);
  });

  it("does not mutate the original array", () => {
    const letters = mkLetters("ab", ["correct", "pending"]);
    finalizeWordOnAdvance(letters, 1);

    expect(letters[1].status).toBe("pending");
  });
});
