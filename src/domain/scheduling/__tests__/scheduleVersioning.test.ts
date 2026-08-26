import { applyScheduleVersioning } from "../scheduleVersioning";
import { resolveEffectiveSchedule } from "../resolveEffectiveSchedule";
import type { MedicationScheduleVersion } from "../types";

describe("schedule versioning", () => {
  it("computes the supersede-old / start-new instructions for an edit", () => {
    const result = applyScheduleVersioning("2026-08-20");

    expect(result).toEqual({
      supersedeCurrentVersion: { effectiveUntil: "2026-08-20" },
      newVersionEffectiveFrom: "2026-08-20",
    });
  });

  it("historical-accuracy invariant: a past date always resolves to the schedule version that was effective then, never the current one", () => {
    // A medication scheduled for Mondays is changed to Wednesdays on 2026-08-20
    // (the walkthrough example from Tech Arch §F).
    const mondaysVersion: MedicationScheduleVersion = {
      id: "v1-mondays",
      frequencyType: "specific_days",
      intervalDays: null,
      effectiveFrom: "2026-07-01",
      effectiveUntil: "2026-08-20",
    };
    const wednesdaysVersion: MedicationScheduleVersion = {
      id: "v2-wednesdays",
      frequencyType: "specific_days",
      intervalDays: null,
      effectiveFrom: "2026-08-20",
      effectiveUntil: null,
    };
    const versions = [mondaysVersion, wednesdaysVersion];

    // A date before the change still resolves to the Mondays version...
    expect(resolveEffectiveSchedule(versions, "2026-08-17")?.id).toBe("v1-mondays");
    // ...even after the Wednesdays version has been created and is "current."
    expect(resolveEffectiveSchedule(versions, "2026-08-24")?.id).toBe("v2-wednesdays");
    // The boundary date itself belongs to the new version (effectiveFrom is inclusive).
    expect(resolveEffectiveSchedule(versions, "2026-08-20")?.id).toBe("v2-wednesdays");
  });

  it("returns undefined when no version covers the requested date", () => {
    const versions: MedicationScheduleVersion[] = [
      {
        id: "v1",
        frequencyType: "daily",
        intervalDays: null,
        effectiveFrom: "2026-08-01",
        effectiveUntil: "2026-08-10",
      },
    ];

    expect(resolveEffectiveSchedule(versions, "2026-08-15")).toBeUndefined();
  });
});
