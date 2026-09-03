import { diffInDays, isWithinRange } from "../dateUtils";
import type { CheckInCoverage, HealthDateRange } from "./types";

export type CheckInForCoverage = { date: string };

/**
 * `daysInRange` is the range's own length in calendar days — `rangeEnd`
 * is exclusive (Tech Arch §H convention shared with every other function
 * here), so this is `diffInDays(rangeStart, rangeEnd)`, e.g. a 30-day
 * range genuinely reports 30, not 29 or 31.
 */
export function computeCheckInCoverage(
  checkIns: readonly CheckInForCoverage[],
  range: HealthDateRange,
): CheckInCoverage {
  const completedCount = checkIns.filter((c) => isWithinRange(c.date, range.rangeStart, range.rangeEnd)).length;
  return {
    completedCount,
    daysInRange: diffInDays(range.rangeStart, range.rangeEnd),
  };
}
