import { computePainHistory } from "../computePainHistory";
import { computeFatigueHistory } from "../computeFatigueHistory";
import { computeStiffnessHistory } from "../computeStiffnessHistory";
import { computeMedicationAdherence } from "../computeMedicationAdherence";
import { computeInjectionHistory } from "../computeInjectionHistory";
import { computeLabHistory } from "../computeLabHistory";
import { INSIGHTS_THRESHOLDS } from "../../constants";

const RANGE = { rangeStart: "2026-08-01", rangeEnd: "2026-08-08" };

describe("computePainHistory / computeFatigueHistory thresholds", () => {
  it("is insufficient one check-in below the threshold", () => {
    const checkIns = [
      { date: "2026-08-02", pain: 5 },
      { date: "2026-08-03", pain: 6 },
    ];
    expect(checkIns.length).toBe(INSIGHTS_THRESHOLDS.minCheckInsForTrend - 1);
    const result = computePainHistory(checkIns, RANGE);
    expect(result.sufficientData).toBe(false);
  });

  it("is sufficient exactly at the threshold and computes the average", () => {
    const checkIns = [
      { date: "2026-08-02", pain: 4 },
      { date: "2026-08-03", pain: 6 },
      { date: "2026-08-04", pain: 5 },
    ];
    expect(checkIns.length).toBe(INSIGHTS_THRESHOLDS.minCheckInsForTrend);
    const result = computePainHistory(checkIns, RANGE);
    expect(result.sufficientData).toBe(true);
    expect(result.average).toBe(5);
  });

  it("fatigue follows the identical shape/threshold as pain", () => {
    const checkIns = [
      { date: "2026-08-02", fatigue: 2 },
      { date: "2026-08-03", fatigue: 4 },
      { date: "2026-08-04", fatigue: 3 },
    ];
    const result = computeFatigueHistory(checkIns, RANGE);
    expect(result.sufficientData).toBe(true);
    expect(result.average).toBe(3);
  });

  it("never claims a direction without a comparable previous period", () => {
    const checkIns = [
      { date: "2026-08-02", pain: 4 },
      { date: "2026-08-03", pain: 6 },
      { date: "2026-08-04", pain: 5 },
    ];
    const result = computePainHistory(checkIns, RANGE);
    expect(result.previousPeriodAverage).toBeNull();
    expect(result.direction).toBeNull();
  });
});

describe("computeStiffnessHistory", () => {
  it("reports bucket counts instead of a fabricated numeric average", () => {
    const result = computeStiffnessHistory(
      [
        { date: "2026-08-02", morningStiffnessBucket: "15_30" },
        { date: "2026-08-03", morningStiffnessBucket: "15_30" },
        { date: "2026-08-04", morningStiffnessBucket: "over_60" },
      ],
      RANGE,
    );
    expect(result.sufficientData).toBe(true);
    expect(result.bucketCounts["15_30"]).toBe(2);
    expect(result.mostCommonBucket).toBe("15_30");
  });
});

describe("computeMedicationAdherence", () => {
  it("excludes pending doses and requires the minimum passed-dose threshold", () => {
    const administrations = [
      { medicationId: "m1", scheduledFor: "2026-08-02T08:00:00Z", status: "taken" as const },
      { medicationId: "m1", scheduledFor: "2026-08-03T08:00:00Z", status: "pending" as const },
    ];
    const result = computeMedicationAdherence(administrations, RANGE, "m1");
    expect(result.sufficientData).toBe(false);
    expect(result.adherencePercentage).toBeNull();
  });

  it("computes adherence percentage once the threshold is met", () => {
    const administrations = [
      { medicationId: "m1", scheduledFor: "2026-08-02T08:00:00Z", status: "taken" as const },
      { medicationId: "m1", scheduledFor: "2026-08-03T08:00:00Z", status: "taken" as const },
      { medicationId: "m1", scheduledFor: "2026-08-04T08:00:00Z", status: "missed" as const },
    ];
    const result = computeMedicationAdherence(administrations, RANGE, "m1");
    expect(result.sufficientData).toBe(true);
    expect(result.adherencePercentage).toBeCloseTo((2 / 3) * 100);
  });
});

describe("computeInjectionHistory", () => {
  it("requires at least one completed injection", () => {
    const result = computeInjectionHistory(
      [{ scheduledFor: "2026-08-02", actualDate: null, status: "missed" }],
      RANGE,
    );
    expect(result.sufficientData).toBe(false);
  });

  it("is sufficient with one completed injection", () => {
    const result = computeInjectionHistory(
      [{ scheduledFor: "2026-08-02", actualDate: "2026-08-02", status: "completed" }],
      RANGE,
    );
    expect(result.sufficientData).toBe(true);
    expect(result.completedCount).toBe(1);
  });
});

describe("computeLabHistory", () => {
  it("treats a single value as a most-recent reading, not a trend", () => {
    const result = computeLabHistory(
      [{ marker: "CRP", value: 6, recordedDate: "2026-08-02" }],
      "CRP",
      RANGE,
    );
    expect(result.sufficientData).toBe(false);
    expect(result.mostRecent?.value).toBe(6);
  });

  it("is sufficient for a trend with two or more values", () => {
    const result = computeLabHistory(
      [
        { marker: "CRP", value: 4, recordedDate: "2026-08-02" },
        { marker: "CRP", value: 8, recordedDate: "2026-08-05" },
      ],
      "CRP",
      RANGE,
    );
    expect(result.sufficientData).toBe(true);
    expect(result.min).toBe(4);
    expect(result.max).toBe(8);
    expect(result.mostRecent?.recordedDate).toBe("2026-08-05");
  });
});
