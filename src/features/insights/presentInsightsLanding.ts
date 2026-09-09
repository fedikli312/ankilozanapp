import type { InjectionHistory, LabHistory, MedicationAdherence, NumericTrend, StiffnessHistory } from "../../domain/insights";

export type Translate = (key: string, options?: Record<string, unknown>) => string;

/**
 * Design-G — pure presentation for the Insights landing row summaries,
 * extracted out of `app/(tabs)/insights.tsx` so it's directly unit-tested
 * (matching the established pure-presenter pattern used throughout the
 * app: `presentAppointmentSummary`, `presentTimelineEvent`,
 * `presentValueReveal`). No domain math happens here — every value below
 * is read straight off an already-computed domain trend/history object;
 * this module only selects, formats, and localizes.
 */

/** Strictly neutral factual presentation — never a directional/interpretive word ("up from"/"about the same as"). `trend.direction` is deliberately never read here (brief §7: no trend arrow implying improvement/worsening). */
export function presentNumericSummary(trend: NumericTrend, t: Translate): string {
  if (!trend.sufficientData) return t("insights.notEnoughData");
  const average = trend.average.toFixed(1);
  if (trend.previousPeriodAverage === null) return t("insights.averageOnly", { average });
  const previous = trend.previousPeriodAverage.toFixed(1);
  return t("insights.averageComparison", { average, previous });
}

export function presentStiffnessSummary(stiffness: StiffnessHistory, t: Translate): string {
  if (!stiffness.sufficientData || !stiffness.mostCommonBucket) return t("insights.notEnoughData");
  return t("insights.stiffnessSummary", {
    bucket: t(`checkIn.stiffness.${stiffness.mostCommonBucket}`),
    count: stiffness.bucketCounts[stiffness.mostCommonBucket],
    total: stiffness.dataPoints,
  });
}

/**
 * Brief §13: leads with the factual taken/missed count — the same
 * "Recorded doses" language Preparation/Appointment Summary settled on —
 * never the scheduled-dose percentage. `adherencePercentage` itself is
 * untouched in the domain layer and remains available; this function
 * simply never reads it.
 */
export function presentTreatmentRecordSummary(adherence: MedicationAdherence, t: Translate): string {
  if (adherence.takenCount + adherence.missedCount + adherence.skippedCount > 0) {
    return t("insights.adherenceCounts", { taken: adherence.takenCount, missed: adherence.missedCount });
  }
  return t("insights.notEnoughDataGeneric");
}

export function presentInjectionSummary(history: InjectionHistory, t: Translate): string {
  if (history.completedCount + history.missedCount === 0) return t("insights.notEnoughDataGeneric");
  return t("insights.injectionSummary", { completed: history.completedCount, missed: history.missedCount });
}

export function presentLabSummary(history: LabHistory, t: Translate): string {
  if (!history.mostRecent) return t("insights.notEnoughDataGeneric");
  return t("insights.labSummary", { value: history.mostRecent.value, date: history.mostRecent.recordedDate });
}
