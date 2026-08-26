import { planMedicationAdministrationGeneration } from "../planMedicationAdministrationGeneration";
import { MEDICATION_ADMINISTRATION_GENERATION_WINDOW_DAYS } from "../../constants";
import type { MedicationScheduleVersion } from "../types";

describe("planMedicationAdministrationGeneration", () => {
  const dailySchedule: MedicationScheduleVersion = {
    id: "s1",
    frequencyType: "daily",
    intervalDays: null,
    effectiveFrom: "2026-08-01",
    effectiveUntil: null,
  };

  it("plans one administration per day x time within the generation window", () => {
    const planned = planMedicationAdministrationGeneration({
      schedule: dailySchedule,
      timesOfDay: ["08:00"],
      existingScheduledFor: [],
      today: "2026-08-26",
    });

    expect(planned).toHaveLength(MEDICATION_ADMINISTRATION_GENERATION_WINDOW_DAYS);
    expect(planned[0]).toBe("2026-08-26T08:00");
  });

  it("plans one row per time of day when multiple times are configured", () => {
    const planned = planMedicationAdministrationGeneration({
      schedule: dailySchedule,
      timesOfDay: ["08:00", "20:00"],
      existingScheduledFor: [],
      today: "2026-08-26",
      windowDays: 1,
    });

    expect(planned).toEqual(["2026-08-26T08:00", "2026-08-26T20:00"]);
  });

  it("never re-plans a date/time pair that already has an administration", () => {
    const planned = planMedicationAdministrationGeneration({
      schedule: dailySchedule,
      timesOfDay: ["08:00"],
      existingScheduledFor: ["2026-08-26T08:00", "2026-08-27T08:00"],
      today: "2026-08-26",
      windowDays: 3,
    });

    expect(planned).toEqual(["2026-08-28T08:00"]);
  });
});
