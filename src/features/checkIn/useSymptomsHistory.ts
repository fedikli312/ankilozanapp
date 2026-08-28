import { db } from "../../db";
import { resolveInsightsRange } from "../../domain/insights";
import { getCheckInsInRange } from "../../repositories";
import { todayDateOnly } from "../../shared/today";

/** Full chronological check-in history (UX spec §B "Symptoms history") — most recent first. */
export function useSymptomsHistory() {
  const today = todayDateOnly();
  const range = resolveInsightsRange("all", today);
  const checkIns = getCheckInsInRange(db, range.rangeStart, range.rangeEnd)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return { checkIns, today };
}
