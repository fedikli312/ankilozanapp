/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * medicationScheduleRepository.ts's exported signatures exactly; native
 * builds never load this file (Metro `.web.ts` platform resolution).
 */
import { applyScheduleVersioning } from "../domain/scheduling";
import type { FrequencyType } from "../domain/scheduling/types";
import { webPreviewStore } from "./web/store";

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

function insertScheduleRow(input: CreateScheduleInput): void {
  webPreviewStore.medicationSchedules.push({
    id: input.id,
    medicationId: input.medicationId,
    frequencyType: input.frequencyType,
    intervalDays: input.intervalDays ?? null,
    reminderEnabled: input.reminderEnabled ?? true,
    effectiveFrom: input.effectiveFrom,
    effectiveUntil: null,
    createdAt: new Date().toISOString(),
  });

  for (const dayOfWeek of input.daysOfWeek ?? []) {
    webPreviewStore.medicationScheduleDays.push({ medicationScheduleId: input.id, dayOfWeek });
  }
  for (const timeOfDay of input.timesOfDay ?? []) {
    webPreviewStore.medicationScheduleTimes.push({ medicationScheduleId: input.id, timeOfDay });
  }
}

export function createInitialSchedule(_db: unknown, input: CreateScheduleInput): void {
  insertScheduleRow(input);
}

export function reviseSchedule(
  _db: unknown,
  currentScheduleId: string,
  effectiveDate: string,
  newSchedule: CreateScheduleInput,
): void {
  const { supersedeCurrentVersion, newVersionEffectiveFrom } = applyScheduleVersioning(effectiveDate);

  const current = webPreviewStore.medicationSchedules.find((s) => s.id === currentScheduleId);
  if (current) Object.assign(current, supersedeCurrentVersion);

  insertScheduleRow({ ...newSchedule, effectiveFrom: newVersionEffectiveFrom });
}

export function getScheduleVersions(_db: unknown, medicationId: string) {
  return webPreviewStore.medicationSchedules.filter((s) => s.medicationId === medicationId);
}

export function getCurrentSchedule(_db: unknown, medicationId: string) {
  return webPreviewStore.medicationSchedules.find(
    (s) => s.medicationId === medicationId && s.effectiveUntil === null,
  );
}

export function getScheduleDays(_db: unknown, medicationScheduleId: string) {
  return webPreviewStore.medicationScheduleDays.filter(
    (d) => d.medicationScheduleId === medicationScheduleId,
  );
}

export function getScheduleTimes(_db: unknown, medicationScheduleId: string) {
  return webPreviewStore.medicationScheduleTimes.filter(
    (t) => t.medicationScheduleId === medicationScheduleId,
  );
}
