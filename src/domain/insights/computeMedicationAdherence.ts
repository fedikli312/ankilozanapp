import { INSIGHTS_THRESHOLDS } from "../constants";
import { isWithinRange } from "../dateUtils";
import type { DateRange } from "./types";

export type AdministrationForAdherence = {
  medicationId: string;
  /** True timestamp (ISO 8601); only the date-only prefix is range-matched. */
  scheduledFor: string;
  status: "pending" | "taken" | "missed" | "skipped";
};

export type MedicationAdherence = {
  takenCount: number;
  missedCount: number;
  skippedCount: number;
  adherencePercentage: number | null;
  sufficientData: boolean;
};

export function computeMedicationAdherence(
  administrations: readonly AdministrationForAdherence[],
  range: DateRange,
  medicationId?: string,
): MedicationAdherence {
  const scoped = administrations.filter(
    (a) =>
      (medicationId === undefined || a.medicationId === medicationId) &&
      isWithinRange(a.scheduledFor.slice(0, 10), range.rangeStart, range.rangeEnd) &&
      a.status !== "pending",
  );

  const takenCount = scoped.filter((a) => a.status === "taken").length;
  const missedCount = scoped.filter((a) => a.status === "missed").length;
  const skippedCount = scoped.filter((a) => a.status === "skipped").length;
  const passedCount = scoped.length;

  const sufficientData = passedCount >= INSIGHTS_THRESHOLDS.minScheduledDosesForAdherence;

  return {
    takenCount,
    missedCount,
    skippedCount,
    adherencePercentage: sufficientData ? (takenCount / passedCount) * 100 : null,
    sufficientData,
  };
}
