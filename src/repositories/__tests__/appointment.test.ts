import { createTestDatabase } from "../../db/testUtils/testDatabase";
import { createAppointment, getUpcomingAppointments } from "../appointmentRepository";

describe("appointment repository", () => {
  it("surfaces only scheduled appointments within the 14-day upcoming window", () => {
    const { db } = createTestDatabase();

    createAppointment(db, { id: "appt-in-window", type: "rheumatology", date: "2026-09-05" });
    createAppointment(db, { id: "appt-out-of-window", type: "rheumatology", date: "2026-10-01" });
    createAppointment(db, { id: "appt-past", type: "rheumatology", date: "2026-08-01" });

    const upcoming = getUpcomingAppointments(db, "2026-08-26");

    expect(upcoming.map((a) => a.id)).toEqual(["appt-in-window"]);
  });
});
