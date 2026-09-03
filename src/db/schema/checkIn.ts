import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dailyCheckIn = sqliteTable("daily_check_in", {
  id: text("id").primaryKey(),
  /** Date-only, YYYY-MM-DD, unique — one row per calendar date (Tech Arch §H). */
  date: text("date").notNull().unique(),
  pain: integer("pain").notNull(),
  fatigue: integer("fatigue").notNull(),
  morningStiffnessBucket: text("morning_stiffness_bucket", {
    enum: ["none", "under_15", "15_30", "30_60", "over_60"],
  }).notNull(),
  wellbeing: integer("wellbeing"),
  notes: text("notes"),
  /**
   * A distinct concept from `isHighSymptomDay` below — kept separate on
   * purpose (Product 2.1 Phase W, Amendment 2 investigation). Per
   * `docs/TECHNICAL_ARCHITECTURE.md` §"DailyCheckIn"/§J (step 7), this
   * column's documented, approved intent since Phase 3 has always been
   * "surface this check-in's note in Appointment Preparation" — a
   * note-curation flag, unrelated to symptom intensity. It has no approved
   * UX to set it in V1 (`useAppointmentPreparation.ts` deliberately does
   * not gate on it, for exactly that reason) and stays reserved for that
   * original purpose. It is NOT the High-Symptom Day marker — see
   * `isHighSymptomDay`.
   */
  flaggedImportant: integer("flagged_important", { mode: "boolean" })
    .notNull()
    .default(false),
  /**
   * Product 2.1 Phase W — the High-Symptom Day marker (Amendment 2's
   * resolved decision, `docs/PRODUCT_2_1_SPECIFICATION.md` §19). Set only
   * by explicit user action ("Symptoms feel more intense today" /
   * "Belirtilerim bugün daha yoğun") — never inferred from pain/fatigue/
   * stiffness scores by any part of the system. A new, explicit column
   * rather than a reuse of `flaggedImportant`: investigation confirmed that
   * column's documented meaning is a different, historically unrelated
   * concept (see its own comment above), so overloading it here would
   * conflate two concepts a future feature may independently need.
   */
  isHighSymptomDay: integer("is_high_symptom_day", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const checkInBodyArea = sqliteTable(
  "check_in_body_area",
  {
    checkInId: text("check_in_id")
      .notNull()
      .references(() => dailyCheckIn.id),
    region: text("region", {
      enum: [
        "neck",
        "upper_back",
        "lower_back",
        "hips",
        "shoulders",
        "chest_ribs",
        "other",
      ],
    }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.checkInId, table.region] })],
);
