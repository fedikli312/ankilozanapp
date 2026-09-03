import { isWithinRange } from "../dateUtils";
import type { BodyAreaRegion } from "../../repositories/checkInRepository";
import type { BodyAreaFrequency, HealthDateRange } from "./types";

export type BodyAreaRecordForFrequency = {
  date: string;
  region: BodyAreaRegion;
};

/**
 * Same shape/idiom as every `domain/insights` `compute*` function: takes
 * the full, unfiltered set of rows and self-filters by range, so it is
 * directly unit-testable with plain arrays and never needs a database.
 * Sorted by count descending, region name ascending as the tie-break (a
 * stable, deterministic order — never "whatever order SQLite happened to
 * return rows in").
 */
export function computeBodyAreaFrequency(
  entries: readonly BodyAreaRecordForFrequency[],
  range: HealthDateRange,
): BodyAreaFrequency[] {
  const counts = new Map<BodyAreaRegion, number>();
  for (const entry of entries) {
    if (!isWithinRange(entry.date, range.rangeStart, range.rangeEnd)) continue;
    counts.set(entry.region, (counts.get(entry.region) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region));
}
