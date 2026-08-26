import { isAppointmentUpcoming } from "../upcomingAppointment";

describe("isAppointmentUpcoming", () => {
  it("is true exactly at the 14-day window boundary", () => {
    expect(isAppointmentUpcoming("2026-09-09", "2026-08-26")).toBe(true);
  });

  it("is false one day past the window boundary", () => {
    expect(isAppointmentUpcoming("2026-09-10", "2026-08-26")).toBe(false);
  });

  it("is true for today itself", () => {
    expect(isAppointmentUpcoming("2026-08-26", "2026-08-26")).toBe(true);
  });

  it("is false for a past appointment", () => {
    expect(isAppointmentUpcoming("2026-08-01", "2026-08-26")).toBe(false);
  });
});
