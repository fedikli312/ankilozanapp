import { INSIGHTS_THRESHOLDS } from "../constants";
import { isWithinRange } from "../dateUtils";
import type { DateRange } from "./types";

export type LabResultForHistory = {
  marker: string;
  value: number;
  recordedDate: string;
};

export type LabHistory = {
  values: LabResultForHistory[];
  min: number | null;
  max: number | null;
  mostRecent: LabResultForHistory | null;
  sufficientData: boolean;
};

export function computeLabHistory(
  results: readonly LabResultForHistory[],
  marker: string,
  range: DateRange,
): LabHistory {
  const inRange = results
    .filter((r) => r.marker === marker && isWithinRange(r.recordedDate, range.rangeStart, range.rangeEnd))
    .slice()
    .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate));

  if (inRange.length === 0) {
    return { values: [], min: null, max: null, mostRecent: null, sufficientData: false };
  }

  const values = inRange.map((r) => r.value);

  return {
    values: inRange,
    min: Math.min(...values),
    max: Math.max(...values),
    mostRecent: inRange[inRange.length - 1],
    // A single value is "most recent reading," not a trend (Tech Arch §I).
    sufficientData: inRange.length >= INSIGHTS_THRESHOLDS.minLabValuesForTrend,
  };
}
