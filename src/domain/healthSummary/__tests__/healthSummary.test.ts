import { resolveHealthDateRange, HEALTH_SUMMARY_RANGE_DAYS } from "../resolveHealthDateRange";
import { computeBodyAreaFrequency } from "../computeBodyAreaFrequency";
import { computeCheckInCoverage } from "../computeCheckInCoverage";
import { computeHighSymptomDays } from "../computeHighSymptomDays";
import { buildTreatmentSummary } from "../buildTreatmentSummary";
import { buildLabSummary } from "../buildLabSummary";
import { buildAppointmentSummary } from "../buildAppointmentSummary";
import { buildHealthSummary, type HealthSummarySources } from "../buildHealthSummary";
import { buildDoctorReportInput } from "../buildDoctorReportInput";
import { buildAiSafeHealthSummaryPayload } from "../aiSafePayload";
import { INSIGHTS_THRESHOLDS } from "../../constants";

const RANGE = { rangeStart: "2026-08-01", rangeEnd: "2026-08-31" }; // 30 days

describe("resolveHealthDateRange", () => {
  it("covers exactly the requested number of calendar days, inclusive start / exclusive end", () => {
    const range = resolveHealthDateRange(HEALTH_SUMMARY_RANGE_DAYS.last30, "2026-09-03");
    expect(range).toEqual({ rangeStart: "2026-08-05", rangeEnd: "2026-09-04" });
  });

  it("7/30/90-day presets each resolve to a distinct, correctly-sized range", () => {
    const today = "2026-09-03";
    expect(resolveHealthDateRange(HEALTH_SUMMARY_RANGE_DAYS.last7, today)).toEqual({
      rangeStart: "2026-08-28",
      rangeEnd: "2026-09-04",
    });
    expect(resolveHealthDateRange(HEALTH_SUMMARY_RANGE_DAYS.last90, today)).toEqual({
      rangeStart: "2026-06-06",
      rangeEnd: "2026-09-04",
    });
  });

  it("crosses a year boundary correctly (UTC-anchored date-only arithmetic, Tech Arch §H)", () => {
    const range = resolveHealthDateRange(HEALTH_SUMMARY_RANGE_DAYS.last7, "2027-01-02");
    expect(range).toEqual({ rangeStart: "2026-12-27", rangeEnd: "2027-01-03" });
  });
});

describe("computeBodyAreaFrequency", () => {
  it("counts and sorts descending, with an alphabetical tie-break", () => {
    const result = computeBodyAreaFrequency(
      [
        { date: "2026-08-05", region: "hips" },
        { date: "2026-08-06", region: "hips" },
        { date: "2026-08-07", region: "lower_back" },
        { date: "2026-08-08", region: "chest_ribs" },
      ],
      RANGE,
    );
    expect(result).toEqual([
      { region: "hips", count: 2 },
      { region: "chest_ribs", count: 1 },
      { region: "lower_back", count: 1 },
    ]);
  });

  it("excludes entries outside the range and returns an empty array for none", () => {
    expect(computeBodyAreaFrequency([{ date: "2026-07-31", region: "hips" }], RANGE)).toEqual([]);
    expect(computeBodyAreaFrequency([], RANGE)).toEqual([]);
  });
});

describe("computeCheckInCoverage", () => {
  it("reports the range's own length regardless of how many check-ins fell in it", () => {
    const result = computeCheckInCoverage(
      [{ date: "2026-08-05" }, { date: "2026-08-10" }],
      RANGE,
    );
    expect(result).toEqual({ completedCount: 2, daysInRange: 30 });
  });

  it("zero check-ins is a real, reportable state — not an error", () => {
    expect(computeCheckInCoverage([], RANGE)).toEqual({ completedCount: 0, daysInRange: 30 });
  });
});

