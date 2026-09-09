import {
  presentInjectionSummary,
  presentLabSummary,
  presentNumericSummary,
  presentStiffnessSummary,
  presentTreatmentRecordSummary,
  type Translate,
} from "../presentInsightsLanding";
import type { InjectionHistory, LabHistory, MedicationAdherence, NumericTrend, StiffnessHistory } from "../../../domain/insights";

/** Mirrors `presentAppointmentSummary.test.ts`'s own minimal `t` stand-in. */
const t: Translate = (key, options) => (options ? `${key}(${JSON.stringify(options)})` : key);

const EMPTY_BUCKET_COUNTS = { none: 0, under_15: 0, "15_30": 0, "30_60": 0, over_60: 0 };

describe("presentNumericSummary — sparse and empty (brief §16/§17)", () => {
  it("insufficient data renders the factual not-enough-data copy, never generic encouragement", () => {
    const trend: NumericTrend = { average: 0, previousPeriodAverage: null, direction: null, dataPoints: 1, sufficientData: false };
    expect(presentNumericSummary(trend, t)).toBe("insights.notEnoughData");
  });

  it("sufficient data with no previous period renders average-only", () => {
    const trend: NumericTrend = { average: 4.2, previousPeriodAverage: null, direction: null, dataPoints: 5, sufficientData: true };
    expect(presentNumericSummary(trend, t)).toBe('insights.averageOnly({"average":"4.2"})');
  });

  it("sufficient data with a previous period states both numbers neutrally, never a directional word", () => {
    const trend: NumericTrend = { average: 4.2, previousPeriodAverage: 3.8, direction: "up", dataPoints: 5, sufficientData: true };
    const result = presentNumericSummary(trend, t);
    expect(result).toBe('insights.averageComparison({"average":"4.2","previous":"3.8"})');
    expect(result).not.toMatch(/up|down|worse|better|improv/i);
  });
});

describe("presentStiffnessSummary — categorical semantics preserved (brief §9)", () => {
  it("insufficient data renders the factual not-enough-data copy", () => {
    const stiffness: StiffnessHistory = { bucketCounts: EMPTY_BUCKET_COUNTS, mostCommonBucket: null, dataPoints: 1, sufficientData: false };
    expect(presentStiffnessSummary(stiffness, t)).toBe("insights.notEnoughData");
  });

  it("sufficient data names the real categorical bucket, never a fabricated minute value", () => {
    const stiffness: StiffnessHistory = {
      bucketCounts: { ...EMPTY_BUCKET_COUNTS, under_15: 4, "15_30": 2 },
      mostCommonBucket: "under_15",
      dataPoints: 6,
      sufficientData: true,
    };
    expect(presentStiffnessSummary(stiffness, t)).toBe(
      'insights.stiffnessSummary({"bucket":"checkIn.stiffness.under_15","count":4,"total":6})',
    );
  });
});

describe("presentTreatmentRecordSummary — factual counts, never a percentage (brief §13)", () => {
  it("no administrations at all renders the generic not-enough-data copy", () => {
    const adherence: MedicationAdherence = { takenCount: 0, missedCount: 0, skippedCount: 0, adherencePercentage: null, sufficientData: false };
    expect(presentTreatmentRecordSummary(adherence, t)).toBe("insights.notEnoughDataGeneric");
  });

  it("real administrations render taken/missed counts even when a percentage exists on the domain object", () => {
    const adherence: MedicationAdherence = { takenCount: 9, missedCount: 1, skippedCount: 0, adherencePercentage: 90, sufficientData: true };
    const result = presentTreatmentRecordSummary(adherence, t);
    expect(result).toBe('insights.adherenceCounts({"taken":9,"missed":1})');
    expect(result).not.toMatch(/%|percent/i);
  });

  it("below the sufficient-data threshold but with real counts still renders the factual counts, not a percentage claim", () => {
    // sufficientData false (fewer than minScheduledDosesForAdherence) but takenCount+missedCount+skippedCount > 0.
    const adherence: MedicationAdherence = { takenCount: 1, missedCount: 0, skippedCount: 0, adherencePercentage: null, sufficientData: false };
    expect(presentTreatmentRecordSummary(adherence, t)).toBe('insights.adherenceCounts({"taken":1,"missed":0})');
  });
});

describe("presentInjectionSummary", () => {
  it("no completed or missed injections renders the generic not-enough-data copy", () => {
    const history: InjectionHistory = { entries: [], completedCount: 0, missedCount: 0, sufficientData: false };
    expect(presentInjectionSummary(history, t)).toBe("insights.notEnoughDataGeneric");
  });

  it("real history renders completed/missed counts", () => {
    const history: InjectionHistory = { entries: [], completedCount: 3, missedCount: 1, sufficientData: true };
    expect(presentInjectionSummary(history, t)).toBe('insights.injectionSummary({"completed":3,"missed":1})');
  });
});

describe("presentLabSummary — factual value/date, no interpretation (brief §14)", () => {
  it("no recorded values renders the generic not-enough-data copy", () => {
    const history: LabHistory = { values: [], min: null, max: null, mostRecent: null, sufficientData: false };
    expect(presentLabSummary(history, t)).toBe("insights.notEnoughDataGeneric");
  });

  it("a recorded value renders its real value and date verbatim, never normal/abnormal language", () => {
    const history: LabHistory = {
      values: [{ marker: "CRP", value: 6.8, recordedDate: "2026-08-29" }],
      min: 6.8,
      max: 6.8,
      mostRecent: { marker: "CRP", value: 6.8, recordedDate: "2026-08-29" },
      sufficientData: false,
    };
    const result = presentLabSummary(history, t);
    expect(result).toBe('insights.labSummary({"value":6.8,"date":"2026-08-29"})');
    expect(result).not.toMatch(/normal|abnormal|high|low/i);
  });
});
