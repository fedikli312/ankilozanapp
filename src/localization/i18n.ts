import { I18n } from "i18n-js";

import en from "./translations/en.json";
import tr from "./translations/tr.json";
import type { SupportedLocale } from "./resolveLocale";

const i18n = new I18n({ en, tr });
i18n.enableFallback = true;
i18n.defaultLocale = "en";

/**
 * Every user-facing string goes through this — no hardcoded English text
 * anywhere else in the app (Tech Arch §O). Locale is passed per call rather
 * than mutating global i18n-js state, so this stays safe to call from pure
 * functions and from multiple components rendering different locales
 * (e.g. previews) without cross-talk.
 */
export function translate(
  locale: SupportedLocale,
  key: string,
  options?: Record<string, unknown>,
): string {
  return i18n.t(key, { locale, ...options });
}
