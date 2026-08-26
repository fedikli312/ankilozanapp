import { and, eq, isNull } from "drizzle-orm";

import { injectionSchedule } from "../db/schema";
import { applyScheduleVersioning } from "../domain/scheduling";
import type { AppDatabase } from "./types";

export type CreateInjectionScheduleInput = {
  id: string;
  injectionTreatmentId: string;
  intervalDays: number;
  reminderLeadDays?: number;
  reminderOnScheduledDay?: boolean;
  effectiveFrom: string;
};

export function createInitialInjectionSchedule(
  db: AppDatabase,
  input: CreateInjectionScheduleInput,
): void {
  db.insert(injectionSchedule).values(input).run();
}

/** Same versioning rule as medication schedules (Tech Arch §F). */
export function reviseInjectionSchedule(
  db: AppDatabase,
  currentScheduleId: string,
  effectiveDate: string,
  newSchedule: CreateInjectionScheduleInput,
): void {
  const { supersedeCurrentVersion, newVersionEffectiveFrom } =
    applyScheduleVersioning(effectiveDate);

  db.update(injectionSchedule)
    .set(supersedeCurrentVersion)
    .where(eq(injectionSchedule.id, currentScheduleId))
    .run();

  db.insert(injectionSchedule)
    .values({ ...newSchedule, effectiveFrom: newVersionEffectiveFrom })
    .run();
}

export function getCurrentInjectionSchedule(db: AppDatabase, injectionTreatmentId: string) {
  return db
    .select()
    .from(injectionSchedule)
    .where(
      and(
        eq(injectionSchedule.injectionTreatmentId, injectionTreatmentId),
        isNull(injectionSchedule.effectiveUntil),
      ),
    )
    .get();
}

export function getInjectionScheduleVersions(db: AppDatabase, injectionTreatmentId: string) {
  return db
    .select()
    .from(injectionSchedule)
    .where(eq(injectionSchedule.injectionTreatmentId, injectionTreatmentId))
    .all();
}
