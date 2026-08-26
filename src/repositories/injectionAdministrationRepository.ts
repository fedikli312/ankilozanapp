import { desc, eq } from "drizzle-orm";

import { injectionAdministration } from "../db/schema";
import type { AppDatabase } from "./types";

export type CreatePendingInjectionAdministrationInput = {
  id: string;
  injectionTreatmentId: string;
  injectionScheduleId: string | null;
  /** Date-only. Write-once (Tech Arch §F). */
  scheduledFor: string;
};

export function createPendingInjectionAdministration(
  db: AppDatabase,
  input: CreatePendingInjectionAdministrationInput,
): void {
  db.insert(injectionAdministration).values(input).run();
}

/**
 * The only way to change an administration after creation — no
 * `scheduledFor` parameter, so history cannot be rewritten through this
 * function (Tech Arch §F invariant 1).
 */
export function logInjectionAdministration(
  db: AppDatabase,
  id: string,
  status: "completed" | "missed",
  actualDate: string | null,
): void {
  db.update(injectionAdministration)
    .set({ status, actualDate, updatedAt: new Date().toISOString() })
    .where(eq(injectionAdministration.id, id))
    .run();
}

export function getAdministrationsForTreatment(db: AppDatabase, injectionTreatmentId: string) {
  return db
    .select()
    .from(injectionAdministration)
    .where(eq(injectionAdministration.injectionTreatmentId, injectionTreatmentId))
    .all();
}

/** Most recently scheduled administration — the anchor for next-date calculation (Tech Arch §F invariant 5). */
export function getLatestAdministration(db: AppDatabase, injectionTreatmentId: string) {
  return db
    .select()
    .from(injectionAdministration)
    .where(eq(injectionAdministration.injectionTreatmentId, injectionTreatmentId))
    .orderBy(desc(injectionAdministration.scheduledFor))
    .limit(1)
    .get();
}

/**
 * Moves a single not-yet-occurred due date (UX spec §G "Reschedule") — the
 * old pending row is deleted and a new one inserted with the updated date,
 * rather than updating `scheduledFor` in place, so the write-once rule
 * (Tech Arch §F invariant 1) is never bent even for a row that hasn't
 * become "history" yet. This is never treated as a missed dose and never
 * touches the recurring interval.
 */
export function rescheduleInjectionAdministration(
  db: AppDatabase,
  input: CreatePendingInjectionAdministrationInput,
  previousId: string,
): void {
  db.delete(injectionAdministration).where(eq(injectionAdministration.id, previousId)).run();
  db.insert(injectionAdministration).values(input).run();
}
