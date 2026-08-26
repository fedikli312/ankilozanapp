import * as SQLite from "expo-sqlite";

import { DATABASE_NAME } from "./client";

/**
 * Dev-only convenience for fast iteration (Tech Arch §Q). Never present in
 * production builds — guarded by `__DEV__`, which Metro strips from release
 * bundles along with anything gated behind it.
 */
export async function resetLocalDatabaseDevOnly(): Promise<void> {
  if (!__DEV__) {
    throw new Error("resetLocalDatabaseDevOnly is not available outside development");
  }

  await SQLite.deleteDatabaseAsync(DATABASE_NAME);
}
