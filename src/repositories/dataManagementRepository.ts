import {
  appointment,
  checkInBodyArea,
  dailyCheckIn,
  injectionAdministration,
  injectionSchedule,
  injectionTreatment,
  labReminder,
  labResult,
  medication,
  medicationAdministration,
  medicationSchedule,
  medicationScheduleDay,
  medicationScheduleTime,
  onboardingState,
  scheduledNotification,
  userPreferences,
} from "../db/schema";
import type { AppDatabase } from "./types";

/**
 * Profile → "Delete all local data" (UX spec §L). A full local reset, not a
 * per-table "health data only" wipe — there is no account/auth and no cloud
 * copy in V1, so once this runs there is nothing else identifying the user
 * left on the device; `onboardingState` and `userPreferences` are cleared
 * too so the app returns to a genuinely fresh first-launch state rather than
 * a half-configured one. Deletes children before parents even though V1
 * doesn't enforce FK constraints at the SQLite level, so this stays correct
 * if that ever changes. Callers are responsible for cancelling OS-scheduled
 * notifications first (this only clears the bookkeeping table).
 */
export function deleteAllLocalData(db: AppDatabase): void {
  db.delete(checkInBodyArea).run();
  db.delete(dailyCheckIn).run();

  db.delete(medicationAdministration).run();
  db.delete(medicationScheduleDay).run();
  db.delete(medicationScheduleTime).run();
  db.delete(medicationSchedule).run();
  db.delete(medication).run();

  db.delete(injectionAdministration).run();
  db.delete(injectionSchedule).run();
  db.delete(injectionTreatment).run();

  db.delete(appointment).run();

  db.delete(labResult).run();
  db.delete(labReminder).run();

  db.delete(scheduledNotification).run();

  db.delete(onboardingState).run();
  db.delete(userPreferences).run();
}
