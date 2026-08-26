import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * System bookkeeping, not a product-facing entity — Tech Arch §D.
 * `sourceId` is polymorphic by `sourceType`; enforced in the domain/
 * repository layer, not by a database foreign key.
 */
export const scheduledNotification = sqliteTable("scheduled_notification", {
  id: text("id").primaryKey(),
  sourceType: text("source_type", {
    enum: ["medication", "injection", "appointment", "lab_reminder"],
  }).notNull(),
  sourceId: text("source_id").notNull(),
  /** Identifier returned by expo-notifications, used to cancel. */
  notificationIdentifier: text("notification_identifier").notNull(),
  scheduledFor: text("scheduled_for").notNull(),
  isRepeating: integer("is_repeating", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
