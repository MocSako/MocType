import { useEffect, useRef, useSyncExternalStore } from "react";

const MOUSE_THRESHOLD_PX = 3;

type Subscriber = () => void;

let focused = false;
let listeners: Subscriber[] = [];

function getSnapshot(): boolean {
  return focused;
}

function subscribe(listener: Subscriber): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function setFocused(value: boolean) {
  if (value === focused) return;
  focused = value;
  for (const fn of listeners) fn();
}

export function useFocusMode(isTyping: boolean): boolean {
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  const isFocused = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!isTyping) {
      setFocused(false);
      lastMousePos.current = null;
      return;
    }

    setFocused(true);

    function onMouseMove(e: MouseEvent) {
      const prev = lastMousePos.current;
      if (prev === null) {
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const dx = Math.abs(e.clientX - prev.x);
      const dy = Math.abs(e.clientY - prev.y);
      if (dx > MOUSE_THRESHOLD_PX || dy > MOUSE_THRESHOLD_PX) {
        setFocused(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key.length === 1 || e.key === "Backspace" || e.key === " ") {
        setFocused(true);
        lastMousePos.current = null;
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isTyping]);

  return isFocused;
}
