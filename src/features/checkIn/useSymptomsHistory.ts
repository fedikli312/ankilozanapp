import { db } from "../../db";
import { resolveInsightsRange } from "../../domain/insights";
import { getBodyAreasForCheckIn, getCheckInsInRange, type BodyAreaRegion } from "../../repositories";
import { todayDateOnly } from "../../shared/today";

export type SymptomHistoryRow = {
  id: string;
  date: string;
  pain: number;
  fatigue: number;
  morningStiffnessBucket: "none" | "under_15" | "15_30" | "30_60" | "over_60";
  bodyAreas: BodyAreaRegion[];
};

/**
 * Full chronological check-in history (UX spec §B "Symptoms history") —
 * most recent first. Phase O: each row now also carries its body areas
 * (Product 2.0 spec §18 — compact labels, not a body map per row) via the
 * same per-check-in join-table read Today already uses; no new repository
 * function, no schema change.
 */
export function useSymptomsHistory() {
  const today = todayDateOnly();
  const range = resolveInsightsRange("all", today);
  const checkIns = getCheckInsInRange(db, range.rangeStart, range.rangeEnd)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const rows: SymptomHistoryRow[] = checkIns.map((checkIn) => ({
    id: checkIn.id,
    date: checkIn.date,
    pain: checkIn.pain,
    fatigue: checkIn.fatigue,
    morningStiffnessBucket: checkIn.morningStiffnessBucket,
    bodyAreas: getBodyAreasForCheckIn(db, checkIn.id),
  }));

  return { checkIns: rows, today };
}
