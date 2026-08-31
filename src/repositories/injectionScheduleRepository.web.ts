/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * injectionScheduleRepository.ts's exported signatures exactly; native
 * builds never load this file (Metro `.web.ts` platform resolution).
 */
import { applyScheduleVersioning } from "../domain/scheduling";
import { webPreviewStore } from "./web/store";

export type CreateInjectionScheduleInput = {
  id: string;
  injectionTreatmentId: string;
  intervalDays: number;
  reminderLeadDays?: number;
  reminderOnScheduledDay?: boolean;
  effectiveFrom: string;
};

export function createInitialInjectionSchedule(_db: unknown, input: CreateInjectionScheduleInput): void {
  webPreviewStore.injectionSchedules.push({
    id: input.id,
    injectionTreatmentId: input.injectionTreatmentId,
    intervalDays: input.intervalDays,
    reminderLeadDays: input.reminderLeadDays ?? 1,
    reminderOnScheduledDay: input.reminderOnScheduledDay ?? true,
    effectiveFrom: input.effectiveFrom,
    effectiveUntil: null,
    createdAt: new Date().toISOString(),
  });
}

export function reviseInjectionSchedule(
  _db: unknown,
  currentScheduleId: string,
  effectiveDate: string,
  newSchedule: CreateInjectionScheduleInput,
): void {
  const { supersedeCurrentVersion, newVersionEffectiveFrom } = applyScheduleVersioning(effectiveDate);

  const current = webPreviewStore.injectionSchedules.find((s) => s.id === currentScheduleId);
  if (current) Object.assign(current, supersedeCurrentVersion);

  webPreviewStore.injectionSchedules.push({
    id: newSchedule.id,
    injectionTreatmentId: newSchedule.injectionTreatmentId,
    intervalDays: newSchedule.intervalDays,
    reminderLeadDays: newSchedule.reminderLeadDays ?? 1,
    reminderOnScheduledDay: newSchedule.reminderOnScheduledDay ?? true,
    effectiveFrom: newVersionEffectiveFrom,
    effectiveUntil: null,
    createdAt: new Date().toISOString(),
  });
}

export function getCurrentInjectionSchedule(_db: unknown, injectionTreatmentId: string) {
  return webPreviewStore.injectionSchedules.find(
    (s) => s.injectionTreatmentId === injectionTreatmentId && s.effectiveUntil === null,
  );
}

export function getInjectionScheduleVersions(_db: unknown, injectionTreatmentId: string) {
  return webPreviewStore.injectionSchedules.filter(
    (s) => s.injectionTreatmentId === injectionTreatmentId,
  );
}
