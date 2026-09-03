import { isWithinRange } from "../dateUtils";
import type { MorningStiffnessBucket } from "../insights";
import type { HealthDateRange, HighSymptomDayEntry, HighSymptomDaySummary } from "./types";

export type CheckInForHighSymptomDay = {
  date: string;
  pain: number;
  fatigue: number;
  morningStiffnessBucket: MorningStiffnessBucket;
  notes: string | null;
  isHighSymptomDay: boolean;
};

/**
 * Reads the `isHighSymptomDay` marker exactly as recorded — this function
 * never infers the marker from `pain`/`fatigue`/`morningStiffnessBucket`
 * (Phase W brief §2/§6, the AS explicit-control invariant restated at the
 * one place a future contributor might otherwise be tempted to "helpfully"
 * derive it from a score threshold). Sorted most-recent-first, matching
 * how the Timeline and Doctor Report both want to present it.
 */
export function computeHighSymptomDays(
  checkIns: readonly CheckInForHighSymptomDay[],
  range: HealthDateRange,
): HighSymptomDaySummary {
  const days: HighSymptomDayEntry[] = checkIns
    .filter((c) => c.isHighSymptomDay && isWithinRange(c.date, range.rangeStart, range.rangeEnd))
    .map((c) => ({
      date: c.date,
      pain: c.pain,
      fatigue: c.fatigue,
      morningStiffnessBucket: c.morningStiffnessBucket,
      note: c.notes,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return { count: days.length, days };
}
