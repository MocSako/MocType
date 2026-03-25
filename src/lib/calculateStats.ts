import type { Word, WpmSnapshot, TestStats, SegmentMetric, SegmentType } from "@/store/useTestStore";

export function calculateWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((correctChars / 5) / (elapsedSeconds / 60));
}

export function calculateRawWpm(totalChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((totalChars / 5) / (elapsedSeconds / 60));
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

export function calculateConsistency(wpmHistory: WpmSnapshot[]): number {
  if (wpmHistory.length < 2) return 100;
  const wpms = wpmHistory.map((s) => s.wpm);
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
  const variance = wpms.reduce((sum, w) => sum + (w - mean) ** 2, 0) / wpms.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
  return Math.max(0, Math.round(100 - cv));
}

export function computeFinalStats(
  words: Word[],
  wpmHistory: WpmSnapshot[],
  elapsedSeconds: number,
  typedWordCount: number
): TestStats {
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;

  for (let i = 0; i < typedWordCount && i < words.length; i++) {
    const word = words[i];

    for (const letter of word.letters) {
      if (letter.status === "correct") correctChars++;
      else if (letter.status === "incorrect") incorrectChars++;
      else if (letter.status === "extra") extraChars++;
      else if (letter.status === "pending") missedChars++;
    }

    if (i < typedWordCount - 1 || word.typed.length > 0) {
      correctChars++;
    }
  }

  const totalChars = correctChars + incorrectChars + extraChars;
  const hasSegments = words.some((w) => w.segment != null);
  let segmentMetrics: SegmentMetric[] | undefined;

  if (hasSegments) {
    segmentMetrics = computeSegmentMetrics(words, typedWordCount, elapsedSeconds);
  }

  return {
    wpm: calculateWpm(correctChars, elapsedSeconds),
    raw: calculateRawWpm(totalChars, elapsedSeconds),
    accuracy: calculateAccuracy(correctChars, totalChars),
    consistency: calculateConsistency(wpmHistory),
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    time: Math.round(elapsedSeconds),
    segmentMetrics,
    isSourceRun: hasSegments,
  };
}

function computeSegmentMetrics(
  words: Word[],
  typedWordCount: number,
  elapsedSeconds: number
): SegmentMetric[] {
  const buckets = new Map<SegmentType, { correct: number; incorrect: number; total: number; wordCount: number }>();

  for (let i = 0; i < typedWordCount && i < words.length; i++) {
    const word = words[i];
    const seg = word.segment ?? "prose";

    if (!buckets.has(seg)) {
      buckets.set(seg, { correct: 0, incorrect: 0, total: 0, wordCount: 0 });
    }
    const b = buckets.get(seg)!;
    b.wordCount++;

    for (const letter of word.letters) {
      if (letter.status === "correct") { b.correct++; b.total++; }
      else if (letter.status === "incorrect") { b.incorrect++; b.total++; }
      else if (letter.status === "extra") { b.total++; }
    }
  }

  const totalWords = Array.from(buckets.values()).reduce((s, b) => s + b.wordCount, 0);

  return Array.from(buckets.entries()).map(([type, b]) => {
    const proportion = totalWords > 0 ? b.wordCount / totalWords : 0;
    const segTime = elapsedSeconds * proportion;

    return {
      type,
      wordCount: b.wordCount,
      correctChars: b.correct,
      incorrectChars: b.incorrect,
      totalChars: b.total,
      wpm: calculateWpm(b.correct, segTime),
    };
  });
}
