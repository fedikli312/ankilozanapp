/**
 * Date-only (`YYYY-MM-DD`) arithmetic helpers, timezone-agnostic by
 * construction (Tech Arch §H) — every value is parsed/formatted against UTC
 * so calendar-date math never shifts a day depending on the host timezone.
 */

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function assertDateOnly(value: string): void {
  if (!DATE_ONLY_PATTERN.test(value)) {
    throw new Error(`Expected a YYYY-MM-DD date-only string, received "${value}"`);
  }
}

export function parseDateOnly(value: string): Date {
  assertDateOnly(value);
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(value: string, days: number): string {
  const date = parseDateOnly(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateOnly(date);
}

/** Whole-day difference, `b - a`, positive when `b` is later than `a`. */
export function diffInDays(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((parseDateOnly(b).getTime() - parseDateOnly(a).getTime()) / msPerDay);
}

/** 0 (Sunday) - 6 (Saturday), matching `MedicationScheduleDay.dayOfWeek`. */
export function dayOfWeek(value: string): number {
  return parseDateOnly(value).getUTCDay();
}

export function isBefore(a: string, b: string): boolean {
  return parseDateOnly(a).getTime() < parseDateOnly(b).getTime();
}

export function isWithinRange(value: string, startInclusive: string, endExclusive: string): boolean {
  const time = parseDateOnly(value).getTime();
  return time >= parseDateOnly(startInclusive).getTime() && time < parseDateOnly(endExclusive).getTime();
}
