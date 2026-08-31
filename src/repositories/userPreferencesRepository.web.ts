/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * userPreferencesRepository.ts's exported signatures exactly; native builds
 * never load this file (Metro `.web.ts` platform resolution).
 */
import { webPreviewStore } from "./web/store";

const SINGLETON_ID = "default";

export type UserPreferencesPatch = {
  languageOverride?: "en" | "tr" | null;
  notificationDetailOptIn?: boolean;
  lastKnownTimezone?: string | null;
};

export function getUserPreferences(_db: unknown) {
  return webPreviewStore.userPreferences.find((p) => p.id === SINGLETON_ID);
}

export function updateUserPreferences(_db: unknown, patch: UserPreferencesPatch): void {
  const now = new Date().toISOString();
  const existing = getUserPreferences(_db);
  if (existing) {
    if (patch.languageOverride !== undefined) existing.languageOverride = patch.languageOverride;
    if (patch.notificationDetailOptIn !== undefined)
      existing.notificationDetailOptIn = patch.notificationDetailOptIn;
    if (patch.lastKnownTimezone !== undefined) existing.lastKnownTimezone = patch.lastKnownTimezone;
    existing.updatedAt = now;
  } else {
    webPreviewStore.userPreferences.push({
      id: SINGLETON_ID,
      languageOverride: patch.languageOverride ?? null,
      notificationDetailOptIn: patch.notificationDetailOptIn ?? false,
      lastKnownTimezone: patch.lastKnownTimezone ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }
}
