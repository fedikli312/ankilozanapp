import { createTestDatabase } from "../../db/testUtils/testDatabase";
import { createMedication } from "../medicationRepository";
import {
  createInitialSchedule,
  getCurrentSchedule,
  getScheduleVersions,
  reviseSchedule,
} from "../medicationScheduleRepository";
import {
  createPendingAdministrations,
  getAdministrationsForMedication,
  markAdministration,
} from "../medicationAdministrationRepository";

describe("medication repository", () => {
  it("creates a medication and its initial schedule", () => {
    const { db } = createTestDatabase();

    createMedication(db, { id: "med-1", name: "Sulfasalazine", dose: "500mg" });
    createInitialSchedule(db, {
      id: "sched-1",
      medicationId: "med-1",
      frequencyType: "specific_days",
      effectiveFrom: "2026-08-01",
      daysOfWeek: [1, 3, 5],
      timesOfDay: ["08:00"],
    });

    const current = getCurrentSchedule(db, "med-1");
    expect(current?.id).toBe("sched-1");
    expect(current?.effectiveUntil).toBeNull();
  });

  it("versions a schedule edit instead of mutating the existing row, and preserves past administration history", () => {
    const { db } = createTestDatabase();

    createMedication(db, { id: "med-1", name: "Sulfasalazine", dose: "500mg" });
    createInitialSchedule(db, {
      id: "sched-mondays",
      medicationId: "med-1",
      frequencyType: "specific_days",
      effectiveFrom: "2026-07-01",
      daysOfWeek: [1],
    });

    // Log a dose against the Mondays schedule before it's revised.
    createPendingAdministrations(db, [
      {
        id: "admin-1",
        medicationId: "med-1",
        medicationScheduleId: "sched-mondays",
        scheduledFor: "2026-08-17T08:00:00.000Z",
      },
    ]);
    markAdministration(db, "admin-1", "taken", "2026-08-17T08:05:00.000Z");

    // Revise to Wednesdays starting 2026-08-20 (Tech Arch §F walkthrough).
    reviseSchedule(db, "sched-mondays", "2026-08-20", {
      id: "sched-wednesdays",
      medicationId: "med-1",
      frequencyType: "specific_days",
      effectiveFrom: "2026-08-20",
      daysOfWeek: [3],
    });

    const versions = getScheduleVersions(db, "med-1");
    expect(versions).toHaveLength(2);
    const mondays = versions.find((v) => v.id === "sched-mondays");
    expect(mondays?.effectiveUntil).toBe("2026-08-20");

    // The already-logged administration is untouched — same scheduledFor/status.
    const administrations = getAdministrationsForMedication(db, "med-1");
    expect(administrations).toHaveLength(1);
    expect(administrations[0].scheduledFor).toBe("2026-08-17T08:00:00.000Z");
    expect(administrations[0].status).toBe("taken");
  });

  it("markAdministration never exposes a way to change scheduledFor", () => {
    const { db } = createTestDatabase();
    createMedication(db, { id: "med-1", name: "X", dose: "1" });
    createPendingAdministrations(db, [
      { id: "admin-1", medicationId: "med-1", medicationScheduleId: null, scheduledFor: "2026-08-17T08:00:00.000Z" },
    ]);

    markAdministration(db, "admin-1", "missed");

    const [administration] = getAdministrationsForMedication(db, "med-1");
    expect(administration.scheduledFor).toBe("2026-08-17T08:00:00.000Z");
    expect(administration.status).toBe("missed");
  });
});
