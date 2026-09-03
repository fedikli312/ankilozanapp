import type { AppointmentRef, AppointmentSummary } from "./types";

/**
 * Deliberately not range-scoped (see `AppointmentSummary`'s own doc
 * comment) — takes the caller's already-sorted past/upcoming lists (the
 * repository layer's `getPastAppointments`/`getAllUpcomingAppointments`
 * already sort them, `appointmentRepository.ts`) and simply takes the
 * first of each. A pure one-liner kept as its own function so it is
 * independently testable and named, not inlined into `buildHealthSummary`.
 */
export function buildAppointmentSummary(params: {
  pastAppointmentsMostRecentFirst: readonly AppointmentRef[];
  upcomingAppointmentsSoonestFirst: readonly AppointmentRef[];
}): AppointmentSummary {
  return {
    mostRecentPast: params.pastAppointmentsMostRecentFirst[0] ?? null,
    nextUpcoming: params.upcomingAppointmentsSoonestFirst[0] ?? null,
  };
}
