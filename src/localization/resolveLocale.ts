export const SUPPORTED_LOCALES = ["en", "tr"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: SupportedLocale = "en";

function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

/**
 * `UserPreferences.languageOverride` wins when set (Tech Arch §O). Otherwise
 * derives from the system's reported language code, falling back to English
 * for any language V1 doesn't ship a translation for. Pure so it's testable
 * without expo-localization's native module.
 */
export function resolveLocale(
  systemLanguageCode: string | null,
  override: SupportedLocale | null,
): SupportedLocale {
  if (override) return override;
  return isSupportedLocale(systemLanguageCode) ? systemLanguageCode : DEFAULT_LOCALE;
}
