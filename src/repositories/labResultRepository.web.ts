/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * labResultRepository.ts's exported signatures exactly; native builds never
 * load this file (Metro `.web.ts` platform resolution).
 */
import { webPreviewStore } from "./web/store";

export type CreateLabResultInput = {
  id: string;
  marker: "CRP" | "ESR";
  value: number;
  unit: string;
  recordedDate: string;
  institution?: string;
  notes?: string;
};

export function createLabResult(_db: unknown, input: CreateLabResultInput): void {
  const now = new Date().toISOString();
  webPreviewStore.labResults.push({
    id: input.id,
    marker: input.marker,
    value: input.value,
    unit: input.unit,
    recordedDate: input.recordedDate,
    institution: input.institution ?? null,
    notes: input.notes ?? null,
    createdAt: now,
    updatedAt: now,
  });
}

export type UpdateLabResultInput = {
  value?: number;
  unit?: string;
  recordedDate?: string;
  institution?: string | null;
  notes?: string | null;
};

export function updateLabResult(_db: unknown, id: string, patch: UpdateLabResultInput): void {
  const row = webPreviewStore.labResults.find((r) => r.id === id);
  if (!row) return;
  if (patch.value !== undefined) row.value = patch.value;
  if (patch.unit !== undefined) row.unit = patch.unit;
  if (patch.recordedDate !== undefined) row.recordedDate = patch.recordedDate;
  if (patch.institution !== undefined) row.institution = patch.institution;
  if (patch.notes !== undefined) row.notes = patch.notes;
  row.updatedAt = new Date().toISOString();
}

export function deleteLabResult(_db: unknown, id: string): void {
  webPreviewStore.labResults = webPreviewStore.labResults.filter((r) => r.id !== id);
}

export function getLabResultById(_db: unknown, id: string) {
  return webPreviewStore.labResults.find((r) => r.id === id);
}

export function getLabResultsByMarker(_db: unknown, marker: "CRP" | "ESR") {
  return webPreviewStore.labResults
    .filter((r) => r.marker === marker)
    .sort((a, b) => b.recordedDate.localeCompare(a.recordedDate));
}

export function getAllLabResults(_db: unknown) {
  return webPreviewStore.labResults.slice();
}