describe("computeHighSymptomDays", () => {
  const baseCheckIn = {
    pain: 5,
    fatigue: 5,
    morningStiffnessBucket: "15_30" as const,
    notes: null,
    isHighSymptomDay: false,
  };

  it("includes only explicitly marked days, never inferred from scores", () => {
    const result = computeHighSymptomDays(
      [
        { ...baseCheckIn, date: "2026-08-05", pain: 10, fatigue: 10, isHighSymptomDay: false }, // worst possible scores, NOT marked — must not appear
        { ...baseCheckIn, date: "2026-08-06", pain: 1, fatigue: 1, isHighSymptomDay: true }, // mild scores, explicitly marked — must appear
      ],
      RANGE,
    );
    expect(result.count).toBe(1);
    expect(result.days).toEqual([
      { date: "2026-08-06", pain: 1, fatigue: 1, morningStiffnessBucket: "15_30", note: null },
    ]);
  });

  it("sorts most-recent-first and carries the note through when present", () => {
    const result = computeHighSymptomDays(
      [
        { ...baseCheckIn, date: "2026-08-05", isHighSymptomDay: true, notes: "Rough morning." },
        { ...baseCheckIn, date: "2026-08-20", isHighSymptomDay: true },
      ],
      RANGE,
    );
    expect(result.days.map((d) => d.date)).toEqual(["2026-08-20", "2026-08-05"]);
    expect(result.days[1].note).toBe("Rough morning.");
  });

  it("zero marked days is a real, reportable state", () => {
    expect(computeHighSymptomDays([{ ...baseCheckIn, date: "2026-08-05" }], RANGE)).toEqual({ count: 0, days: [] });
  });
});

describe("buildTreatmentSummary", () => {
  it("a neutral/no-treatment user gets empty arrays, never fabricated entries", () => {
    const result = buildTreatmentSummary({
      medications: [],
      medicationAdministrations: [],
      injectionTreatments: [],
      injectionAdministrations: [],
      range: RANGE,
    });
    expect(result).toEqual({ medications: [], injections: [] });
  });

  it("excludes a tracked medication/treatment with zero activity in range", () => {
    const result = buildTreatmentSummary({
      medications: [{ id: "m1", name: "Sulfasalazine" }],
      medicationAdministrations: [],
      injectionTreatments: [{ id: "t1", name: "Etanercept" }],
      injectionAdministrations: [],
      range: RANGE,
    });
    expect(result).toEqual({ medications: [], injections: [] });
  });

  it("includes an entry with real activity, computed via the existing insights functions", () => {
    const result = buildTreatmentSummary({
      medications: [{ id: "m1", name: "Sulfasalazine" }],
      medicationAdministrations: [
        { medicationId: "m1", scheduledFor: "2026-08-05T08:00", status: "taken" },
        { medicationId: "m1", scheduledFor: "2026-08-06T08:00", status: "missed" },
      ],
      injectionTreatments: [{ id: "t1", name: "Etanercept" }],
      injectionAdministrations: [
        { injectionTreatmentId: "t1", scheduledFor: "2026-08-05", actualDate: "2026-08-05", status: "completed" },
      ],
      range: RANGE,
    });
    expect(result.medications).toEqual([
      { medicationId: "m1", medicationName: "Sulfasalazine", adherence: expect.objectContaining({ takenCount: 1, missedCount: 1 }) },
    ]);
    expect(result.injections).toEqual([
      { treatmentId: "t1", treatmentName: "Etanercept", history: expect.objectContaining({ completedCount: 1 }) },
    ]);
  });
});

describe("buildLabSummary", () => {
  it("no results in range yields an empty markers array, never a fabricated CRP/ESR entry", () => {
    expect(buildLabSummary([], RANGE)).toEqual({ markers: [] });
  });

  it("only includes markers actually present, sorted alphabetically", () => {
    const result = buildLabSummary(
      [
        { marker: "ESR", value: 12, recordedDate: "2026-08-05" },
        { marker: "CRP", value: 4, recordedDate: "2026-08-10" },
      ],
      RANGE,
    );
    expect(result.markers.map((m) => m.marker)).toEqual(["CRP", "ESR"]);
  });
});

