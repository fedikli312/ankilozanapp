/**
 * Dev-web-preview-only stand-in — see src/repositories/web/store.ts for why.
 * `db`/`sqliteConnection` are never actually queried on web: every
 * repository function has a `.web.ts` twin that operates on the in-memory
 * preview store instead and ignores its `db` argument entirely. These
 * exports exist only so call sites that import `db`/`DATABASE_NAME` from
 * `@/db` (to pass through to repository calls) keep working unchanged.
 * Native iOS/Android builds never load this file (Metro `.web.ts` platform
 * resolution) — client.ts's real expo-sqlite connection is untouched.
 */
import type { Database } from "./client";

export const DATABASE_NAME = "web-preview (in-memory, not persisted)";

export const sqliteConnection = null as unknown as Database;

export const db = null as unknown as Database;
