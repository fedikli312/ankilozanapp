import { createTestDatabase } from "../../../db/testUtils/testDatabase";
import { getHealthSummary, getHealthSummaryForLastDays } from "../getHealthSummary";
import { resolveHealthDateRange, HEALTH_SUMMARY_RANGE_DAYS } from "../../../domain/healthSummary";
import {
  createAppointment,
  createInjectionTreatment,
  createLabResult,
  createMedication,
  createPendingAdministrations,
  createPendingInjectionAdministration,
  markAdministration,
  logInjectionAdministration,
  upsertCheckIn,
} from "../../../repositories";

/**
 * Integration-level tests (real, migrated in-memory SQLite via
 * `createTestDatabase` — same pattern `useAppointmentPreparation` and
 * `useInsightsLanding` are themselves exercised through indirectly) —
 * these prove the repository-to-domain wiring itself, on top of the pure
 * unit tests in `domain/healthSummary/__tests__`.
 */
describe("getHealthSummary (DB integration)", () => {
  it("a brand-new database with zero of every record type never throws", () => {
    const { db } = createTestDatabase();
    const summary = getHealthSummary(db, resolveHealthDateRange(HEALTH_SUMMARY_RANGE_DAYS.last30, "2026-09-03"), "2026-09-03");
    expect(summary.symptoms.coverage.completedCount).toBe(0);
    expect(summary.treatment).toEqual({ medications: [], injections: [] });
    expect(summary.appointments).toEqual({ mostRecentPast: null, nextUpcoming: null });
  });

  it("day-boundary case: a check-in exactly on rangeStart is included, one day earlier is excluded", () => {
    const { db } = createTestDatabase();
    const range = { rangeStart: "2026-08-05", rangeEnd: "2026-09-04" };

    upsertCheckIn(db, { id: "in", date: "2026-08-05", pain: 5, fatigue: 5, morningStiffnessBucket: "15_30" });
    upsertCheckIn(db, { id: "out", date: "2026-08-04", pain: 5, fatigue: 5, morningStiffnessBucket: "15_30" });

    const summary = getHealthSummary(db, range, "2026-09-03");
    expect(summary.symptoms.coverage.completedCount).toBe(1);
  });

  it("only marked check-ins appear as high-symptom days, regardless of score", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, {
      id: "c1",
      date: "2026-08-10",
      pain: 10,
      fatigue: 10,
      morningStiffnessBucket: "over_60",
      isHighSymptomDay: false,
    });
    upsertCheckIn(db, {
      id: "c2",
      date: "2026-08-11",
      pain: 2,
      fatigue: 2,
      morningStiffnessBucket: "none",
      isHighSymptomDay: true,
    });

    const summary = getHealthSummaryForLastDays(db, HEALTH_SUMMARY_RANGE_DAYS.last30, "2026-09-03");
    expect(summary.highSymptomDays.count).toBe(1);
    expect(summary.highSymptomDays.days[0].date).toBe("2026-08-11");
  });

  it("body-area frequency reflects recorded regions across multiple check-ins", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, { id: "c1", date: "2026-08-10", pain: 4, fatigue: 4, morningStiffnessBucket: "15_30", bodyAreas: ["hips", "lower_back"] });
    upsertCheckIn(db, { id: "c2", date: "2026-08-11", pain: 4, fatigue: 4, morningStiffnessBucket: "15_30", bodyAreas: ["hips"] });

    const summary = getHealthSummaryForLastDays(db, HEALTH_SUMMARY_RANGE_DAYS.last30, "2026-09-03");
    expect(summary.symptoms.bodyAreas).toEqual([{ region: "hips", count: 2 }, { region: "lower_back", count: 1 }]);
  });

  it("a neutral user with a medication but no administrations in range gets an empty treatment summary", () => {
    const { db } = createTestDatabase();
    createMedication(db, { id: "m1", name: "Sulfasalazine", dose: "500mg" });

    const summary = getHealthSummaryForLastDays(db, HEALTH_SUMMARY_RANGE_DAYS.last30, "2026-09-03");
    expect(summary.treatment.medications).toEqual([]);
  });

  it("real medication and injection activity in range is reflected", () => {
    const { db } = createTestDatabase();
    createMedication(db, { id: "m1", name: "Sulfasalazine", dose: "500mg" });
    createPendingAdministrations(db, [{ id: "ma1", medicationId: "m1", medicationScheduleId: null, scheduledFor: "2026-08-10T08:00" }]);
    markAdministration(db, "ma1", "taken", "2026-08-10T08:05");

    createInjectionTreatment(db, { id: "t1", name: "Etanercept", dose: "50mg" });
    createPendingInjectionAdministration(db, { id: "ia1", injectionTreatmentId: "t1", injectionScheduleId: null, scheduledFor: "2026-08-12" });
    logInjectionAdministration(db, "ia1", "completed", "2026-08-12");

    const summary = getHealthSummaryForLastDays(db, HEALTH_SUMMARY_RANGE_DAYS.last30, "2026-09-03");
    expect(summary.treatment.medications[0]).toMatchObject({ medicationName: "Sulfasalazine" });
    expect(summary.treatment.medications[0].adherence.takenCount).toBe(1);
    expect(summary.treatment.injections[0]).toMatchObject({ treatmentName: "Etanercept" });
    expect(summary.treatment.injections[0].history.completedCount).toBe(1);
  });

  it("CRP/ESR extraction reports only markers actually recorded, with real dates/values", () => {
    const { db } = createTestDatabase();
    createLabResult(db, { id: "l1", marker: "CRP", value: 12.4, unit: "mg/L", recordedDate: "2026-08-20" });

    const summary = getHealthSummaryForLastDays(db, HEALTH_SUMMARY_RANGE_DAYS.last30, "2026-09-03");
    expect(summary.labs.markers).toEqual([
      { marker: "CRP", history: expect.objectContaining({ mostRecent: expect.objectContaining({ value: 12.4 }) }) },
    ]);
  });

  it("selects the correct upcoming appointment regardless of how many past ones exist", () => {
    const { db } = createTestDatabase();
    createAppointment(db, { id: "a1", type: "rheumatology", date: "2026-07-01" });
    createAppointment(db, { id: "a2", type: "rheumatology", date: "2026-09-15" });

    const summary = getHealthSummaryForLastDays(db, HEALTH_SUMMARY_RANGE_DAYS.last30, "2026-09-03");
    expect(summary.appointments.mostRecentPast?.id).toBe("a1");
    expect(summary.appointments.nextUpcoming?.id).toBe("a2");
  });

  it("the trend's previous-period comparison works because the check-in fetch is widened, matching useInsightsLanding's own pattern", () => {
    const { db } = createTestDatabase();
    // 3 check-ins in the requested 30-day range, 3 more in the immediately preceding 30 days.
    for (let i = 0; i < 3; i++) {
      upsertCheckIn(db, { id: `cur-${i}`, date: `2026-08-1${i}`, pain: 8, fatigue: 8, morningStiffnessBucket: "over_60" });
      upsertCheckIn(db, { id: `prev-${i}`, date: `2026-07-1${i}`, pain: 2, fatigue: 2, morningStiffnessBucket: "none" });
    }

    const summary = getHealthSummaryForLastDays(db, HEALTH_SUMMARY_RANGE_DAYS.last30, "2026-09-03");
    expect(summary.symptoms.pain.sufficientData).toBe(true);
    expect(summary.symptoms.pain.previousPeriodAverage).toBe(2);
    expect(summary.symptoms.pain.direction).toBe("up");
  });
});
