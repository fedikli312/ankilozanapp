import { presentAppointmentSummary, type Translate } from "../presentAppointmentSummary";
import type { HealthSummary } from "../../../domain/healthSummary";

/** Mirrors `presentTimelineEvent.test.ts`'s own minimal `t` stand-in — returns the key with interpolated params visible, so assertions can check both which key was requested and what was passed to it without importing the full i18n system. */
const t: Translate = (key, options) => (options ? `${key}(${JSON.stringify(options)})` : key);

const EMPTY_BUCKET_COUNTS = { none: 0, under_15: 0, "15_30": 0, "30_60": 0, over_60: 0 };

function buildSummary(overrides: Partial<HealthSummary> = {}): HealthSummary {
  return {
    range: { rangeStart: "2026-08-05", rangeEnd: "2026-09-04" },
    symptoms: {
      coverage: { completedCount: 0, daysInRange: 30 },
      pain: { average: 0, previousPeriodAverage: null, direction: null, dataPoints: 0, sufficientData: false },
      fatigue: { average: 0, previousPeriodAverage: null, direction: null, dataPoints: 0, sufficientData: false },
      stiffness: { bucketCounts: { ...EMPTY_BUCKET_COUNTS }, mostCommonBucket: null, dataPoints: 0, sufficientData: false },
      bodyAreas: [],
    },
    highSymptomDays: { count: 0, days: [] },
    treatment: { medications: [], injections: [] },
    labs: { markers: [] },
    appointments: { mostRecentPast: null, nextUpcoming: null },
    ...overrides,
  };
}

describe("presentAppointmentSummary — range and date range", () => {
  it("resolves the range label and an inclusive date-range display from the exclusive rangeEnd", () => {
    const summary = buildSummary({ range: { rangeStart: "2026-08-05", rangeEnd: "2026-09-04" } });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.rangeLabel).toBe("appointmentSummary.range.30");
    // rangeEnd (2026-09-04) is exclusive — the displayed end date is one day before it.
    expect(result.dateRangeLabel).toContain("August 5");
    expect(result.dateRangeLabel).toContain("September 3");
    expect(result.dateRangeLabel).not.toContain("September 4");
  });

  it("switching to 90 days resolves the 90-day range label", () => {
    const summary = buildSummary();
    const result = presentAppointmentSummary(summary, 90, t, "en", {});
    expect(result.rangeLabel).toBe("appointmentSummary.range.90");
  });
});

describe("presentAppointmentSummary — recording coverage", () => {
  it("never calls it adherence/compliance — a plain count-of-total line, honest even at zero", () => {
    const summary = buildSummary({ symptoms: { ...buildSummary().symptoms, coverage: { completedCount: 0, daysInRange: 30 } } });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.coverageLine).toBe('appointmentSummary.coverage({"count":0,"total":30})');
  });

  it("reports the real completed count against the real range length", () => {
    const summary = buildSummary({ symptoms: { ...buildSummary().symptoms, coverage: { completedCount: 18, daysInRange: 30 } } });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.coverageLine).toBe('appointmentSummary.coverage({"count":18,"total":30})');
  });
});

