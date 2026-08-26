import path from "node:path";

import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "../schema";

export type TestDatabase = {
  db: BetterSQLite3Database<typeof schema>;
  sqlite: Database.Database;
};

/**
 * A real (not mocked) in-memory SQLite database for repository/migration
 * tests, per Implementation Plan §7 ("repository built and tested against a
 * real ... test SQLite instance"). `expo-sqlite` only runs on-device, so
 * tests run the exact same drizzle schema and generated SQL migrations
 * through `better-sqlite3` instead — a test-only substitute driver, never
 * imported by application code.
 */
export function createTestDatabase(): TestDatabase {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  migrate(db, {
    migrationsFolder: path.join(__dirname, "..", "migrations"),
  });

  return { db, sqlite };
}