describe("buildAppointmentSummary", () => {
  it("both null when there is no history at all", () => {
    expect(
      buildAppointmentSummary({ pastAppointmentsMostRecentFirst: [], upcomingAppointmentsSoonestFirst: [] }),
    ).toEqual({ mostRecentPast: null, nextUpcoming: null });
  });

  it("takes the first of each already-sorted list", () => {
    const past = { id: "a1", type: "rheumatology" as const, date: "2026-07-01", time: null, doctorOrInstitution: null, status: "completed" as const };
    const upcoming = { id: "a2", type: "rheumatology" as const, date: "2026-09-15", time: null, doctorOrInstitution: null, status: "scheduled" as const };
    expect(
      buildAppointmentSummary({ pastAppointmentsMostRecentFirst: [past], upcomingAppointmentsSoonestFirst: [upcoming] }),
    ).toEqual({ mostRecentPast: past, nextUpcoming: upcoming });
  });
});

describe("buildHealthSummary", () => {
  const emptySources: HealthSummarySources = {
    checkIns: [],
    bodyAreaRecords: [],
    medications: [],
    medicationAdministrations: [],
    injectionTreatments: [],
    injectionAdministrations: [],
    labResults: [],
    pastAppointmentsMostRecentFirst: [],
    upcomingAppointmentsSoonestFirst: [],
  };

  it("a brand-new user with zero data of any kind never throws and never fabricates values", () => {
    const summary = buildHealthSummary(emptySources, RANGE);
    expect(summary.symptoms.coverage).toEqual({ completedCount: 0, daysInRange: 30 });
    expect(summary.symptoms.pain.sufficientData).toBe(false);
    expect(summary.symptoms.bodyAreas).toEqual([]);
    expect(summary.highSymptomDays).toEqual({ count: 0, days: [] });
    expect(summary.treatment).toEqual({ medications: [], injections: [] });
    expect(summary.labs).toEqual({ markers: [] });
    expect(summary.appointments).toEqual({ mostRecentPast: null, nextUpcoming: null });
    expect(summary.healthKit).toBeUndefined();
  });

  it("one single check-in is real, reportable data — not an error, but below the trend threshold", () => {
    const summary = buildHealthSummary(
      {
        ...emptySources,
        checkIns: [
          { date: "2026-08-05", pain: 6, fatigue: 5, morningStiffnessBucket: "30_60", notes: null, isHighSymptomDay: false, id: "c1" } as any,
        ],
      },
      RANGE,
    );
    expect(summary.symptoms.coverage.completedCount).toBe(1);
    expect(summary.symptoms.pain.sufficientData).toBe(false);
    expect(summary.symptoms.pain.dataPoints).toBe(1);
  });

  it("composes a full, populated summary correctly across every section at once", () => {
    const checkIns = Array.from({ length: 5 }, (_, i) => ({
      id: `c${i}`,
      date: `2026-08-0${i + 1}`,
      pain: 5,
      fatigue: 4,
      morningStiffnessBucket: "15_30" as const,
      notes: null,
      isHighSymptomDay: i === 0,
    }));
    const summary = buildHealthSummary(
      {
        ...emptySources,
        checkIns,
        bodyAreaRecords: [{ date: "2026-08-01", region: "hips" }],
      },
      RANGE,
    );
    expect(summary.symptoms.coverage.completedCount).toBe(5);
    expect(summary.symptoms.pain.sufficientData).toBe(true);
    expect(summary.symptoms.pain.average).toBe(5);
    expect(summary.highSymptomDays.count).toBe(1);
    expect(summary.symptoms.bodyAreas).toEqual([{ region: "hips", count: 1 }]);
  });

  it("carries a HealthKit context through only when the caller supplies one — never fabricates it", () => {
    const withContext = buildHealthSummary(
      { ...emptySources, healthKit: { averageDailySteps: 6000 } },
      RANGE,
    );
    expect(withContext.healthKit).toEqual({ averageDailySteps: 6000 });

    const without = buildHealthSummary(emptySources, RANGE);
    expect(without.healthKit).toBeUndefined();
    expect("healthKit" in without).toBe(false);
  });
});

