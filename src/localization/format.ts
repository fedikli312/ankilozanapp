import type { SupportedLocale } from "./resolveLocale";

const INTL_LOCALE_TAG: Record<SupportedLocale, string> = {
  en: "en-US",
  tr: "tr-TR",
};

/**
 * Locale-aware date formatting for *display only* — stored date values
 * stay the plain `YYYY-MM-DD`/ISO strings described in Tech Arch §H; this
 * never feeds back into storage.
 */
export function formatDate(date: Date, locale: SupportedLocale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatNumber(value: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(INTL_LOCALE_TAG[locale]).format(value);
}
