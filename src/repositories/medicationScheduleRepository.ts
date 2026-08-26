import { and, eq, isNull } from "drizzle-orm";

import {
  medicationSchedule,
  medicationScheduleDay,
  medicationScheduleTime,
} from "../db/schema";
import { applyScheduleVersioning } from "../domain/scheduling";
import type { FrequencyType } from "../domain/scheduling/types";
import type { AppDatabase } from "./types";

export type CreateScheduleInput = {
  id: string;
  medicationId: string;
  frequencyType: FrequencyType;
  intervalDays?: number;
  reminderEnabled?: boolean;
  effectiveFrom: string;
  daysOfWeek?: number[];
  timesOfDay?: string[];
};

function insertScheduleRow(db: AppDatabase, input: CreateScheduleInput): void {
  db.insert(medicationSchedule)
    .values({
      id: input.id,
      medicationId: input.medicationId,
      frequencyType: input.frequencyType,
      intervalDays: input.intervalDays ?? null,
      reminderEnabled: input.reminderEnabled ?? true,
      effectiveFrom: input.effectiveFrom,
    })
    .run();

  for (const dayOfWeek of input.daysOfWeek ?? []) {
    db.insert(medicationScheduleDay)
      .values({ medicationScheduleId: input.id, dayOfWeek })
      .run();
  }

  for (const timeOfDay of input.timesOfDay ?? []) {
    db.insert(medicationScheduleTime)
      .values({ medicationScheduleId: input.id, timeOfDay })
      .run();
  }
}

/** First schedule for a newly-created medication — no prior version to supersede. */
export function createInitialSchedule(db: AppDatabase, input: CreateScheduleInput): void {
  insertScheduleRow(db, input);
}

/**
 * Edits a medication's schedule (Tech Arch §F invariant 2): supersedes the
 * currently-active version rather than mutating it, then inserts the new
 * version. Never touches `medication_administration` rows.
 */
export function reviseSchedule(
  db: AppDatabase,
  currentScheduleId: string,
  effectiveDate: string,
  newSchedule: CreateScheduleInput,
): void {
  const { supersedeCurrentVersion, newVersionEffectiveFrom } =
    applyScheduleVersioning(effectiveDate);

  db.update(medicationSchedule)
    .set(supersedeCurrentVersion)
    .where(eq(medicationSchedule.id, currentScheduleId))
    .run();

  insertScheduleRow(db, { ...newSchedule, effectiveFrom: newVersionEffectiveFrom });
}

export function getScheduleVersions(db: AppDatabase, medicationId: string) {
  return db
    .select()
    .from(medicationSchedule)
    .where(eq(medicationSchedule.medicationId, medicationId))
    .all();
}

export function getCurrentSchedule(db: AppDatabase, medicationId: string) {
  return db
    .select()
    .from(medicationSchedule)
    .where(
      and(eq(medicationSchedule.medicationId, medicationId), isNull(medicationSchedule.effectiveUntil)),
    )
    .get();
}

export function getScheduleDays(db: AppDatabase, medicationScheduleId: string) {
  return db
    .select()
    .from(medicationScheduleDay)
    .where(eq(medicationScheduleDay.medicationScheduleId, medicationScheduleId))
    .all();
}

export function getScheduleTimes(db: AppDatabase, medicationScheduleId: string) {
  return db
    .select()
    .from(medicationScheduleTime)
    .where(eq(medicationScheduleTime.medicationScheduleId, medicationScheduleId))
    .all();
}
