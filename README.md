# MocType

A minimalist typing test built for developers.

## Why

Most typing tests measure prose. Real work is `forEach`, `=>`, and `{}`. MocType adds modes for **real code** (paste your own or hunt bugs in snippets) alongside the usual time/word/quote drills.

## Modes

- **Time** -- Countdown runs; optional punctuation and numbers.
- **Words** -- Fixed word count from common-word lists.
- **Quote** -- Passages from a quote pool; filter by length.
- **Zen** -- Word-count runs like Words; the deck only shows “just type” so you are not fiddling with presets.
- **Source** -- Paste any snippet; segments (keywords, strings, operators, etc.) are highlighted so you see where you lag. **Smart Remix** replays only segment types you missed.
- **Bug Hunt** -- You see a broken snippet, then type the fix. Curated challenges with **easy / medium / hard** difficulty.

Other bits: **Typing DNA** for per-character and per-segment stats, light/dark theme, and a compact header (“command deck”) for mode and presets.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

Next.js, React, Zustand, Tailwind CSS, Framer Motion, Recharts.

## Contributing

PRs and issues welcome.
