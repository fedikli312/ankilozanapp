import type {
  AppointmentRef,
  HealthKitContext,
  HealthSummary,
  HighSymptomDayEntry,
  InjectionTrackingEntry,
  MedicationTrackingEntry,
} from "./types";

/**
 * Phase W brief §10 / `docs/PRODUCT_2_1_SPECIFICATION.md` §14, Amendment 1
 * — the whitelist boundary for the future AI layer, defined now so no
 * later phase has to decide "what's safe to send" under implementation
 * pressure. **This file contains no network code, no provider SDK, and no
 * server call of any kind** — it is a pure type + a pure stripping
 * function, the client-side half of the boundary. The actual enforcement
 * (Amendment 1's gateway-side schema/whitelist validation) is Phase AC's
 * job; this is that whitelist's concrete definition against today's real
 * `HealthSummary` shape.
 *
 * Excluded from `AiSafeHealthSummaryPayload`, by field, and why:
 * - `HighSymptomDayEntry.note` — free-text notes are excluded from every
 *   AI request in the first slice (spec §14's explicit default).
 * - `MedicationTrackingEntry.medicationId` / `InjectionTrackingEntry.treatmentId`
 *   — internal database IDs the AI's summarization job never needs (spec
 *   §10's "internal IDs unless necessary"); the human-readable name is kept.
 * - `AppointmentRef.id` and `AppointmentRef.doctorOrInstitution` —
 *   **explicit product decision (Phase W approval)**: doctor and
 *   institution/clinic names are excluded from the AI V1 whitelist. They
 *   are not necessary for the Weekly Summary or Appointment Copilot (the
 *   AI's job is noting *that* an appointment exists, not *with whom*) and
 *   must not leave the device in the first AI slice.
 * - `HealthKitContext` stays *typed* here but is never populated before
 *   Phase AA — intentionally provisional (its real shape awaits Phase AA's
 *   HealthKit API/device research) and never fabricated (§18's own rule).
 * - Onboarding personalization, RevenueCat/entitlement data, raw HealthKit
 *   samples — never part of `HealthSummary` in the first place, so there
 *   is nothing to strip; recorded here as a checklist confirmation, not a
 *   removed field.
 *
 * Kept as-is: every numeric/categorical trend, count, date, and marker
 * value — exactly the "structured, numeric/categorical" data spec §14
 * allows.
 */
export type AiSafeHighSymptomDayEntry = Omit<HighSymptomDayEntry, "note">;

export type AiSafeMedicationTrackingEntry = Omit<MedicationTrackingEntry, "medicationId">;
export type AiSafeInjectionTrackingEntry = Omit<InjectionTrackingEntry, "treatmentId">;

export type AiSafeAppointmentRef = Pick<AppointmentRef, "type" | "date" | "status">;

export type AiSafeHealthSummaryPayload = {
  range: HealthSummary["range"];
  symptoms: HealthSummary["symptoms"];
  highSymptomDays: {
    count: number;
    days: AiSafeHighSymptomDayEntry[];
  };
  treatment: {
    medications: AiSafeMedicationTrackingEntry[];
    injections: AiSafeInjectionTrackingEntry[];
  };
  labs: HealthSummary["labs"];
  appointments: {
    mostRecentPast: AiSafeAppointmentRef | null;
    nextUpcoming: AiSafeAppointmentRef | null;
  };
  healthKit?: HealthKitContext;
};

function toAiSafeAppointmentRef(ref: AppointmentRef | null): AiSafeAppointmentRef | null {
  if (!ref) return null;
  return { type: ref.type, date: ref.date, status: ref.status };
}

/** Pure, deterministic, no side effects — never called by anything in this phase; it exists so Phase AC's gateway integration has an already-reviewed shape to serialize, rather than inventing one under implementation pressure. */
export function buildAiSafeHealthSummaryPayload(summary: HealthSummary): AiSafeHealthSummaryPayload {
  return {
    range: summary.range,
    symptoms: summary.symptoms,
    highSymptomDays: {
      count: summary.highSymptomDays.count,
      days: summary.highSymptomDays.days.map(({ date, pain, fatigue, morningStiffnessBucket }) => ({
        date,
        pain,
        fatigue,
        morningStiffnessBucket,
      })),
    },
    treatment: {
      medications: summary.treatment.medications.map(({ medicationName, adherence }) => ({
        medicationName,
        adherence,
      })),
      injections: summary.treatment.injections.map(({ treatmentName, history }) => ({
        treatmentName,
        history,
      })),
    },
    labs: summary.labs,
    appointments: {
      mostRecentPast: toAiSafeAppointmentRef(summary.appointments.mostRecentPast),
      nextUpcoming: toAiSafeAppointmentRef(summary.appointments.nextUpcoming),
    },
    ...(summary.healthKit ? { healthKit: summary.healthKit } : {}),
  };
}
