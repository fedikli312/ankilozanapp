import { buildHealthSummary, type HealthSummarySources } from "./buildHealthSummary";
import { HEALTH_SUMMARY_RANGE_DAYS, resolveHealthDateRange } from "./resolveHealthDateRange";
import type { HealthSummary } from "./types";

/**
 * Phase W brief §9 — the deterministic structured input Phase Z's Doctor
 * Report UI will consume, and (per `docs/PRODUCT_2_1_SPECIFICATION.md`
 * §12) the exact same object the future AI layer narrates. Deliberately a
 * type alias, not a parallel shape: "the report contract must work without
 * AI" and "there is no separate AI data shape" are the same requirement
 * from two different angles, satisfied by not having a second type at all.
 */
export type DoctorReportInput = HealthSummary;

/** Phase W brief §9 — "support 30-day and 90-day." Deliberately narrower than `resolveHealthDateRange`'s general `days: number` — this is the one call site the Doctor Report itself is allowed to use, gated to the two approved ranges rather than an arbitrary caller-chosen window. */
export type DoctorReportRangeDays =
  | typeof HEALTH_SUMMARY_RANGE_DAYS.last30
  | typeof HEALTH_SUMMARY_RANGE_DAYS.last90;

export function buildDoctorReportInput(
  sources: HealthSummarySources,
  rangeDays: DoctorReportRangeDays,
  today: string,
): DoctorReportInput {
  return buildHealthSummary(sources, resolveHealthDateRange(rangeDays, today));
}
