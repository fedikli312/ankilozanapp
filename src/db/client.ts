import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

import * as schema from "./schema";

/** The on-device database file — the single V1 source of truth (Tech Arch §A). */
export const DATABASE_NAME = "ankilozanapp.db";

export const sqliteConnection = SQLite.openDatabaseSync(DATABASE_NAME);

export const db = drizzle(sqliteConnection, { schema });

export type Database = typeof db;
