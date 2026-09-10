export type MonthGroup<T> = {
  /** First day of the month, `YYYY-MM-01` — a representative date for locale-aware month/year formatting (`formatMonthYear`) at render time, not a stored value. */
  monthStart: string;
  items: T[];
};

/**
 * Buckets an already-sorted (most-recent-first) list into month groups —
 * one linear pass, no re-sort, no `Map` (same shape as
 * `groupTimelineEventsByMonth`, generalized so Medication/Injection full
 * history reuse it instead of a second hand-rolled grouping implementation).
 * Correct only because the input is already date-descending: a running
 * "current month" pointer is sufficient.
 */
export function groupByMonth<T>(items: readonly T[], getDate: (item: T) => string): MonthGroup<T>[] {
  const months: MonthGroup<T>[] = [];

  for (const item of items) {
    const monthStart = `${getDate(item).slice(0, 7)}-01`;

    let month = months[months.length - 1];
    if (!month || month.monthStart !== monthStart) {
      month = { monthStart, items: [] };
      months.push(month);
    }

    month.items.push(item);
  }

  return months;
}
