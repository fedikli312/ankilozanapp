import { MEDICATION_ADMINISTRATION_GENERATION_WINDOW_DAYS } from "../constants";
import { addDays } from "../dateUtils";
import { generateMedicationOccurrences } from "./generateMedicationOccurrences";
import type { MedicationScheduleVersion } from "./types";

export type PlanAdministrationGenerationInput = {
  schedule: MedicationScheduleVersion;
  daysOfWeek?: readonly number[];
  /** HH:mm, local wall-clock — one administration is planned per date x time. */
  timesOfDay: readonly string[];
  /** Already-persisted `scheduledFor` values (`YYYY-MM-DDTHH:mm`), so a repeated call never duplicates a row. */
  existingScheduledFor: readonly string[];
  today: string;
  windowDays?: number;
};

/**
 * Which `MedicationAdministration` rows need to be created to keep
 * "pending doses" materialized far enough ahead for Today to reflect them
 * (PRD §5 activation requirement) — a bounded window, never unbounded
 * generation, and never a row for a date/time pair that already exists.
 */
export function planMedicationAdministrationGeneration(
  input: PlanAdministrationGenerationInput,
): string[] {
  const rangeEnd = addDays(
    input.today,
    input.windowDays ?? MEDICATION_ADMINISTRATION_GENERATION_WINDOW_DAYS,
  );

  const occurrenceDates = generateMedicationOccurrences({
    schedule: input.schedule,
    daysOfWeek: input.daysOfWeek,
    rangeStart: input.today,
    rangeEnd,
  });

  const existing = new Set(input.existingScheduledFor);
  const planned: string[] = [];

  for (const date of occurrenceDates) {
    for (const time of input.timesOfDay) {
      const scheduledFor = `${date}T${time}`;
      if (!existing.has(scheduledFor)) planned.push(scheduledFor);
    }
  }

  return planned;
}
