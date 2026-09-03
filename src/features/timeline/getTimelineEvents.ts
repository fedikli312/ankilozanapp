import { addDays } from "../../domain/dateUtils";
import { buildTimelineEvents, type TimelineEvent, type TimelineEventSources } from "../../domain/timeline";
import type { HealthDateRange } from "../../domain/healthSummary";
import type { AppDatabase, BodyAreaRegion } from "../../repositories";
import {
  getAdministrationsForMedication,
  getAdministrationsForTreatment,
  getAllAppointments,
  getAllCheckInBodyAreasWithDates,
  getAllInjectionTreatments,
  getAllLabResults,
  getAllMedications,
  getCheckInsInRange,
} from "../../repositories";

/** Matches `resolveInsightsRange`'s own "beginning of time" anchor — the shared convention this codebase already uses for an unbounded date-only range rather than a sentinel `null`. */
const FULL_HISTORY_START = "2000-01-01";

/**
 * The one place repository functions and the pure `domain/timeline` layer
 * meet — same role as `getHealthSummary.ts`. No React, no UI (Phase W
 * brief §14); a future Phase X hook wraps this.
 */
export function getTimelineEvents(db: AppDatabase, today: string, range?: HealthDateRange): TimelineEvent[] {
  // Check-ins are never future-dated in real use, so — unlike appointments,
  // fetched unfiltered below and range-scoped inside `buildTimelineEvents`
  // itself — a plain "beginning of time through today" window is already
  // the full history when no range is given; no widening needed here (no
  // "previous period" comparison exists for a flat event list, unlike
  // `getHealthSummary.ts`'s trend math).
  const fetchStart = range?.rangeStart ?? FULL_HISTORY_START;
  const fetchEnd = range?.rangeEnd ?? addDays(today, 1);

  const checkIns = getCheckInsInRange(db, fetchStart, fetchEnd);

  const bodyAreasByCheckInDate: Record<string, BodyAreaRegion[]> = {};
  for (const row of getAllCheckInBodyAreasWithDates(db)) {
    (bodyAreasByCheckInDate[row.date] ??= []).push(row.region);
  }

  const medications = getAllMedications(db);
  const medicationNameById = new Map(medications.map((m) => [m.id, m.name]));
  const medicationAdministrations = medications
    .flatMap((m) => getAdministrationsForMedication(db, m.id))
    .map((a) => ({ ...a, medicationName: medicationNameById.get(a.medicationId) ?? a.medicationId }));

  const injectionTreatments = getAllInjectionTreatments(db);
  const treatmentNameById = new Map(injectionTreatments.map((t) => [t.id, t.name]));
  const injectionAdministrations = injectionTreatments
    .flatMap((t) => getAdministrationsForTreatment(db, t.id))
    .map((a) => ({ ...a, treatmentName: treatmentNameById.get(a.injectionTreatmentId) ?? a.injectionTreatmentId }));

  const sources: TimelineEventSources = {
    checkIns,
    bodyAreasByCheckInDate,
    medicationAdministrations,
    injectionAdministrations,
    labResults: getAllLabResults(db),
    appointments: getAllAppointments(db),
  };

  return buildTimelineEvents(sources, range);
}
