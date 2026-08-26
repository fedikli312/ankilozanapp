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
