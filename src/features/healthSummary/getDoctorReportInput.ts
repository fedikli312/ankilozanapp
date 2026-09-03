import { getHealthSummary } from "./getHealthSummary";
import { resolveHealthDateRange, type DoctorReportInput, type DoctorReportRangeDays } from "../../domain/healthSummary";
import type { AppDatabase } from "../../repositories";

/**
 * Phase W brief §9's DB-integrated entry point — Phase Z's future Doctor
 * Report screen calls this (or a thin hook wrapping it), never the domain
 * `buildDoctorReportInput` directly, since only this layer is allowed to
 * touch the database. `DoctorReportInput` is `HealthSummary` itself (see
 * that type's own doc comment) — this function's only real job is
 * constraining the caller to the two approved ranges.
 */
export function getDoctorReportInput(db: AppDatabase, rangeDays: DoctorReportRangeDays, today: string): DoctorReportInput {
  return getHealthSummary(db, resolveHealthDateRange(rangeDays, today), today);
}
