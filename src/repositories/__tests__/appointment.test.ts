import { createTestDatabase } from "../../db/testUtils/testDatabase";
import {
  cancelAppointment,
  createAppointment,
  getAppointmentById,
  getPastAppointments,
  getUpcomingAppointments,
  updateAppointment,
} from "../appointmentRepository";

describe("appointment repository", () => {
  it("surfaces only scheduled appointments within the 14-day upcoming window", () => {
    const { db } = createTestDatabase();

    createAppointment(db, { id: "appt-in-window", type: "rheumatology", date: "2026-09-05" });
    createAppointment(db, { id: "appt-out-of-window", type: "rheumatology", date: "2026-10-01" });
    createAppointment(db, { id: "appt-past", type: "rheumatology", date: "2026-08-01" });

    const upcoming = getUpcomingAppointments(db, "2026-08-26");

    expect(upcoming.map((a) => a.id)).toEqual(["appt-in-window"]);
  });

  it("edits an appointment's fields in place", () => {
    const { db } = createTestDatabase();
    createAppointment(db, { id: "appt-1", type: "laboratory", date: "2026-09-05" });

    updateAppointment(db, "appt-1", { type: "rheumatology", doctorOrInstitution: "Dr. Yilmaz", date: "2026-09-10" });

    const updated = getAppointmentById(db, "appt-1");
    expect(updated?.type).toBe("rheumatology");
    expect(updated?.doctorOrInstitution).toBe("Dr. Yilmaz");
    expect(updated?.date).toBe("2026-09-10");
  });

  it("cancel sets status to cancelled and never removes the row (UX spec §H — never deleted)", () => {
    const { db } = createTestDatabase();
    createAppointment(db, { id: "appt-1", type: "rheumatology", date: "2026-09-05" });

    cancelAppointment(db, "appt-1");

    const cancelled = getAppointmentById(db, "appt-1");
    expect(cancelled?.status).toBe("cancelled");
    expect(cancelled).toBeDefined();
  });

  it("a cancelled appointment moves into the past list and drops out of upcoming, even if its date is still ahead", () => {
    const { db } = createTestDatabase();
    createAppointment(db, { id: "appt-1", type: "rheumatology", date: "2026-09-05" });

    cancelAppointment(db, "appt-1");

    expect(getUpcomingAppointments(db, "2026-08-26").map((a) => a.id)).not.toContain("appt-1");
    expect(getPastAppointments(db, "2026-08-26").map((a) => a.id)).toContain("appt-1");
  });
});
