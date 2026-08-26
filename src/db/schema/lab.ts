import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const labResult = sqliteTable("lab_result", {
  id: text("id").primaryKey(),
  /** Extensible enum — adding a marker is a code change, not a schema change. */
  marker: text("marker", { enum: ["CRP", "ESR"] }).notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  /** Date-only. */
  recordedDate: text("recorded_date").notNull(),
  institution: text("institution"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

/** User-configured, not tied to a specific past result. */
export const labReminder = sqliteTable("lab_reminder", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  marker: text("marker", { enum: ["CRP", "ESR"] }),
  dueDate: text("due_date").notNull(),
  reminderLeadDays: integer("reminder_lead_days").notNull().default(0),
  status: text("status", {
    enum: ["pending", "completed", "dismissed"],
  })
    .notNull()
    .default("pending"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
