import { calculateNextInjectionDate } from "../../domain/scheduling";
import { createTestDatabase } from "../../db/testUtils/testDatabase";
import { createInjectionTreatment } from "../injectionRepository";
import { createInitialInjectionSchedule, getCurrentInjectionSchedule } from "../injectionScheduleRepository";
import {
  createPendingInjectionAdministration,
  getAdministrationsForTreatment,
  getLatestAdministration,
  logInjectionAdministration,
  rescheduleInjectionAdministration,
} from "../injectionAdministrationRepository";

describe("injection repository", () => {
  it("logging an administration lets the domain layer compute the next date from the actual date, not the schedule", () => {
    const { db } = createTestDatabase();

    createInjectionTreatment(db, { id: "inj-1", name: "Adalimumab", dose: "40mg" });
    createInitialInjectionSchedule(db, {
      id: "inj-sched-1",
      injectionTreatmentId: "inj-1",
      intervalDays: 14,
      effectiveFrom: "2026-08-01",
    });
    createPendingInjectionAdministration(db, {
      id: "inj-admin-1",
      injectionTreatmentId: "inj-1",
      injectionScheduleId: "inj-sched-1",
      scheduledFor: "2026-08-01",
    });

    // Logged two days late.
    logInjectionAdministration(db, "inj-admin-1", "completed", "2026-08-03");

    const latest = getLatestAdministration(db, "inj-1");
    expect(latest?.status).toBe("completed");
    expect(latest?.scheduledFor).toBe("2026-08-01");

    const schedule = getCurrentInjectionSchedule(db, "inj-1");
    const nextDate = calculateNextInjectionDate(
      { scheduledFor: latest!.scheduledFor, actualDate: latest!.actualDate, status: latest!.status },
      schedule!.intervalDays,
    );
    expect(nextDate).toBe("2026-08-17");
  });

  it("reschedule replaces the pending row's date without marking it missed or leaving a duplicate", () => {
    const { db } = createTestDatabase();

    createInjectionTreatment(db, { id: "inj-1", name: "Adalimumab", dose: "40mg" });
    createInitialInjectionSchedule(db, {
      id: "inj-sched-1",
      injectionTreatmentId: "inj-1",
      intervalDays: 14,
      effectiveFrom: "2026-08-01",
    });
    createPendingInjectionAdministration(db, {
      id: "inj-admin-1",
      injectionTreatmentId: "inj-1",
      injectionScheduleId: "inj-sched-1",
      scheduledFor: "2026-08-15",
    });

    rescheduleInjectionAdministration(
      db,
      {
        id: "inj-admin-1-rescheduled",
        injectionTreatmentId: "inj-1",
        injectionScheduleId: "inj-sched-1",
        scheduledFor: "2026-08-17",
      },
      "inj-admin-1",
    );

    const all = getAdministrationsForTreatment(db, "inj-1");
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("inj-admin-1-rescheduled");
    expect(all[0].scheduledFor).toBe("2026-08-17");
    expect(all[0].status).toBe("pending");
  });
});
