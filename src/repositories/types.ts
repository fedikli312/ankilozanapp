import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import type * as schema from "../db/schema";

/**
 * The database type every repository function accepts. Both the app
 * runtime (`drizzle-orm/expo-sqlite`) and the test database
 * (`drizzle-orm/better-sqlite3`, src/db/testUtils) are synchronous SQLite
 * drivers implementing this same base type, so repository code — and its
 * tests — share one implementation with no driver-specific branching.
 */
export type AppDatabase = BaseSQLiteDatabase<"sync", any, typeof schema>;
