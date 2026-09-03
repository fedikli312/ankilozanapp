import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
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
 *
 * Phase S fix: "re-read on render" only helps if a render actually happens.
 * Changing the language on the Language screen then navigating back left
 * every already-mounted screen (Profile's own list included) showing stale
 * copy, because React Navigation reuses that screen instance rather than
 * remounting it. Fixed with the same `useFocusEffect` refresh-on-focus
 * idiom already used by `useTodayData`/`useMedications`/etc. for this exact
 * "repository changed elsewhere, this mounted screen needs to catch up"
 * shape of problem — not a new pattern, just applied here too.
 */
export function useTranslation(languageOverride?: SupportedLocale | null) {
  const systemLocales = useLocales();
  const [, setRefreshCount] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setRefreshCount((count) => count + 1);
    }, []),
  );
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
