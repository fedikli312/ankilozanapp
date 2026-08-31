/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * medicationRepository.ts's exported signatures exactly; native builds never
 * load this file (Metro `.web.ts` platform resolution).
 */
import { webPreviewStore } from "./web/store";

export type CreateMedicationInput = {
  id: string;
  name: string;
  dose: string;
  notes?: string;
};

export function createMedication(_db: unknown, input: CreateMedicationInput): void {
  const now = new Date().toISOString();
  webPreviewStore.medications.push({
    id: input.id,
    name: input.name,
    dose: input.dose,
    notes: input.notes ?? null,
    active: true,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  });
}

export function updateMedicationDetails(
  _db: unknown,
  id: string,
  patch: { name?: string; dose?: string; notes?: string | null },
): void {
  const row = webPreviewStore.medications.find((m) => m.id === id);
  if (!row) return;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.dose !== undefined) row.dose = patch.dose;
  if (patch.notes !== undefined) row.notes = patch.notes;
  row.updatedAt = new Date().toISOString();
}

export function archiveMedication(_db: unknown, id: string, archivedAt: string): void {
  const row = webPreviewStore.medications.find((m) => m.id === id);
  if (!row) return;
  row.active = false;
  row.archivedAt = archivedAt;
  row.updatedAt = new Date().toISOString();
}

export function getMedicationById(_db: unknown, id: string) {
  return webPreviewStore.medications.find((m) => m.id === id);
}

export function getActiveMedications(_db: unknown) {
  return webPreviewStore.medications.filter((m) => m.active);
}

export function getAllMedications(_db: unknown) {
  return webPreviewStore.medications.slice();
}
