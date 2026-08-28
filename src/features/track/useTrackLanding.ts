import { db } from "../../db";
import {
  getActiveInjectionTreatments,
  getActiveMedications,
  getAllLabResults,
  getCheckInByDate,
} from "../../repositories";
import { todayDateOnly } from "../../shared/today";

/** Track landing (UX spec §A/§B): one-line most-recent-entry summary per section, computed here so the screen stays presentational. */
export function useTrackLanding() {
  const today = todayDateOnly();

  const latestCheckIn = getCheckInByDate(db, today);
  const activeMedications = getActiveMedications(db);
  const activeInjections = getActiveInjectionTreatments(db);

  const allLabResults = getAllLabResults(db)
    .slice()
    .sort((a, b) => b.recordedDate.localeCompare(a.recordedDate));
  const latestLabResult = allLabResults[0] ?? null;

  return { latestCheckIn, activeMedications, activeInjections, latestLabResult };
}
