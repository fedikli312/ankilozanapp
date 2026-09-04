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

/** Today's header subtitle, e.g. "28 Ağustos 2026, Cuma" — display only. */
export function formatHeadingDate(date: Date, locale: SupportedLocale): string {
  const dayMonthYear = new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const weekday = new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], { weekday: "long" }).format(date);
  return `${dayMonthYear}, ${weekday}`;
}

/** Short day+month, no year, e.g. "18 Ağustos" — Track/Insights landing row captions (Redesign Spec §8). */
export function formatShortDate(date: Date, locale: SupportedLocale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], { day: "numeric", month: "long" }).format(date);
}

/** Month + year, e.g. "Eylül 2026" — Timeline's month section heading (Phase X). No hardcoded month names; `Intl` resolves the locale-correct name and word order. */
export function formatMonthYear(date: Date, locale: SupportedLocale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], { month: "long", year: "numeric" }).format(date);
}

/** Compact day/month for the appointment date-block (Visual Design Spec §26's date pill), e.g. { day: "07", month: "EYL" }. */
export function formatDateBlock(date: Date, locale: SupportedLocale): { day: string; month: string } {
  const day = new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], { month: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
  return { day, month };
}
