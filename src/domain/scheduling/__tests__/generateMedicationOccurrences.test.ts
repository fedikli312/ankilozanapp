import { generateMedicationOccurrences } from "../generateMedicationOccurrences";
import type { MedicationScheduleVersion } from "../types";

describe("generateMedicationOccurrences", () => {
  it("generates one occurrence per day for a daily schedule", () => {
    const schedule: MedicationScheduleVersion = {
      id: "s1",
      frequencyType: "daily",
      intervalDays: null,
      effectiveFrom: "2026-08-01",
      effectiveUntil: null,
    };

    const occurrences = generateMedicationOccurrences({
      schedule,
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-05",
    });

    expect(occurrences).toEqual(["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04"]);
  });

  it("generates occurrences only on the specified weekdays", () => {
    // 2026-08-24 is a Monday.
    const schedule: MedicationScheduleVersion = {
      id: "s1",
      frequencyType: "specific_days",
      intervalDays: null,
      effectiveFrom: "2026-08-24",
      effectiveUntil: null,
    };

    const occurrences = generateMedicationOccurrences({
      schedule,
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      rangeStart: "2026-08-24",
      rangeEnd: "2026-08-31",
    });

    expect(occurrences).toEqual(["2026-08-24", "2026-08-26", "2026-08-28"]);
  });

  it("generates occurrences every intervalDays for custom_interval, anchored to effectiveFrom", () => {
    const schedule: MedicationScheduleVersion = {
      id: "s1",
      frequencyType: "custom_interval",
      intervalDays: 3,
      effectiveFrom: "2026-08-01",
      effectiveUntil: null,
    };

    const occurrences = generateMedicationOccurrences({
      schedule,
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-10",
    });

    expect(occurrences).toEqual(["2026-08-01", "2026-08-04", "2026-08-07"]);
  });

  it("clips generation to the schedule's own effectiveUntil, never past it", () => {
    const schedule: MedicationScheduleVersion = {
      id: "s1",
      frequencyType: "daily",
      intervalDays: null,
      effectiveFrom: "2026-08-01",
      effectiveUntil: "2026-08-03",
    };

    const occurrences = generateMedicationOccurrences({
      schedule,
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-10",
    });

    expect(occurrences).toEqual(["2026-08-01", "2026-08-02"]);
  });

  it("throws for specific_days without any days provided", () => {
    const schedule: MedicationScheduleVersion = {
      id: "s1",
      frequencyType: "specific_days",
      intervalDays: null,
      effectiveFrom: "2026-08-01",
      effectiveUntil: null,
    };

    expect(() =>
      generateMedicationOccurrences({ schedule, rangeStart: "2026-08-01", rangeEnd: "2026-08-05" }),
    ).toThrow();
  });
});
