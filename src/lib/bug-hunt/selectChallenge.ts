import type { BugHuntChallenge, BugHuntDifficulty } from "./types";

interface SelectOptions {
  difficulty?: BugHuntDifficulty;
  lastId?: string;
}

export function selectChallenge(
  pool: BugHuntChallenge[],
  opts: SelectOptions = {},
): BugHuntChallenge {
  let candidates = pool;

  if (opts.difficulty) {
    const filtered = candidates.filter((c) => c.difficulty === opts.difficulty);
    if (filtered.length > 0) candidates = filtered;
  }

  if (opts.lastId && candidates.length > 1) {
    const deduped = candidates.filter((c) => c.id !== opts.lastId);
    if (deduped.length > 0) candidates = deduped;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}
