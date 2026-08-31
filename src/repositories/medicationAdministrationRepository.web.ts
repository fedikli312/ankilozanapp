/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * medicationAdministrationRepository.ts's exported signatures exactly;
 * native builds never load this file (Metro `.web.ts` platform resolution).
 */
import { webPreviewStore } from "./web/store";

export type CreatePendingAdministrationInput = {
  id: string;
  medicationId: string;
  medicationScheduleId: string | null;
  scheduledFor: string;
};

export function createPendingAdministrations(
  _db: unknown,
  entries: readonly CreatePendingAdministrationInput[],
): void {
  const now = new Date().toISOString();
  for (const entry of entries) {
    webPreviewStore.medicationAdministrations.push({
      id: entry.id,
      medicationId: entry.medicationId,
      medicationScheduleId: entry.medicationScheduleId,
      scheduledFor: entry.scheduledFor,
      status: "pending",
      actualTime: null,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export function markAdministration(
  _db: unknown,
  id: string,
  status: "taken" | "missed" | "skipped",
  actualTime: string | null = null,
): void {
  const row = webPreviewStore.medicationAdministrations.find((a) => a.id === id);
  if (!row) return;
  row.status = status;
  row.actualTime = actualTime;
  row.updatedAt = new Date().toISOString();
}

export function deleteFutureUnrecordedAdministrations(
  _db: unknown,
  medicationScheduleId: string,
  fromDateInclusive: string,
): void {
  webPreviewStore.medicationAdministrations = webPreviewStore.medicationAdministrations.filter(
    (a) =>
      !(
        a.medicationScheduleId === medicationScheduleId &&
        a.status === "pending" &&
        a.scheduledFor >= fromDateInclusive
      ),
  );
}

export function getAdministrationsForMedication(_db: unknown, medicationId: string) {
  return webPreviewStore.medicationAdministrations.filter((a) => a.medicationId === medicationId);
}

export function getAdministrationsInRange(
  _db: unknown,
  rangeStartInclusive: string,
  rangeEndExclusive: string,
) {
  return webPreviewStore.medicationAdministrations.filter(
    (a) => a.scheduledFor >= rangeStartInclusive && a.scheduledFor < rangeEndExclusive,
  );
}
