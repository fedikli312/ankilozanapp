import { addDays } from "../dateUtils";
import type { DateRange } from "./types";

export const INSIGHTS_RANGE_PRESETS = ["4w", "3m", "6m", "all"] as const;
export type InsightsRangePreset = (typeof INSIGHTS_RANGE_PRESETS)[number];

/** Long enough before any real user data to behave as "the beginning of time" for a date-only range. */
const ALL_TIME_START = "2000-01-01";

const PRESET_DAYS: Record<Exclude<InsightsRangePreset, "all">, number> = {
  "4w": 28,
  "3m": 90,
  "6m": 182,
};

/**
 * Resolves the Insights time-range control (UX spec §J: "4 weeks / 3 months
 * / 6 months / all time — a segmented control") into a concrete `DateRange`,
 * anchored to today. `rangeEnd` is exclusive (Tech Arch §H convention), so
 * it is `today + 1 day` to include today's own entries.
 */
export function resolveInsightsRange(preset: InsightsRangePreset, today: string): DateRange {
  const rangeEnd = addDays(today, 1);
  if (preset === "all") {
    return { rangeStart: ALL_TIME_START, rangeEnd };
  }
  return { rangeStart: addDays(today, -PRESET_DAYS[preset]), rangeEnd };
}
