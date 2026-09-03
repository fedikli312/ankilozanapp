import {
  computeFatigueHistory,
  computePainHistory,
  computeStiffnessHistory,
  type AdministrationForAdherence,
  type CheckInForFatigue,
  type CheckInForPain,
  type LabResultForHistory,
} from "../insights";
import { buildAppointmentSummary } from "./buildAppointmentSummary";
import { buildLabSummary } from "./buildLabSummary";
import {
  buildTreatmentSummary,
  type InjectionAdministrationForTreatmentSummary,
  type InjectionTreatmentForTreatmentSummary,
  type MedicationForTreatmentSummary,
} from "./buildTreatmentSummary";
import { computeBodyAreaFrequency, type BodyAreaRecordForFrequency } from "./computeBodyAreaFrequency";
import { computeCheckInCoverage } from "./computeCheckInCoverage";
import { computeHighSymptomDays, type CheckInForHighSymptomDay } from "./computeHighSymptomDays";
import type { AppointmentRef, HealthDateRange, HealthKitContext, HealthSummary } from "./types";

/**
 * Every field a check-in row needs across the several `domain/insights`
 * functions plus the two new Phase W computations — the intersection type
 * this composer actually consumes. A caller with a real repository row
 * (which has more fields than this) satisfies it structurally without a
 * cast.
 */
export type CheckInForHealthSummary = CheckInForPain & CheckInForFatigue & CheckInForHighSymptomDay;

export type HealthSummarySources = {
  checkIns: readonly CheckInForHealthSummary[];
  bodyAreaRecords: readonly BodyAreaRecordForFrequency[];
  medications: readonly MedicationForTreatmentSummary[];
  medicationAdministrations: readonly AdministrationForAdherence[];
  injectionTreatments: readonly InjectionTreatmentForTreatmentSummary[];
  injectionAdministrations: readonly InjectionAdministrationForTreatmentSummary[];
  labResults: readonly LabResultForHistory[];
  /** Sorted most-recent-first — matches `getPastAppointments`'s own return order. */
  pastAppointmentsMostRecentFirst: readonly AppointmentRef[];
  /** Sorted soonest-first — matches `getAllUpcomingAppointments`'s own return order. */
  upcomingAppointmentsSoonestFirst: readonly AppointmentRef[];
  /** Absent until Phase AA — see `HealthKitContext`'s own doc comment. Never fabricated here. */
  healthKit?: HealthKitContext;
};

/**
 * The top-level, pure aggregation entry point (Phase W brief §1/§12/§14 —
 * "no LLM logic belongs in this phase," "prefer extending existing
 * domain/application patterns"). Takes already-fetched rows (never touches
 * a database itself — that boundary is `src/features/healthSummary/getHealthSummary.ts`,
 * the only place repository functions and this module meet) and a
 * resolved range, and returns one `HealthSummary` — the same object the
 * Doctor Report, the Timeline's symptom context, and (once built, not in
 * this phase) the AI layer all read from.
 */
export function buildHealthSummary(sources: HealthSummarySources, range: HealthDateRange): HealthSummary {
  return {
    range,
    symptoms: {
      coverage: computeCheckInCoverage(sources.checkIns, range),
      pain: computePainHistory(sources.checkIns, range),
      fatigue: computeFatigueHistory(sources.checkIns, range),
      stiffness: computeStiffnessHistory(sources.checkIns, range),
      bodyAreas: computeBodyAreaFrequency(sources.bodyAreaRecords, range),
    },
    highSymptomDays: computeHighSymptomDays(sources.checkIns, range),
    treatment: buildTreatmentSummary({
      medications: sources.medications,
      medicationAdministrations: sources.medicationAdministrations,
      injectionTreatments: sources.injectionTreatments,
      injectionAdministrations: sources.injectionAdministrations,
      range,
    }),
    labs: buildLabSummary(sources.labResults, range),
    appointments: buildAppointmentSummary({
      pastAppointmentsMostRecentFirst: sources.pastAppointmentsMostRecentFirst,
      upcomingAppointmentsSoonestFirst: sources.upcomingAppointmentsSoonestFirst,
    }),
    ...(sources.healthKit ? { healthKit: sources.healthKit } : {}),
  };
}
