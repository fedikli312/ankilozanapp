import { isWithinRange } from "../../domain/dateUtils";
import type { HealthDateRange } from "../../domain/healthSummary";

export type LabResultForUnit = { marker: string; unit: string; recordedDate: string };

/**
 * Product 2.1 Phase Z — a narrow feature-layer gap-filler, not a domain
 * change. `domain/insights`'s `LabHistory`/`LabResultForHistory` (Phase W)
 * deliberately carries only `marker`/`value`/`recordedDate` — `unit` was
 * never part of that aggregation's contract. Brief §11 wants "raw recorded
 * value + unit + date," and `lab_result.unit` is a genuine per-row,
 * user-entered field (`src/db/schema/lab.ts`), not a fixed constant per
 * marker — so this reads it directly from the same raw rows
 * `useAppointmentSummary` already fetches, using the identical
 * most-recent-in-range tie-break `computeLabHistory` uses internally
 * (latest `recordedDate` wins), rather than fabricating or assuming a
 * default unit. This does not recompute anything `LabHistory` already
 * computes (no min/max/mostRecent/sufficientData logic here) — it only
 * answers the one question that source doesn't carry.
 */
export function getLatestLabUnitByMarker(
  results: readonly LabResultForUnit[],
  range: HealthDateRange,
): Record<string, string> {
  const latestByMarker = new Map<string, LabResultForUnit>();

  for (const result of results) {
    if (!isWithinRange(result.recordedDate, range.rangeStart, range.rangeEnd)) continue;
    const existing = latestByMarker.get(result.marker);
    if (!existing || result.recordedDate >= existing.recordedDate) {
      latestByMarker.set(result.marker, result);
    }
  }

  return Object.fromEntries(Array.from(latestByMarker, ([marker, result]) => [marker, result.unit]));
}
