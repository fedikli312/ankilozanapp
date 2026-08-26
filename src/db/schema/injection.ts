import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const injectionTreatment = sqliteTable("injection_treatment", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dose: text("dose").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  archivedAt: text("archived_at"),
});

/** Versioned — Tech Arch §F, same pattern as medicationSchedule. */
export const injectionSchedule = sqliteTable("injection_schedule", {
  id: text("id").primaryKey(),
  injectionTreatmentId: text("injection_treatment_id")
    .notNull()
    .references(() => injectionTreatment.id),
  intervalDays: integer("interval_days").notNull(),
  reminderLeadDays: integer("reminder_lead_days").notNull().default(1),
  reminderOnScheduledDay: integer("reminder_on_scheduled_day", { mode: "boolean" })
    .notNull()
    .default(true),
  effectiveFrom: text("effective_from").notNull(),
  effectiveUntil: text("effective_until"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

/**
 * Immutable historical record — Tech Arch §F. `scheduledFor` is write-once;
 * only `status`/`actualDate` are ever updated after insert.
 */
export const injectionAdministration = sqliteTable("injection_administration", {
  id: text("id").primaryKey(),
  injectionTreatmentId: text("injection_treatment_id")
    .notNull()
    .references(() => injectionTreatment.id),
  injectionScheduleId: text("injection_schedule_id").references(
    () => injectionSchedule.id,
  ),
  /** Date-only. Write-once. */
  scheduledFor: text("scheduled_for").notNull(),
  status: text("status", { enum: ["pending", "completed", "missed"] })
    .notNull()
    .default("pending"),
  actualDate: text("actual_date"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
