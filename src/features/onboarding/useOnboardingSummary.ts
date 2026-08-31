import { db } from "../../db";
import { getActiveInjectionTreatments, getActiveMedications, getAllUpcomingAppointments } from "../../repositories";
import { todayDateOnly } from "../../shared/today";

export type OnboardingSummary = {
  treatmentCount: number;
  upcomingAppointmentCount: number;
};

/**
 * Reads the Ready-summary screen's counts from the same repositories
 * Today itself queries — never fabricated, never a separate/onboarding-only
 * data source. Called once, on the Ready screen's mount; onboarding has no
 * long-lived focus-effect reconciliation the way Today does, since nothing
 * schedules new administrations during onboarding itself.
 */
export function useOnboardingSummary(): OnboardingSummary {
  const treatmentCount = getActiveMedications(db).length + getActiveInjectionTreatments(db).length;
  const upcomingAppointmentCount = getAllUpcomingAppointments(db, todayDateOnly()).length;

  return { treatmentCount, upcomingAppointmentCount };
}
