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
  flaggedImportant: integer("flagged_important", { mode: "boolean" })
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
