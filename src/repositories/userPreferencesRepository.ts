import { eq } from "drizzle-orm";

import { userPreferences } from "../db/schema";
import type { AppDatabase } from "./types";

const SINGLETON_ID = "default";

export type UserPreferencesPatch = {
  languageOverride?: "en" | "tr" | null;
  notificationDetailOptIn?: boolean;
  lastKnownTimezone?: string | null;
};

export function getUserPreferences(db: AppDatabase) {
  return db.select().from(userPreferences).where(eq(userPreferences.id, SINGLETON_ID)).get();
}

/** Singleton upsert (Tech Arch §D) — same pattern as `completeOnboarding`. */
export function updateUserPreferences(db: AppDatabase, patch: UserPreferencesPatch): void {
  const now = new Date().toISOString();

  db.insert(userPreferences)
    .values({ id: SINGLETON_ID, ...patch })
    .onConflictDoUpdate({
      target: userPreferences.id,
      set: { ...patch, updatedAt: now },
    })
    .run();
}
