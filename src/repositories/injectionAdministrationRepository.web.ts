/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * injectionAdministrationRepository.ts's exported signatures exactly;
 * native builds never load this file (Metro `.web.ts` platform resolution).
 */
import { webPreviewStore } from "./web/store";

export type CreatePendingInjectionAdministrationInput = {
  id: string;
  injectionTreatmentId: string;
  injectionScheduleId: string | null;
  scheduledFor: string;
};

export function createPendingInjectionAdministration(
  _db: unknown,
  input: CreatePendingInjectionAdministrationInput,
): void {
  const now = new Date().toISOString();
  webPreviewStore.injectionAdministrations.push({
    id: input.id,
    injectionTreatmentId: input.injectionTreatmentId,
    injectionScheduleId: input.injectionScheduleId,
    scheduledFor: input.scheduledFor,
    status: "pending",
    actualDate: null,
    createdAt: now,
    updatedAt: now,
  });
}

export function logInjectionAdministration(
  _db: unknown,
  id: string,
  status: "completed" | "missed",
  actualDate: string | null,
): void {
  const row = webPreviewStore.injectionAdministrations.find((a) => a.id === id);
  if (!row) return;
  row.status = status;
  row.actualDate = actualDate;
  row.updatedAt = new Date().toISOString();
}

export function getAdministrationsForTreatment(_db: unknown, injectionTreatmentId: string) {
  return webPreviewStore.injectionAdministrations.filter(
    (a) => a.injectionTreatmentId === injectionTreatmentId,
  );
}

export function getLatestAdministration(_db: unknown, injectionTreatmentId: string) {
  return webPreviewStore.injectionAdministrations
    .filter((a) => a.injectionTreatmentId === injectionTreatmentId)
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor))[0];
}

export function rescheduleInjectionAdministration(
  _db: unknown,
  input: CreatePendingInjectionAdministrationInput,
  previousId: string,
): void {
  webPreviewStore.injectionAdministrations = webPreviewStore.injectionAdministrations.filter(
    (a) => a.id !== previousId,
  );
  createPendingInjectionAdministration(_db, input);
}
