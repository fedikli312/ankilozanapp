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
  /** Last device timezone reconciliation observed (IANA name) — Tech Arch §G "after detectable timezone changes". Null on first run, never treated as a change. */
  lastKnownTimezone: text("last_known_timezone"),
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
 *
 * Product 2.0 Phase N additions (2026-09-01, `docs/PRODUCT_2_0_UX_SPECIFICATION.md`
 * §8-9/§23-B): `goals`, `prioritySymptoms`, and `priorityBodyAreas` are
 * JSON-encoded string arrays, same encoding pattern as `whatToRemember`.
 * `treatmentContext` is nullable — skippable, matching the onboarding
 * screen's own optionality. `onboardingVersion` distinguishes a row
 * completed under the pre-Phase-N flow (defaults to 1 for every row that
 * existed before this migration) from one completed under the new
 * personalization flow (2) — required by Furkan's Phase M decision #4
 * ("Product 2.0 onboarding state MUST be versionable... do not delete real
 * health records because onboarding changes"). Purely additive: no existing
 * column removed, no existing row touched, `completed`-based navigation
 * gating (`app/(tabs)/index.tsx`) is unaffected by any of this.
 *
 * `whatToRemember` itself is superseded in meaning by `goals`/
 * `prioritySymptoms` as of onboardingVersion 2 — the column is kept
 * (never dropped, per Tech Arch §Q's additive-migration rule) but the new
 * completion path writes `"[]"` to it rather than reusing it for a
 * different taxonomy. Flagged explicitly in the Phase N report, not a
 * silent repurpose.
 */
export const onboardingState = sqliteTable("onboarding_state", {
  id: text("id").primaryKey(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  whatToRemember: text("what_to_remember").notNull().default("[]"),
  goals: text("goals").notNull().default("[]"),
  prioritySymptoms: text("priority_symptoms").notNull().default("[]"),
  priorityBodyAreas: text("priority_body_areas").notNull().default("[]"),
  treatmentContext: text("treatment_context", {
    enum: ["medication", "injection", "both", "none"],
  }),
  onboardingVersion: integer("onboarding_version").notNull().default(1),
  completedAt: text("completed_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
