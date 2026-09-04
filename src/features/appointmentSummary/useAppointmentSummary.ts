import { db } from "../../db";
import type { DoctorReportRangeDays } from "../../domain/healthSummary";
import { getAppointmentById, getAllLabResults } from "../../repositories";
import { todayDateOnly } from "../../shared/today";
import { getDoctorReportInput } from "../healthSummary/getDoctorReportInput";
import { getLatestLabUnitByMarker } from "./getLatestLabUnit";

/**
 * Product 2.1 Phase Z — the one place repository functions and the Phase W
 * `DoctorReportInput`/`getDoctorReportInput` meet the Appointment Summary
 * screen (same role `useTimeline.ts` plays for Phase X). Plain function,
 * not a stateful hook — this codebase's expo-sqlite access is synchronous
 * with no reactive query layer (re-read on render, same idiom every other
 * `use*` data-read function here follows).
 *
 * Deliberately reads the target appointment directly via `getAppointmentById`
 * rather than through `HealthSummary.appointments` (which is app-wide
 * "most recent past / next upcoming," not scoped to one appointment — see
 * that type's own doc comment) — the screen needs the specific appointment
 * it was opened for, the same repository call `useAppointmentDetail.ts`/
 * `useAppointmentPreparation.ts` already make.
 */
export function useAppointmentSummary(appointmentId: string, rangeDays: DoctorReportRangeDays) {
  const appointment = getAppointmentById(db, appointmentId);
  if (!appointment) return { appointment: null } as const;

  const today = todayDateOnly();
  const summary = getDoctorReportInput(db, rangeDays, today);
  const unitsByMarker = getLatestLabUnitByMarker(getAllLabResults(db), summary.range);

  return { appointment, summary, unitsByMarker } as const;
}
