import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const medication = sqliteTable("medication", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dose: text("dose").notNull(),
  notes: text("notes"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  archivedAt: text("archived_at"),
});

/**
 * Versioned — Tech Arch §F. Never updated in place once superseded; a
 * schedule change sets `effectiveUntil` on this row and inserts a new one.
 */
export const medicationSchedule = sqliteTable("medication_schedule", {
  id: text("id").primaryKey(),
  medicationId: text("medication_id")
    .notNull()
    .references(() => medication.id),
  frequencyType: text("frequency_type", {
    enum: ["daily", "specific_days", "custom_interval"],
  }).notNull(),
  intervalDays: integer("interval_days"),
  reminderEnabled: integer("reminder_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  /** Date-only. */
  effectiveFrom: text("effective_from").notNull(),
  /** Date-only, nullable — set when superseded by a newer schedule version. */
  effectiveUntil: text("effective_until"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const medicationScheduleDay = sqliteTable(
  "medication_schedule_day",
  {
    medicationScheduleId: text("medication_schedule_id")
      .notNull()
      .references(() => medicationSchedule.id),
    /** 0-6, Sunday-Saturday. */
    dayOfWeek: integer("day_of_week").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.medicationScheduleId, table.dayOfWeek] }),
  ],
);

export const medicationScheduleTime = sqliteTable(
  "medication_schedule_time",
  {
    medicationScheduleId: text("medication_schedule_id")
      .notNull()
      .references(() => medicationSchedule.id),
    /** Local wall-clock time, HH:mm (Tech Arch §H). */
    timeOfDay: text("time_of_day").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.medicationScheduleId, table.timeOfDay] }),
  ],
);

/**
 * Immutable historical record — Tech Arch §F. `scheduledFor` is write-once;
 * only `status`/`actualTime` are ever updated after insert.
 */
export const medicationAdministration = sqliteTable("medication_administration", {
  id: text("id").primaryKey(),
  medicationId: text("medication_id")
    .notNull()
    .references(() => medication.id),
  /** Nullable — traceability only, never used to resolve historical schedule. */
  medicationScheduleId: text("medication_schedule_id").references(
    () => medicationSchedule.id,
  ),
  /**
   * Local wall-clock datetime, `YYYY-MM-DDTHH:mm` — a scheduling
   * *commitment* ("8am"), not a UTC instant (Tech Arch §H's wall-clock
   * reasoning applied here, refined during Phase 9 implementation).
   * Write-once (Tech Arch §F).
   */
  scheduledFor: text("scheduled_for").notNull(),
  status: text("status", {
    enum: ["pending", "taken", "missed", "skipped"],
  })
    .notNull()
    .default("pending"),
  actualTime: text("actual_time"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
