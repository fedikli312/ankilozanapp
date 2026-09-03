import { addDays, diffInDays } from "../../domain/dateUtils";
import {
  buildHealthSummary,
  resolveHealthDateRange,
  type HealthDateRange,
  type HealthKitContext,
  type HealthSummary,
  type HealthSummarySources,
} from "../../domain/healthSummary";
import type { AppDatabase } from "../../repositories";
import {
  getAllCheckInBodyAreasWithDates,
  getAllInjectionTreatments,
  getAllMedications,
  getAllLabResults,
  getAllUpcomingAppointments,
  getAdministrationsForMedication,
  getAdministrationsForTreatment,
  getCheckInsInRange,
  getPastAppointments,
} from "../../repositories";

/**
 * The one place repository functions and the pure `domain/healthSummary`
 * layer meet (Tech Arch's own "UI → feature → domain → repositories"
 * layering — domain stays free of any repository/DB import, this file is
 * the feature-layer glue, same role `useAppointmentPreparation.ts` and
 * `useInsightsLanding.ts` already play for their own screens). No React
 * here — Phase W builds no UI, so this is a plain function, not a hook;
 * a future Phase X/Z hook wraps this rather than duplicating it.
 */
export function getHealthSummary(db: AppDatabase, range: HealthDateRange, today: string): HealthSummary {
  // Widened exactly like `useInsightsLanding.ts` — `computePainHistory`/
  // `computeFatigueHistory`'s own previous-period comparison needs real
  // rows from the period *before* `range.rangeStart`, or it silently
  // reports `direction: null` for a comparison that should have been
  // possible. Doubling the range backward is a range of `daysInRange`
  // additional days, mirroring the same "fetch beyond what you're scoping
  // to" reasoning `useInsightsLanding.ts` already established.
  const daysInRange = diffInDays(range.rangeStart, range.rangeEnd);
  const widenedCheckIns = getCheckInsInRange(db, addDays(range.rangeStart, -daysInRange), range.rangeEnd);

  const medications = getAllMedications(db);
  const medicationAdministrations = medications.flatMap((m) => getAdministrationsForMedication(db, m.id));

  const injectionTreatments = getAllInjectionTreatments(db);
  const injectionAdministrations = injectionTreatments.flatMap((t) => getAdministrationsForTreatment(db, t.id));

  const sources: HealthSummarySources = {
    checkIns: widenedCheckIns,
    bodyAreaRecords: getAllCheckInBodyAreasWithDates(db),
    medications,
    medicationAdministrations,
    injectionTreatments,
    injectionAdministrations,
    labResults: getAllLabResults(db),
    pastAppointmentsMostRecentFirst: getPastAppointments(db, today),
    upcomingAppointmentsSoonestFirst: getAllUpcomingAppointments(db, today),
  };

  return buildHealthSummary(sources, range);
}

export type { HealthKitContext };

/** Convenience wrapper over `getHealthSummary` + `resolveHealthDateRange` for the common "last N days from today" call shape. */
export function getHealthSummaryForLastDays(db: AppDatabase, days: number, today: string): HealthSummary {
  return getHealthSummary(db, resolveHealthDateRange(days, today), today);
}
