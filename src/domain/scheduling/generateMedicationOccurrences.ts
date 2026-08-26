import { addDays, dayOfWeek, isBefore } from "../dateUtils";
import type { MedicationScheduleVersion } from "./types";

export type GenerateOccurrencesOptions = {
  schedule: MedicationScheduleVersion;
  /** Required for `frequencyType: "specific_days"`. 0 (Sunday) - 6 (Saturday). */
  daysOfWeek?: readonly number[];
  rangeStart: string;
  /** Exclusive. */
  rangeEnd: string;
};

/**
 * Generates the date-only occurrence dates a schedule version implies
 * within `[rangeStart, rangeEnd)`, clipped to the schedule's own
 * `[effectiveFrom, effectiveUntil)` range. Times-of-day are applied
 * separately by the caller (one date here can expand to N administrations
 * if a medication has multiple times per day) — this function only decides
 * *which days* the schedule applies to.
 */
export function generateMedicationOccurrences(options: GenerateOccurrencesOptions): string[] {
  const { schedule, daysOfWeek, rangeStart, rangeEnd } = options;

  const start = isBefore(schedule.effectiveFrom, rangeStart) ? rangeStart : schedule.effectiveFrom;
  const end =
    schedule.effectiveUntil && isBefore(schedule.effectiveUntil, rangeEnd)
      ? schedule.effectiveUntil
      : rangeEnd;

  if (!isBefore(start, end)) return [];

  const occurrences: string[] = [];

  if (schedule.frequencyType === "daily") {
    let cursor = start;
    while (isBefore(cursor, end)) {
      occurrences.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return occurrences;
  }

  if (schedule.frequencyType === "specific_days") {
    if (!daysOfWeek || daysOfWeek.length === 0) {
      throw new Error("specific_days schedules require at least one day of week");
    }
    const days = new Set(daysOfWeek);
    let cursor = start;
    while (isBefore(cursor, end)) {
      if (days.has(dayOfWeek(cursor))) occurrences.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return occurrences;
  }

  // custom_interval
  if (!schedule.intervalDays || schedule.intervalDays < 1) {
    throw new Error("custom_interval schedules require a positive intervalDays");
  }
  let cursor = schedule.effectiveFrom;
  while (isBefore(cursor, end)) {
    if (!isBefore(cursor, start)) occurrences.push(cursor);
    cursor = addDays(cursor, schedule.intervalDays);
  }
  return occurrences;
}
