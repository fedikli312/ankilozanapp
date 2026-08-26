import { and, eq, gte, lt } from "drizzle-orm";

import { medicationAdministration } from "../db/schema";
import type { AppDatabase } from "./types";

export type CreatePendingAdministrationInput = {
  id: string;
  medicationId: string;
  medicationScheduleId: string | null;
  /** True timestamp (ISO 8601 UTC). Write-once (Tech Arch §F). */
  scheduledFor: string;
};

export function createPendingAdministrations(
  db: AppDatabase,
  entries: readonly CreatePendingAdministrationInput[],
): void {
  for (const entry of entries) {
    db.insert(medicationAdministration)
      .values({
        id: entry.id,
        medicationId: entry.medicationId,
        medicationScheduleId: entry.medicationScheduleId,
        scheduledFor: entry.scheduledFor,
      })
      .run();
  }
}

/**
 * The only way to change an administration after creation. Deliberately
 * narrow — it has no `scheduledFor` parameter, so it is structurally
 * impossible to rewrite history through this function (Tech Arch §F
 * invariant 1).
 */
export function markAdministration(
  db: AppDatabase,
  id: string,
  status: "taken" | "missed" | "skipped",
  actualTime: string | null = null,
): void {
  db.update(medicationAdministration)
    .set({ status, actualTime, updatedAt: new Date().toISOString() })
    .where(eq(medicationAdministration.id, id))
    .run();
}

export function getAdministrationsForMedication(db: AppDatabase, medicationId: string) {
  return db
    .select()
    .from(medicationAdministration)
    .where(eq(medicationAdministration.medicationId, medicationId))
    .all();
}

export function getAdministrationsInRange(
  db: AppDatabase,
  rangeStartInclusive: string,
  rangeEndExclusive: string,
) {
  return db
    .select()
    .from(medicationAdministration)
    .where(
      and(
        gte(medicationAdministration.scheduledFor, rangeStartInclusive),
        lt(medicationAdministration.scheduledFor, rangeEndExclusive),
      ),
    )
    .all();
}
