import { and, eq } from "drizzle-orm";

import { scheduledNotification } from "../db/schema";
import type { AppDatabase } from "./types";

export type SourceType = "medication" | "injection" | "appointment" | "lab_reminder";

export type CreateScheduledNotificationInput = {
  id: string;
  sourceType: SourceType;
  sourceId: string;
  notificationIdentifier: string;
  scheduledFor: string;
  isRepeating?: boolean;
};

export function createScheduledNotification(
  db: AppDatabase,
  input: CreateScheduledNotificationInput,
): void {
  db.insert(scheduledNotification).values(input).run();
}

export function getScheduledNotificationsForSource(
  db: AppDatabase,
  sourceType: SourceType,
  sourceId: string,
) {
  return db
    .select()
    .from(scheduledNotification)
    .where(
      and(
        eq(scheduledNotification.sourceType, sourceType),
        eq(scheduledNotification.sourceId, sourceId),
      ),
    )
    .all();
}

export function deleteScheduledNotification(db: AppDatabase, id: string): void {
  db.delete(scheduledNotification).where(eq(scheduledNotification.id, id)).run();
}

/** Used when cancelling every pending reminder for an entity (edit/archive). */
export function deleteScheduledNotificationsForSource(
  db: AppDatabase,
  sourceType: SourceType,
  sourceId: string,
): void {
  db.delete(scheduledNotification)
    .where(
      and(
        eq(scheduledNotification.sourceType, sourceType),
        eq(scheduledNotification.sourceId, sourceId),
      ),
    )
    .run();
}

export function getAllScheduledNotifications(db: AppDatabase) {
  return db.select().from(scheduledNotification).all();
}
