# MocType

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A minimalist typing test built for developers.

## Why

Most typing tests measure prose. Real work is `forEach`, `=>`, and `{}`. MocType adds modes for **real code** (paste your own or hunt bugs in snippets) alongside the usual time/word/quote drills.

## Modes

- **Time** -- Countdown runs; optional punctuation and numbers.
- **Words** -- Fixed word count from common-word lists.
- **Quote** -- Passages from a quote pool; filter by length.
- **Zen** -- Freeform open-ended typing with no target text. Type whatever you want; press **Shift + Enter** to finish and see your stats.
- **Source** -- Paste any snippet; segments (keywords, strings, operators, etc.) are highlighted so you see where you lag. **Smart Remix** replays only segment types you missed.
- **Bug Hunt** -- You see a broken snippet, then type the fix. Curated challenges with **easy / medium / hard** difficulty.

Other bits: **Typing DNA** for per-character and per-segment stats, light/dark theme, and a compact header ("command deck") for mode and presets.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| UI | React, Tailwind CSS v4, Framer Motion |
| State | Zustand |
| Charts | Recharts |
| Testing | Vitest |
| Linting | ESLint (core-web-vitals + TypeScript) |

## Project Structure

```
src/
├── app/            # Next.js App Router (layout, page, styles)
├── components/     # React components + command-deck submodule
├── hooks/          # useTypingEngine — keystroke handling & timers
├── lib/            # Pure logic: word gen, stats, source parser, bug-hunt
│   ├── bug-hunt/   # Challenge data, selection, and run builder
│   └── typing/     # Word finalization helpers
└── store/          # Zustand stores (config + test state)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Contributing

PRs and issues welcome. Please run `npm run lint && npm test` before submitting.

## License

[MIT](LICENSE)
