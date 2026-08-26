import { INSIGHTS_THRESHOLDS } from "../constants";
import { isWithinRange } from "../dateUtils";
import type { DateRange } from "./types";

export type MorningStiffnessBucket = "none" | "under_15" | "15_30" | "30_60" | "over_60";

export type CheckInForStiffness = {
  date: string;
  morningStiffnessBucket: MorningStiffnessBucket;
};

export type StiffnessHistory = {
  bucketCounts: Record<MorningStiffnessBucket, number>;
  mostCommonBucket: MorningStiffnessBucket | null;
  dataPoints: number;
  sufficientData: boolean;
};

const EMPTY_BUCKET_COUNTS: Record<MorningStiffnessBucket, number> = {
  none: 0,
  under_15: 0,
  "15_30": 0,
  "30_60": 0,
  over_60: 0,
};

/**
 * Descriptive bucket counts, deliberately **not** a numeric average (Tech
 * Arch §I) — averaging ordinal duration buckets would fabricate a precision
 * the underlying data doesn't have.
 */
export function computeStiffnessHistory(
  checkIns: readonly CheckInForStiffness[],
  range: DateRange,
): StiffnessHistory {
  const inRange = checkIns.filter((c) => isWithinRange(c.date, range.rangeStart, range.rangeEnd));
  const sufficientData = inRange.length >= INSIGHTS_THRESHOLDS.minCheckInsForTrend;

  const bucketCounts = { ...EMPTY_BUCKET_COUNTS };
  for (const checkIn of inRange) {
    bucketCounts[checkIn.morningStiffnessBucket] += 1;
  }

  let mostCommonBucket: MorningStiffnessBucket | null = null;
  let highestCount = 0;
  for (const [bucket, count] of Object.entries(bucketCounts) as [MorningStiffnessBucket, number][]) {
    if (count > highestCount) {
      highestCount = count;
      mostCommonBucket = bucket;
    }
  }

  return {
    bucketCounts,
    mostCommonBucket: sufficientData ? mostCommonBucket : null,
    dataPoints: inRange.length,
    sufficientData,
  };
}
