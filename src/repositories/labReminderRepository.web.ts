/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * labReminderRepository.ts's exported signatures exactly; native builds
 * never load this file (Metro `.web.ts` platform resolution).
 */
import { webPreviewStore } from "./web/store";

export type CreateLabReminderInput = {
  id: string;
  label: string;
  marker?: "CRP" | "ESR";
  dueDate: string;
  reminderLeadDays?: number;
};

export function createLabReminder(_db: unknown, input: CreateLabReminderInput): void {
  const now = new Date().toISOString();
  webPreviewStore.labReminders.push({
    id: input.id,
    label: input.label,
    marker: input.marker ?? null,
    dueDate: input.dueDate,
    reminderLeadDays: input.reminderLeadDays ?? 0,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
}

export function markLabReminderStatus(
  _db: unknown,
  id: string,
  status: "completed" | "dismissed",
): void {
  const row = webPreviewStore.labReminders.find((r) => r.id === id);
  if (!row) return;
  row.status = status;
  row.updatedAt = new Date().toISOString();
}

export function getPendingLabReminders(_db: unknown) {
  return webPreviewStore.labReminders.filter((r) => r.status === "pending");
}
