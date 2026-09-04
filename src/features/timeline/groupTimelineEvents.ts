import type { TimelineEvent } from "../../domain/timeline";

export type TimelineDayGroup = {
  /** `YYYY-MM-DD` — every event in `events` shares this date. */
  date: string;
  events: TimelineEvent[];
};

export type TimelineMonthGroup = {
  /** First day of the month, `YYYY-MM-01` — a representative date for locale-aware month/year formatting (`formatMonthYear`) at render time, not a stored value. */
  monthStart: string;
  days: TimelineDayGroup[];
};

/**
 * Buckets an already-sorted event list (`buildTimelineEvents`'s own
 * most-recent-first order, Phase W) into day groups, then month groups —
 * one linear pass, never a second sort (Phase X brief §4: "do not create a
 * second sort implementation," §16: "avoid N+1... keep transformations in
 * domain/features layer"). Correct only because the input is already
 * ordered date-descending: same-day and same-month events are guaranteed
 * adjacent, so a running "current day/month" pointer is sufficient — no
 * `Map`, no re-sort, no second pass.
 */
export function groupTimelineEventsByMonth(events: readonly TimelineEvent[]): TimelineMonthGroup[] {
  const months: TimelineMonthGroup[] = [];

  for (const event of events) {
    const monthStart = `${event.date.slice(0, 7)}-01`;

    let month = months[months.length - 1];
    if (!month || month.monthStart !== monthStart) {
      month = { monthStart, days: [] };
      months.push(month);
    }

    let day = month.days[month.days.length - 1];
    if (!day || day.date !== event.date) {
      day = { date: event.date, events: [] };
      month.days.push(day);
    }

    day.events.push(event);
  }

  return months;
}
