import { readdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "../schema";
import { createTestDatabase } from "../testUtils/testDatabase";

const migrationsFolder = path.join(__dirname, "..", "migrations");

describe("initial schema migration", () => {
  it("creates every V1 table on a fresh database", () => {
    const { sqlite } = createTestDatabase();

    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => (row as { name: string }).name);

    expect(tables).toEqual(
      expect.arrayContaining([
        "appointment",
        "check_in_body_area",
        "daily_check_in",
        "injection_administration",
        "injection_schedule",
        "injection_treatment",
        "lab_reminder",
        "lab_result",
        "medication",
        "medication_administration",
        "medication_schedule",
        "medication_schedule_day",
        "medication_schedule_time",
        "onboarding_state",
        "scheduled_notification",
        "user_preferences",
      ]),
    );
  });

  it("is idempotent — re-running the migrator against an already-migrated database is a no-op", () => {
    const sqlite = new Database(":memory:");
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder });

    // Second run must not throw (e.g. "table already exists") and must not
    // duplicate rows in drizzle's own migration bookkeeping table.
    expect(() => migrate(db, { migrationsFolder })).not.toThrow();

    // Asserts the bookkeeping table has exactly one row per migration file
    // on disk (currently 2: the initial schema + the Phase 16 preferences
    // column), not a hardcoded count that would go stale with every future
    // migration — the re-run-is-a-no-op behavior is what this test protects.
    const migrationFileCount = readdirSync(migrationsFolder).filter((name) => name.endsWith(".sql")).length;

    const appliedCount = db.get<{ count: number }>(
      sql`select count(*) as count from __drizzle_migrations`,
    );
    expect(appliedCount?.count).toBe(migrationFileCount);
  });

  it("enforces the one-check-in-per-day unique constraint", () => {
    const { db } = createTestDatabase();

    db.insert(schema.dailyCheckIn)
      .values({
        id: "check-in-1",
        date: "2026-08-26",
        pain: 4,
        fatigue: 3,
        morningStiffnessBucket: "15_30",
      })
      .run();

    expect(() =>
      db
        .insert(schema.dailyCheckIn)
        .values({
          id: "check-in-2",
          date: "2026-08-26",
          pain: 6,
          fatigue: 5,
          morningStiffnessBucket: "30_60",
        })
        .run(),
    ).toThrow();
  });
});
