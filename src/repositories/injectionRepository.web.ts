/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * injectionRepository.ts's exported signatures exactly; native builds never
 * load this file (Metro `.web.ts` platform resolution).
 */
import { webPreviewStore } from "./web/store";

export type CreateInjectionTreatmentInput = {
  id: string;
  name: string;
  dose: string;
};

export function createInjectionTreatment(_db: unknown, input: CreateInjectionTreatmentInput): void {
  const now = new Date().toISOString();
  webPreviewStore.injectionTreatments.push({
    id: input.id,
    name: input.name,
    dose: input.dose,
    active: true,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  });
}

export function archiveInjectionTreatment(_db: unknown, id: string, archivedAt: string): void {
  const row = webPreviewStore.injectionTreatments.find((t) => t.id === id);
  if (!row) return;
  row.active = false;
  row.archivedAt = archivedAt;
  row.updatedAt = new Date().toISOString();
}

export function getInjectionTreatmentById(_db: unknown, id: string) {
  return webPreviewStore.injectionTreatments.find((t) => t.id === id);
}

export function getActiveInjectionTreatments(_db: unknown) {
  return webPreviewStore.injectionTreatments.filter((t) => t.active);
}

export function getAllInjectionTreatments(_db: unknown) {
  return webPreviewStore.injectionTreatments.slice();
}
