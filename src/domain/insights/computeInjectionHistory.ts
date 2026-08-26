import { INSIGHTS_THRESHOLDS } from "../constants";
import { isWithinRange } from "../dateUtils";
import type { DateRange } from "./types";

export type AdministrationForInjectionHistory = {
  scheduledFor: string;
  actualDate: string | null;
  status: "pending" | "completed" | "missed";
};

export type InjectionHistory = {
  entries: AdministrationForInjectionHistory[];
  completedCount: number;
  missedCount: number;
  sufficientData: boolean;
};

export function computeInjectionHistory(
  administrations: readonly AdministrationForInjectionHistory[],
  range: DateRange,
): InjectionHistory {
  const inRange = administrations
    .filter((a) => isWithinRange(a.scheduledFor, range.rangeStart, range.rangeEnd))
    .slice()
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

  const completedCount = inRange.filter((a) => a.status === "completed").length;
  const missedCount = inRange.filter((a) => a.status === "missed").length;

  return {
    entries: inRange,
    completedCount,
    missedCount,
    sufficientData: completedCount >= INSIGHTS_THRESHOLDS.minCompletedInjectionsForHistory,
  };
}
