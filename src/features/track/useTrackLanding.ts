import { db } from "../../db";
import {
  getActiveInjectionTreatments,
  getActiveMedications,
  getAdministrationsForTreatment,
  getAllLabResults,
  getCheckInsInRange,
} from "../../repositories";
import { addDays, diffInDays } from "../../domain/dateUtils";
import { todayDateOnly } from "../../shared/today";

/** Track landing (UX spec §A/§B, Redesign Spec §8): one-line most-recent-entry summary per section, computed here so the screen stays presentational. */
export function useTrackLanding() {
  const today = todayDateOnly();

  // Widest practical range for "most recent check-in ever", not just today's —
  // reuses the existing range query rather than adding a new repository function.
  const recentCheckIns = getCheckInsInRange(db, "2000-01-01", addDays(today, 1));
  const latestCheckInDate = recentCheckIns.length
    ? recentCheckIns.map((c) => c.date).sort().at(-1)!
    : null;

  const activeMedications = getActiveMedications(db);
  const activeInjections = getActiveInjectionTreatments(db);

  const nextInjectionRows = activeInjections
    .map((treatment) => getAdministrationsForTreatment(db, treatment.id).find((a) => a.status === "pending"))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  const nextInjectionDate = nextInjectionRows[0]?.scheduledFor ?? null;
  const nextInjectionDaysLeft = nextInjectionDate ? diffInDays(today, nextInjectionDate) : null;

  const allLabResults = getAllLabResults(db)
    .slice()
    .sort((a, b) => b.recordedDate.localeCompare(a.recordedDate));
  const latestLabResult = allLabResults[0] ?? null;

  return {
    latestCheckInDate,
    activeMedications,
    activeInjections,
    nextInjectionDate,
    nextInjectionDaysLeft,
    latestLabResult,
  };
}
