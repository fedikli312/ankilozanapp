import { db } from "../../db";
import { HEALTH_SUMMARY_RANGE_DAYS, resolveHealthDateRange } from "../../domain/healthSummary";
import { getTimelineEvents } from "./getTimelineEvents";
import { groupTimelineEventsByMonth } from "./groupTimelineEvents";
import { todayDateOnly } from "../../shared/today";

/**
 * Phase X V1 range: the most recent 90 days, reusing Phase W's own
 * `HEALTH_SUMMARY_RANGE_DAYS.last90` constant rather than a new magic
 * number. Chosen, not defaulted, for two reasons: (1) it's this app's
 * largest already-established "recent history" window (the same one
 * Doctor Report's longer preset and Appointment Preparation's fallback
 * lookback both already use), long enough that a typical user sees several
 * weeks of real activity without an empty-feeling screen; (2) unlike
 * Appointment Preparation or Insights, Timeline has no natural upper bound
 * from an appointment date to anchor a lookback to — an explicit day count
 * is the only option, and 90 keeps the per-render row count (check-ins +
 * every medication/injection administration + labs + appointments, all
 * merged) comfortably small without pagination in this V1. A full-history,
 * paginated Timeline is real future scope, not built here (brief §15) —
 * `getTimelineEvents`'s own `range?` parameter is already optional
 * precisely so a future paginated caller can omit it or page through
 * smaller windows without any change to this function's contract.
 */
const TIMELINE_RANGE_DAYS = HEALTH_SUMMARY_RANGE_DAYS.last90;

export function useTimeline() {
  const today = todayDateOnly();
  const range = resolveHealthDateRange(TIMELINE_RANGE_DAYS, today);
  const events = getTimelineEvents(db, today, range);
  const months = groupTimelineEventsByMonth(events);

  return { months, today, isEmpty: events.length === 0 };
}
