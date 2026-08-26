import { createTestDatabase } from "../../../db/testUtils/testDatabase";
import { createMedication, createInitialSchedule, getAdministrationsForMedication } from "../../../repositories";
import { MEDICATION_ADMINISTRATION_GENERATION_WINDOW_DAYS } from "../../../domain/constants";
import { generateDueAdministrations } from "../medicationAdministrations";

describe("generateDueAdministrations", () => {
  it("materializes one pending row per day within the generation window for a daily schedule", () => {
    const { db } = createTestDatabase();
    createMedication(db, { id: "med-1", name: "Sulfasalazine", dose: "500mg" });
    createInitialSchedule(db, {
      id: "sched-1",
      medicationId: "med-1",
      frequencyType: "daily",
      effectiveFrom: "2026-08-26",
      timesOfDay: ["08:00"],
    });

    generateDueAdministrations(
      db,
      "med-1",
      { id: "sched-1", frequencyType: "daily", intervalDays: null, effectiveFrom: "2026-08-26", effectiveUntil: null },
      [],
      ["08:00"],
    );

    const administrations = getAdministrationsForMedication(db, "med-1");
    expect(administrations).toHaveLength(MEDICATION_ADMINISTRATION_GENERATION_WINDOW_DAYS);
    expect(administrations.every((a) => a.status === "pending")).toBe(true);
  });

  it("never duplicates a date/time pair on a second call (idempotent top-up)", () => {
    const { db } = createTestDatabase();
    createMedication(db, { id: "med-1", name: "Sulfasalazine", dose: "500mg" });
    createInitialSchedule(db, {
      id: "sched-1",
      medicationId: "med-1",
      frequencyType: "daily",
      effectiveFrom: "2026-08-26",
      timesOfDay: ["08:00"],
    });
    const schedule = { id: "sched-1", frequencyType: "daily" as const, intervalDays: null, effectiveFrom: "2026-08-26", effectiveUntil: null };

    generateDueAdministrations(db, "med-1", schedule, [], ["08:00"]);
    generateDueAdministrations(db, "med-1", schedule, [], ["08:00"]);

    expect(getAdministrationsForMedication(db, "med-1")).toHaveLength(
      MEDICATION_ADMINISTRATION_GENERATION_WINDOW_DAYS,
    );
  });
});
