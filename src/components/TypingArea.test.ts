// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TypingArea from "@/components/TypingArea";
import { useConfigStore } from "@/store/useConfigStore";
import { useTestStore } from "@/store/useTestStore";

describe("TypingArea", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
    window.localStorage.clear();
    document.body.innerHTML = "";
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    useConfigStore.setState({
      mode: "time",
      timeConfig: 30,
      wordConfig: 50,
      quoteLength: "medium",
      punctuation: false,
      numbers: false,
      bugHuntDifficulty: "easy",
    });

    useTestStore.setState({
      words: [
        {
          letters: [{ char: "a", status: "pending" }],
          typed: "",
        },
      ],
      currentWordIndex: 0,
      currentLetterIndex: 0,
      phase: "idle",
      timerSeconds: 30,
      startTime: null,
      wpmHistory: [],
      stats: null,
      runKind: "standard",
      activeChallenge: null,
    });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it("restores focus when a typing key is pressed while blurred", () => {
    const onKeyDown = vi.fn();

    act(() => {
      root.render(
        createElement(TypingArea, {
          onRestart: vi.fn(),
          onKeyDown,
        })
      );
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();

    act(() => {
      input!.focus();
      input!.blur();
    });

    expect(container.textContent).toContain("Click here or press any key to focus");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(container.textContent).not.toContain("Click here or press any key to focus");
    expect(document.activeElement).toBe(input);
  });
});
