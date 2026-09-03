import { addDays } from "../dateUtils";
import type { HealthDateRange } from "./types";

/**
 * Product 2.1 Phase W — one consistent range implementation for every
 * Phase W/X/Y/Z/AD consumer (brief §7: "avoid duplicating range logic
 * across future features"), following the exact same construction
 * `resolveInsightsRange` already established for the Insights tab:
 * `rangeStart` inclusive, `rangeEnd` exclusive, anchored to `today + 1 day`
 * so today's own entries are included. Kept separate from
 * `resolveInsightsRange` rather than extended, because that function's
 * preset vocabulary ("4w"/"3m"/"6m"/"all") is specific to the Insights
 * tab's own UI control (UX spec §J) — Product 2.1's ranges are a distinct,
 * smaller vocabulary (7/30/90 days) with a different set of callers
 * (Doctor Report, AI weekly summary, Timeline), not a superset/subset of
 * the Insights control.
 */
export const HEALTH_SUMMARY_RANGE_DAYS = {
  last7: 7,
  last30: 30,
  last90: 90,
} as const;

export type HealthSummaryRangeDays = (typeof HEALTH_SUMMARY_RANGE_DAYS)[keyof typeof HEALTH_SUMMARY_RANGE_DAYS];

/**
 * `days` is the number of calendar days *before* today the range reaches
 * back to — `resolveHealthDateRange(30, "2026-09-03")` covers 2026-08-04
 * through 2026-09-03 inclusive (30 distinct calendar dates). Day-boundary
 * behavior is inherited directly from `dateUtils`'s own UTC-anchored
 * date-only arithmetic (Tech Arch §H) — this function never reads a wall
 * clock or a device timezone itself, so it is exercised identically
 * regardless of the caller's local time.
 */
export function resolveHealthDateRange(days: number, today: string): HealthDateRange {
  return {
    rangeStart: addDays(today, -(days - 1)),
    rangeEnd: addDays(today, 1),
  };
}
