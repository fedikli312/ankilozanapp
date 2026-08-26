import { eq } from "drizzle-orm";

import { labReminder } from "../db/schema";
import type { AppDatabase } from "./types";

export type CreateLabReminderInput = {
  id: string;
  label: string;
  marker?: "CRP" | "ESR";
  dueDate: string;
  reminderLeadDays?: number;
};

export function createLabReminder(db: AppDatabase, input: CreateLabReminderInput): void {
  db.insert(labReminder).values(input).run();
}

export function markLabReminderStatus(
  db: AppDatabase,
  id: string,
  status: "completed" | "dismissed",
): void {
  db.update(labReminder)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(labReminder.id, id))
    .run();
}

export function getPendingLabReminders(db: AppDatabase) {
  return db.select().from(labReminder).where(eq(labReminder.status, "pending")).all();
}