describe("buildDoctorReportInput", () => {
  const emptySources: HealthSummarySources = {
    checkIns: [],
    bodyAreaRecords: [],
    medications: [],
    medicationAdministrations: [],
    injectionTreatments: [],
    injectionAdministrations: [],
    labResults: [],
    pastAppointmentsMostRecentFirst: [],
    upcomingAppointmentsSoonestFirst: [],
  };

  it("resolves the 30-day range correctly", () => {
    const input = buildDoctorReportInput(emptySources, 30, "2026-09-03");
    expect(input.range).toEqual({ rangeStart: "2026-08-05", rangeEnd: "2026-09-04" });
  });

  it("resolves the 90-day range correctly", () => {
    const input = buildDoctorReportInput(emptySources, 90, "2026-09-03");
    expect(input.range).toEqual({ rangeStart: "2026-06-06", rangeEnd: "2026-09-04" });
  });

  it("is the exact same shape as HealthSummary — no parallel data structure", () => {
    const input = buildDoctorReportInput(emptySources, 30, "2026-09-03");
    expect(Object.keys(input).sort()).toEqual(
      Object.keys(buildHealthSummary(emptySources, input.range)).sort(),
    );
  });
});

describe("buildAiSafeHealthSummaryPayload", () => {
  it("strips free-text notes, internal IDs, and identifying appointment fields; keeps every numeric/categorical field", () => {
    const summary = buildHealthSummary(
      {
        checkIns: [
          { id: "c1", date: "2026-08-05", pain: 9, fatigue: 8, morningStiffnessBucket: "over_60", notes: "Private note text.", isHighSymptomDay: true } as any,
        ],
        bodyAreaRecords: [],
        medications: [{ id: "m1", name: "Sulfasalazine" }],
        medicationAdministrations: [{ medicationId: "m1", scheduledFor: "2026-08-05T08:00", status: "taken" }],
        injectionTreatments: [],
        injectionAdministrations: [],
        labResults: [],
        pastAppointmentsMostRecentFirst: [
          { id: "a1", type: "rheumatology", date: "2026-07-01", time: "10:00", doctorOrInstitution: "Dr. Aylin Demir", status: "completed" },
        ],
        upcomingAppointmentsSoonestFirst: [],
      },
      RANGE,
    );

    const payload = buildAiSafeHealthSummaryPayload(summary);

    expect(JSON.stringify(payload)).not.toContain("Private note text");
    expect(JSON.stringify(payload)).not.toContain("Dr. Aylin Demir");
    expect(JSON.stringify(payload)).not.toContain("c1"); // check-in row id never appears
    expect(JSON.stringify(payload)).not.toContain("m1"); // medication id never appears
    expect(JSON.stringify(payload)).not.toContain("a1"); // appointment id never appears
    expect(payload.highSymptomDays.days[0]).toEqual({ date: "2026-08-05", pain: 9, fatigue: 8, morningStiffnessBucket: "over_60" });
    expect(payload.treatment.medications[0]).toEqual({ medicationName: "Sulfasalazine", adherence: expect.any(Object) });
    expect(payload.appointments.mostRecentPast).toEqual({ type: "rheumatology", date: "2026-07-01", status: "completed" });
  });
});

// Sanity check that the threshold constant this test file assumes hasn't silently drifted.
it("assumes the same minCheckInsForTrend threshold domain/insights actually uses", () => {
  expect(INSIGHTS_THRESHOLDS.minCheckInsForTrend).toBe(3);
});
