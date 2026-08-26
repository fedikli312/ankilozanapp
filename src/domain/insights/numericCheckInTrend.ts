import { INSIGHTS_THRESHOLDS } from "../constants";
import { addDays, diffInDays, isWithinRange } from "../dateUtils";
import type { DateRange, NumericTrend, TrendDirection } from "./types";

export type CheckInForTrend = {
  date: string;
};

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function direction(current: number, previous: number): TrendDirection {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

/**
 * Shared implementation behind `computePainHistory`/`computeFatigueHistory`
 * (Tech Arch §I: "same shape as pain"). Compares the requested range against
 * the immediately preceding period of equal length.
 */
export function computeNumericCheckInTrend<T extends CheckInForTrend>(
  checkIns: readonly T[],
  range: DateRange,
  selectValue: (checkIn: T) => number,
): NumericTrend {
  const inRange = checkIns.filter((c) => isWithinRange(c.date, range.rangeStart, range.rangeEnd));

  const rangeLengthDays = diffInDays(range.rangeStart, range.rangeEnd);
  const previousRangeStart = addDays(range.rangeStart, -rangeLengthDays);
  const previousInRange = checkIns.filter((c) =>
    isWithinRange(c.date, previousRangeStart, range.rangeStart),
  );

  const sufficientData = inRange.length >= INSIGHTS_THRESHOLDS.minCheckInsForTrend;

  if (!sufficientData) {
    return {
      average: 0,
      previousPeriodAverage: null,
      direction: null,
      dataPoints: inRange.length,
      sufficientData: false,
    };
  }

  const currentAverage = average(inRange.map(selectValue));
  const previousAverage =
    previousInRange.length >= INSIGHTS_THRESHOLDS.minCheckInsForTrend
      ? average(previousInRange.map(selectValue))
      : null;

  return {
    average: currentAverage,
    previousPeriodAverage: previousAverage,
    direction: previousAverage === null ? null : direction(currentAverage, previousAverage),
    dataPoints: inRange.length,
    sufficientData: true,
  };
}
