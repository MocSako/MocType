// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useConfigStore } from "@/store/useConfigStore";
import { useTestStore } from "@/store/useTestStore";

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get(_target, prop) {
        return (props: Record<string, unknown>) =>
          createElement(prop as string, props);
      },
    },
  ),
  LayoutGroup: ({ children }: { children: unknown }) => children,
  AnimatePresence: ({ children }: { children: unknown }) => children,
}));

function getHeaderWrapper(container: HTMLDivElement) {
  const header = container.querySelector("header");
  return header?.parentElement ?? null;
}

describe("Home page – header interactivity during typing", () => {
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

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
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
        { letters: [{ char: "a", status: "pending" }], typed: "" },
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

  it("header is clickable while a test is in the typing phase", async () => {
    const Home = (await import("@/app/page")).default;

    act(() => {
      root.render(createElement(Home));
    });

    act(() => {
      useTestStore.setState({ phase: "typing", startTime: Date.now() });
    });

    const headerWrapper = getHeaderWrapper(container);
    expect(headerWrapper).not.toBeNull();
    expect(headerWrapper!.style.pointerEvents).not.toBe("none");
  });

  it("clicking a mode button during typing resets the test", async () => {
    const Home = (await import("@/app/page")).default;

    act(() => {
      root.render(createElement(Home));
    });

    act(() => {
      useTestStore.setState({ phase: "typing", startTime: Date.now() });
    });

    const modeButtons = container.querySelectorAll<HTMLButtonElement>(
      "header button",
    );
    const wordsButton = Array.from(modeButtons).find((btn) =>
      btn.textContent?.toLowerCase().includes("words"),
    );
    expect(wordsButton).toBeDefined();

    act(() => {
      wordsButton!.click();
    });

    expect(useConfigStore.getState().mode).toBe("words");
    expect(useTestStore.getState().phase).toBe("idle");
  });

  it("header dims during typing but reveals on mouse movement", async () => {
    const Home = (await import("@/app/page")).default;

    act(() => {
      root.render(createElement(Home));
    });

    act(() => {
      useTestStore.setState({ phase: "typing", startTime: Date.now() });
    });

    const headerWrapper = getHeaderWrapper(container)!;
    expect(headerWrapper.style.opacity).toBe("0.3");

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 0, clientY: 0 }));
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 50 }));
    });

    expect(headerWrapper.style.opacity).toBe("1");
  });

  it("header dims again when user resumes typing after mouse reveal", async () => {
    const Home = (await import("@/app/page")).default;

    act(() => {
      root.render(createElement(Home));
    });

    act(() => {
      useTestStore.setState({ phase: "typing", startTime: Date.now() });
    });

    const headerWrapper = getHeaderWrapper(container)!;

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 0, clientY: 0 }));
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 50 }));
    });
    expect(headerWrapper.style.opacity).toBe("1");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    });

    expect(headerWrapper.style.opacity).toBe("0.3");
  });
});