describe("presentAppointmentSummary — sparse data (brief §13)", () => {
  it("zero check-ins: hasAnyCheckIn is false, pain/fatigue are null — never a fabricated 0 average", () => {
    const summary = buildSummary();
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.symptoms.hasAnyCheckIn).toBe(false);
    expect(result.symptoms.pain).toBeNull();
    expect(result.symptoms.fatigue).toBeNull();
    expect(result.symptoms.stiffness).toEqual([]);
    expect(result.symptoms.bodyAreas).toEqual([]);
  });

  it("one check-in: hasAnyCheckIn is true, but pain/fatigue stay null (below the domain's own sufficientData threshold) — never a misleading average of one placeholder value", () => {
    const summary = buildSummary({
      symptoms: {
        coverage: { completedCount: 1, daysInRange: 30 },
        pain: { average: 0, previousPeriodAverage: null, direction: null, dataPoints: 1, sufficientData: false },
        fatigue: { average: 0, previousPeriodAverage: null, direction: null, dataPoints: 1, sufficientData: false },
        stiffness: { bucketCounts: { ...EMPTY_BUCKET_COUNTS, "15_30": 1 }, mostCommonBucket: null, dataPoints: 1, sufficientData: false },
        bodyAreas: [],
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.symptoms.hasAnyCheckIn).toBe(true);
    expect(result.symptoms.pain).toBeNull();
    expect(result.symptoms.fatigue).toBeNull();
    // Stiffness distribution is an honest raw count, never threshold-gated — real even with one entry.
    expect(result.symptoms.stiffness).toEqual([{ label: "checkIn.stiffnessCompact.15_30", count: 1 }]);
  });
});

describe("presentAppointmentSummary — pain/fatigue summary (real averages only)", () => {
  it("multiple check-ins with sufficient data render a real average and a real sample count", () => {
    const summary = buildSummary({
      symptoms: {
        coverage: { completedCount: 12, daysInRange: 30 },
        pain: { average: 4.166666, previousPeriodAverage: 5, direction: "down", dataPoints: 12, sufficientData: true },
        fatigue: { average: 3.5, previousPeriodAverage: null, direction: null, dataPoints: 12, sufficientData: true },
        stiffness: { bucketCounts: { ...EMPTY_BUCKET_COUNTS, "15_30": 8, under_15: 4 }, mostCommonBucket: "15_30", dataPoints: 12, sufficientData: true },
        bodyAreas: [],
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.symptoms.pain).toEqual({
      averageLine: 'appointmentSummary.painAverage({"average":"4.2"})',
      sampleCountLine: 'appointmentSummary.sampleCount({"count":12})',
    });
    expect(result.symptoms.fatigue).toEqual({
      averageLine: 'appointmentSummary.fatigueAverage({"average":"3.5"})',
      sampleCountLine: 'appointmentSummary.sampleCount({"count":12})',
    });
  });
});

describe("presentAppointmentSummary — stiffness summary", () => {
  it("is a distribution sorted by count descending, only buckets that were actually recorded — never a composite score", () => {
    const summary = buildSummary({
      symptoms: {
        ...buildSummary().symptoms,
        stiffness: {
          bucketCounts: { ...EMPTY_BUCKET_COUNTS, "15_30": 6, under_15: 4, none: 2 },
          mostCommonBucket: "15_30",
          dataPoints: 12,
          sufficientData: true,
        },
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.symptoms.stiffness).toEqual([
      { label: "checkIn.stiffnessCompact.15_30", count: 6 },
      { label: "checkIn.stiffnessCompact.under_15", count: 4 },
      { label: "checkIn.stiffnessCompact.none", count: 2 },
    ]);
  });
});

describe("presentAppointmentSummary — body-area frequencies", () => {
  it("passes already-sorted entries through as labeled lines, capped compactly", () => {
    const summary = buildSummary({
      symptoms: {
        ...buildSummary().symptoms,
        bodyAreas: [
          { region: "lower_back", count: 9 },
          { region: "hips", count: 4 },
        ],
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.symptoms.bodyAreas).toEqual([
      { label: "checkIn.bodyArea.lower_back", count: 9 },
      { label: "checkIn.bodyArea.hips", count: 4 },
    ]);
  });
});

describe("presentAppointmentSummary — High-Symptom Days", () => {
  it("count comes only from the summary's own highSymptomDays.count — never inferred from pain/fatigue values here", () => {
    const summary = buildSummary({ highSymptomDays: { count: 4, days: [] } });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.highSymptomDays.countLine).toBe('appointmentSummary.highSymptomDaysCount({"count":4})');
  });

  it("a zero count still renders honestly (a count of zero is never misleading, unlike a fabricated average)", () => {
    const summary = buildSummary({ highSymptomDays: { count: 0, days: [] } });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.highSymptomDays.countLine).toBe('appointmentSummary.highSymptomDaysCount({"count":0})');
    expect(result.highSymptomDays.dateLines).toEqual([]);
  });

  it("optionally lists dates, capped to a compact number", () => {
    const summary = buildSummary({
      highSymptomDays: {
        count: 7,
        days: Array.from({ length: 7 }, (_, i) => ({
          date: `2026-08-0${i + 1}`,
          pain: 8,
          fatigue: 7,
          morningStiffnessBucket: "over_60" as const,
          note: null,
        })),
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.highSymptomDays.dateLines.length).toBe(5); // capped, not all 7
  });
});

describe("presentAppointmentSummary — treatment (recorded doses, not adherence)", () => {
  it("no treatment recorded: hasAny is false, both lists empty", () => {
    const summary = buildSummary();
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.treatment.hasAny).toBe(false);
    expect(result.treatment.medications).toEqual([]);
    expect(result.treatment.injections).toEqual([]);
  });

  it("medication data renders taken/missed counts — never a percentage/adherence claim", () => {
    const summary = buildSummary({
      treatment: {
        medications: [
          {
            medicationId: "m1",
            medicationName: "Sulfasalazine",
            adherence: { takenCount: 8, missedCount: 1, skippedCount: 0, adherencePercentage: 88.9, sufficientData: true },
          },
        ],
        injections: [],
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.treatment.hasAny).toBe(true);
    expect(result.treatment.medications).toEqual([
      { id: "m1", name: "Sulfasalazine", line: 'appointmentSummary.medicationDoses({"taken":8,"missed":1})' },
    ]);
  });

  it("injection data renders completed/missed counts and the last recorded (actual) date", () => {
    const summary = buildSummary({
      treatment: {
        medications: [],
        injections: [
          {
            treatmentId: "i1",
            treatmentName: "Etanercept",
            history: {
              entries: [
                { scheduledFor: "2026-08-01", actualDate: "2026-08-01", status: "completed" },
                { scheduledFor: "2026-08-08", actualDate: "2026-08-09", status: "completed" },
              ],
              completedCount: 2,
              missedCount: 0,
              sufficientData: true,
            },
          },
        ],
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.treatment.injections[0].countsLine).toBe('appointmentSummary.injectionCounts({"completed":2,"missed":0})');
    expect(result.treatment.injections[0].lastRecordedLine).toContain("appointmentSummary.lastInjection");
  });
});

describe("presentAppointmentSummary — labs", () => {
  it("no labs recorded renders an empty markers array", () => {
    const summary = buildSummary();
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.labs).toEqual([]);
  });

  it("CRP renders the latest value with its real recorded unit and date, no interpretation", () => {
    const summary = buildSummary({
      labs: {
        markers: [
          {
            marker: "CRP",
            history: {
              values: [{ marker: "CRP", value: 6.8, recordedDate: "2026-08-25" }],
              min: 6.8,
              max: 6.8,
              mostRecent: { marker: "CRP", value: 6.8, recordedDate: "2026-08-25" },
              sufficientData: false,
            },
          },
        ],
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", { CRP: "mg/L" });
    expect(result.labs).toHaveLength(1);
    expect(result.labs[0].label).toBe("labs.marker.CRP");
    expect(result.labs[0].latestLine).toContain('"unit":"mg/L"');
    expect(result.labs[0].previousLine).toBeNull();
  });

  it("ESR with multiple values shows a compact previous-values line, capped", () => {
    const summary = buildSummary({
      labs: {
        markers: [
          {
            marker: "ESR",
            history: {
              values: [
                { marker: "ESR", value: 28, recordedDate: "2026-06-06" },
                { marker: "ESR", value: 22, recordedDate: "2026-07-06" },
                { marker: "ESR", value: 15, recordedDate: "2026-08-25" },
              ],
              min: 15,
              max: 28,
              mostRecent: { marker: "ESR", value: 15, recordedDate: "2026-08-25" },
              sufficientData: true,
            },
          },
        ],
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", { ESR: "mm/hr" });
    expect(result.labs[0].latestLine).toContain('"value":15');
    expect(result.labs[0].previousLine).toContain("28 mm/hr");
    expect(result.labs[0].previousLine).toContain("22 mm/hr");
  });
});

describe("presentAppointmentSummary — Things to Review (deterministic only)", () => {
  it("is empty when there is nothing safe/deterministic to surface", () => {
    const summary = buildSummary();
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.thingsToReview).toEqual([]);
  });

  it("includes a high-symptom-day prompt, a top-body-area prompt, and a latest-lab prompt — capped, never a treatment recommendation", () => {
    const summary = buildSummary({
      highSymptomDays: { count: 3, days: [] },
      symptoms: { ...buildSummary().symptoms, bodyAreas: [{ region: "lower_back", count: 9 }] },
      labs: {
        markers: [
          {
            marker: "CRP",
            history: {
              values: [{ marker: "CRP", value: 6.8, recordedDate: "2026-08-25" }],
              min: 6.8,
              max: 6.8,
              mostRecent: { marker: "CRP", value: 6.8, recordedDate: "2026-08-25" },
              sufficientData: false,
            },
          },
        ],
      },
    });
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(result.thingsToReview).toHaveLength(3);
    expect(result.thingsToReview[0]).toContain("appointmentSummary.thingsToReview.highSymptomDays");
    expect(result.thingsToReview[1]).toContain("appointmentSummary.thingsToReview.bodyArea");
    expect(result.thingsToReview[2]).toContain("appointmentSummary.thingsToReview.latestLab");
    for (const line of result.thingsToReview) {
      expect(line.toLowerCase()).not.toContain("flare");
      expect(line.toLowerCase()).not.toContain("recommend");
    }
  });
});

describe("presentAppointmentSummary — HealthKit absence", () => {
  it("produces no HealthKit-related field or reference when summary.healthKit is absent", () => {
    const summary = buildSummary();
    expect(summary.healthKit).toBeUndefined();
    const result = presentAppointmentSummary(summary, 30, t, "en", {});
    expect(Object.keys(result)).not.toContain("healthKit");
    expect(JSON.stringify(result).toLowerCase()).not.toContain("healthkit");
  });
});
