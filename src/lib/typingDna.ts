import type { TestStats, SegmentMetric, SegmentType } from "@/store/useTestStore";
import { getSegmentLabel } from "./segmentClassifier";

export interface DnaInsight {
  label: string;
  description: string;
  type: "strength" | "weakness" | "neutral";
}

export interface TypingDnaProfile {
  headline: string;
  insights: DnaInsight[];
  weakestSegments: SegmentType[];
}

export function deriveTypingDna(stats: TestStats): TypingDnaProfile | null {
  if (!stats.segmentMetrics || stats.segmentMetrics.length === 0) return null;

  const metrics = stats.segmentMetrics.filter((m) => m.wordCount >= 2);
  if (metrics.length === 0) return null;

  const avgWpm = stats.wpm;
  const insights: DnaInsight[] = [];

  const sorted = [...metrics].sort((a, b) => b.wpm - a.wpm);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  if (best && best.wpm > avgWpm * 1.1) {
    insights.push({
      label: `Strong on ${getSegmentLabel(best.type)}`,
      description: `${best.wpm} WPM — ${Math.round(((best.wpm - avgWpm) / avgWpm) * 100)}% above your average`,
      type: "strength",
    });
  }

  if (worst && worst.wpm < avgWpm * 0.9 && worst !== best) {
    insights.push({
      label: `Slows down on ${getSegmentLabel(worst.type)}`,
      description: `${worst.wpm} WPM — ${Math.round(((avgWpm - worst.wpm) / avgWpm) * 100)}% below your average`,
      type: "weakness",
    });
  }

  for (const m of metrics) {
    if (m.totalChars > 0) {
      const accuracy = Math.round((m.correctChars / m.totalChars) * 100);
      if (accuracy < 85) {
        insights.push({
          label: `Error-prone on ${getSegmentLabel(m.type)}`,
          description: `${accuracy}% accuracy across ${m.wordCount} words`,
          type: "weakness",
        });
      }
    }
  }

  const highAccuracySegments = metrics.filter((m) => {
    if (m.totalChars === 0) return false;
    return (m.correctChars / m.totalChars) > 0.95;
  });
  if (highAccuracySegments.length > 0 && highAccuracySegments.length === metrics.length) {
    insights.push({
      label: "Precision typist",
      description: "Over 95% accuracy across all content types",
      type: "strength",
    });
  }

  if (stats.consistency >= 85) {
    insights.push({
      label: "Steady rhythm",
      description: `${stats.consistency}% consistency — your pace barely wavered`,
      type: "strength",
    });
  } else if (stats.consistency < 60) {
    insights.push({
      label: "Uneven pacing",
      description: `${stats.consistency}% consistency — some segments threw off your rhythm`,
      type: "weakness",
    });
  }

  const weakestSegments = sorted
    .filter((m) => m.wpm < avgWpm * 0.95)
    .map((m) => m.type);

  const headline = buildHeadline(stats, best, worst);

  return { headline, insights, weakestSegments };
}

function buildHeadline(stats: TestStats, best: SegmentMetric | undefined, worst: SegmentMetric | undefined): string {
  if (stats.wpm >= 100 && stats.accuracy >= 95) return "Speed demon with surgical precision";
  if (stats.wpm >= 80 && stats.accuracy >= 90) return "Fast and fluent across mixed content";
  if (stats.wpm >= 60 && worst && worst.wpm < stats.wpm * 0.7) {
    return `Solid overall, but ${getSegmentLabel(worst.type).toLowerCase()} breaks your flow`;
  }
  if (stats.accuracy >= 95) return "Accuracy-first typist — slow and steady";
  if (stats.wpm >= 60) return "Comfortable pace, room to sharpen edges";
  return "Building your typing profile — keep going";
}
