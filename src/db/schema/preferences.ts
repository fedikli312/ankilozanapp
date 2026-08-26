import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Singleton row (id fixed to "default") — Tech Arch §D.
 */
export const userPreferences = sqliteTable("user_preferences", {
  id: text("id").primaryKey(),
  languageOverride: text("language_override", { enum: ["en", "tr"] }),
  notificationDetailOptIn: integer("notification_detail_opt_in", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

/**
 * Singleton row (id fixed to "default") — Tech Arch §D.
 * `whatToRemember` is stored as a JSON-encoded string array.
 */
export const onboardingState = sqliteTable("onboarding_state", {
  id: text("id").primaryKey(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  whatToRemember: text("what_to_remember").notNull().default("[]"),
  completedAt: text("completed_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
