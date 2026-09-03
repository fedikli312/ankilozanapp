import { computeLabHistory, type LabResultForHistory } from "../insights";
import type { HealthDateRange, LabSummary } from "./types";

/**
 * `results` is every lab result across every marker (unfiltered) — this
 * function derives the distinct markers actually present and runs
 * `computeLabHistory` once per marker, so a user with only CRP results
 * gets a `markers` array containing only CRP, never a fabricated ESR entry
 * with nulls (Phase W brief §8's "no manufactured zero/empty data" rule).
 */
export function buildLabSummary(results: readonly LabResultForHistory[], range: HealthDateRange): LabSummary {
  const markersPresent = Array.from(new Set(results.map((r) => r.marker))).sort();
  const markers = markersPresent
    .map((marker) => ({ marker, history: computeLabHistory(results, marker, range) }))
    .filter((entry) => entry.history.values.length > 0);

  return { markers };
}
