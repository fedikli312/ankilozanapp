import { useMemo } from "react";
import { useLocales } from "expo-localization";

import { db } from "../db";
import { getUserPreferences } from "../repositories";
import { translate } from "./i18n";
import { resolveLocale, type SupportedLocale } from "./resolveLocale";

/**
 * `languageOverride` comes from `UserPreferences` (Tech Arch §O), owned by
 * Profile (Phase 16). Reads fresh from the repository on every render — the
 * same "no reactive query layer, re-read on render + refresh-after-mutation"
 * approach used throughout the app (Tech Arch §K) — so a language change in
 * Profile takes effect immediately everywhere without a separate context/
 * provider. An explicit `languageOverride` argument still wins when passed
 * (used by tests and any caller that wants to force a locale).
 */
export function useTranslation(languageOverride?: SupportedLocale | null) {
  const systemLocales = useLocales();
  // DatabaseProvider itself renders text through this hook (Tech Arch loading/
  // error copy) before its own migration run has necessarily finished, so
  // `user_preferences` may not exist yet on a brand-new install — this read
  // must degrade to "no override" rather than throw in that narrow window.
  let storedOverride: SupportedLocale | null = null;
  try {
    storedOverride = getUserPreferences(db)?.languageOverride ?? null;
  } catch {
    storedOverride = null;
  }
  const effectiveOverride = languageOverride !== undefined ? languageOverride : storedOverride;

  const locale = useMemo(
    () => resolveLocale(systemLocales[0]?.languageCode ?? null, effectiveOverride),
    [systemLocales, effectiveOverride],
  );

  const t = useMemo(
    () => (key: string, options?: Record<string, unknown>) => translate(locale, key, options),
    [locale],
  );

  return { locale, t };
}
