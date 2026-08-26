import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const appointment = sqliteTable("appointment", {
  id: text("id").primaryKey(),
  type: text("type", {
    enum: ["rheumatology", "laboratory", "imaging", "other"],
  }).notNull(),
  doctorOrInstitution: text("doctor_or_institution"),
  /** Date-only. */
  date: text("date").notNull(),
  /** Local wall-clock, HH:mm, nullable. */
  time: text("time"),
  notes: text("notes"),
  reminderLeadDays: integer("reminder_lead_days").notNull().default(1),
  status: text("status", {
    enum: ["scheduled", "completed", "cancelled"],
  })
    .notNull()
    .default("scheduled"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
