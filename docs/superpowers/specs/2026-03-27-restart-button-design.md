# Restart Button and Shortcut Redesign

## Purpose
Update the restart control to differentiate MocType from MonkeyType and establish a distinct, developer-focused aesthetic.

## Changes

1. **Restart Icon (`src/components/RestartButton.tsx`)**
   - Current: Circular refresh/reload arrow
   - New: Double Chevron (`>>` style), communicating "fast-forward" or "next challenge" rather than "repeat".
   - Implementation: Inline SVG, 18x18, stroke width 2, same `var(--sub)` color and button container as before.

2. **Keyboard Shortcut (`src/hooks/useTypingEngine.ts` & `src/components/Footer.tsx`)**
   - Current: `Tab` + `Enter`
   - New: `Shift` + `Enter`
   - Implementation Details:
     - Remove `tabPressedRef` and the Tab keydown/keyup tracking logic from `useTypingEngine.ts`.
     - Update the `Enter` handler to check for `e.shiftKey`. If true, call `initTest()`.
     - Update footer hint text to read: `shift + enter — restart`.

## Constraints & Scope
- The button size, placement, and hover states remain identical.
- No new external icon dependencies; continue using inline SVGs.
- The `startFresh` vs `initTest` functional distinction remains the same.
- This design explicitly replaces the previously implemented (but incorrect) single forward arrow.