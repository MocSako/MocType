// @vitest-environment jsdom

import { act, createElement, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { useTypingEngine } from "./useTypingEngine";
import { useTestStore } from "@/store/useTestStore";
import { useConfigStore } from "@/store/useConfigStore";

const engineRef: { current: ReturnType<typeof useTypingEngine> | null } = { current: null };

function Harness() {
  const engine = useTypingEngine();
  useEffect(() => { engineRef.current = engine; });
  return null;
}

function handler(e: KeyboardEvent) {
  engineRef.current!.handleKeyDown(e);
}

function key(k: string, opts?: Partial<KeyboardEventInit>): KeyboardEvent {
  return new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...opts });
}

function setupHarness(init: () => void) {
  vi.useFakeTimers();
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  window.localStorage.clear();

  init();

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => { root.render(createElement(Harness)); });

  return { container, root };
}

function teardownHarness(root: Root, container: HTMLDivElement) {
  act(() => root.unmount());
  engineRef.current = null;
  container.remove();
  vi.useRealTimers();
}

function zenSetup() {
  useConfigStore.setState({ mode: "zen" });
  useTestStore.setState({
    words: [{ letters: [], typed: "" }],
    currentWordIndex: 0,
    currentLetterIndex: 0,
    phase: "typing",
    startTime: Date.now(),
    timerSeconds: 0,
    wpmHistory: [],
    stats: null,
    runKind: "standard",
    activeChallenge: null,
  });
}

describe("useTypingEngine — zen mode", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    ({ container, root } = setupHarness(() => {
      zenSetup();
    }));
  });

  afterEach(() => {
    teardownHarness(root, container);
  });

  it("adds typed characters as correct letters to a blank word", () => {
    act(() => handler(key("h")));
    act(() => handler(key("i")));

    const s = useTestStore.getState();
    expect(s.words[0].letters).toEqual([
      { char: "h", status: "correct" },
      { char: "i", status: "correct" },
    ]);
    expect(s.words[0].typed).toBe("hi");
  });

  it("space appends a new blank word without finishing", () => {
    act(() => handler(key("h")));
    act(() => handler(key("i")));
    act(() => handler(key(" ")));

    const s = useTestStore.getState();
    expect(s.phase).toBe("typing");
    expect(s.currentWordIndex).toBe(1);
    expect(s.words).toHaveLength(2);
    expect(s.words[1].letters).toHaveLength(0);
  });

  it("does not auto-finish at the last word boundary", () => {
    act(() => handler(key("a")));

    const s = useTestStore.getState();
    expect(s.phase).toBe("typing");
  });
});

describe("useTypingEngine — words mode regression", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    ({ container, root } = setupHarness(() => {
      useConfigStore.setState({ mode: "words" });
      useTestStore.setState({
        words: [{ letters: [{ char: "a", status: "pending" }], typed: "" }],
        currentWordIndex: 0,
        currentLetterIndex: 0,
        phase: "typing",
        startTime: Date.now(),
        timerSeconds: 0,
        wpmHistory: [],
        stats: null,
        runKind: "standard",
        activeChallenge: null,
      });
    }));
  });

  afterEach(() => {
    teardownHarness(root, container);
  });

  it("still auto-finishes at the last word boundary", () => {
    act(() => handler(key("a")));

    const s = useTestStore.getState();
    expect(s.phase).toBe("finished");
  });
});
