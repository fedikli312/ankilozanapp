import { useMemo } from "react";
import { useLocales } from "expo-localization";

import { translate } from "./i18n";
import { resolveLocale, type SupportedLocale } from "./resolveLocale";

/**
 * `languageOverride` comes from `UserPreferences` (Tech Arch §O) — no
 * repository for that table exists yet in this batch (Profile, which owns
 * the language setting, is a later feature phase), so callers pass `null`
 * until then and the system locale decides.
 */
export function useTranslation(languageOverride: SupportedLocale | null = null) {
  const systemLocales = useLocales();

  const locale = useMemo(
    () => resolveLocale(systemLocales[0]?.languageCode ?? null, languageOverride),
    [systemLocales, languageOverride],
  );

  const t = useMemo(
    () => (key: string, options?: Record<string, unknown>) => translate(locale, key, options),
    [locale],
  );

  return { locale, t };
}
