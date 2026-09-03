import {
  computeInjectionHistory,
  computeMedicationAdherence,
  type AdministrationForAdherence,
  type AdministrationForInjectionHistory,
} from "../insights";
import type { HealthDateRange, InjectionTrackingEntry, MedicationTrackingEntry, TreatmentSummary } from "./types";

export type MedicationForTreatmentSummary = { id: string; name: string };
export type InjectionTreatmentForTreatmentSummary = { id: string; name: string };

/**
 * `computeInjectionHistory` (unlike `computeMedicationAdherence`) has no
 * per-treatment filter parameter — its own administrations must already be
 * scoped to one treatment by the caller. Real `injection_administration`
 * rows do carry `injectionTreatmentId` (the schema's own foreign key); this
 * local type just makes that field visible to this function without
 * widening `AdministrationForInjectionHistory` itself, which every other
 * caller intentionally keeps narrow.
 */
export type InjectionAdministrationForTreatmentSummary = AdministrationForInjectionHistory & {
  injectionTreatmentId: string;
};

/**
 * Mirrors `useAppointmentPreparation.ts`'s existing per-medication/
 * per-treatment composition exactly (same `computeMedicationAdherence`/
 * `computeInjectionHistory` calls, same "filter out entries with zero
 * activity in range" rule) — Phase W brief §5: "only compute adherence/
 * missed doses if current data semantics genuinely support it," which is
 * the existing `sufficientData`/zero-activity behavior those functions
 * already have, not a new inference introduced here.
 */
export function buildTreatmentSummary(params: {
  medications: readonly MedicationForTreatmentSummary[];
  medicationAdministrations: readonly AdministrationForAdherence[];
  injectionTreatments: readonly InjectionTreatmentForTreatmentSummary[];
  injectionAdministrations: readonly InjectionAdministrationForTreatmentSummary[];
  range: HealthDateRange;
}): TreatmentSummary {
  const medications: MedicationTrackingEntry[] = params.medications
    .map((medication) => ({
      medicationId: medication.id,
      medicationName: medication.name,
      adherence: computeMedicationAdherence(params.medicationAdministrations, params.range, medication.id),
    }))
    .filter((entry) => entry.adherence.takenCount + entry.adherence.missedCount + entry.adherence.skippedCount > 0);

  const injections: InjectionTrackingEntry[] = params.injectionTreatments
    .map((treatment) => ({
      treatmentId: treatment.id,
      treatmentName: treatment.name,
      // computeInjectionHistory has no per-treatment filter parameter (unlike
      // medication adherence) — administrations must already be scoped to
      // this one treatment by the caller, same as useAppointmentPreparation.ts.
      history: computeInjectionHistory(
        params.injectionAdministrations.filter((a) => a.injectionTreatmentId === treatment.id),
        params.range,
      ),
    }))
    .filter((entry) => entry.history.completedCount + entry.history.missedCount > 0);

  return { medications, injections };
}
