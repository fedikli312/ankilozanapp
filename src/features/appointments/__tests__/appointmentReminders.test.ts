import { createTestDatabase } from "../../../db/testUtils/testDatabase";
import { getScheduledNotificationsForSource } from "../../../repositories";
import * as client from "../../../notifications/client";
import { reconcileAppointmentReminder } from "../appointmentReminders";

jest.mock("../../../notifications/client", () => ({
  getNotificationPermissionStatusAsync: jest.fn(),
  requestNotificationPermissionAsync: jest.fn(),
  scheduleOneOffReminder: jest.fn(async () => "notif-appt-1"),
  cancelScheduledNotification: jest.fn(async () => undefined),
}));

const basePlan = {
  appointmentId: "appt-1",
  doctorOrInstitution: "Dr. Yilmaz",
  date: "2026-09-10",
  reminderLeadDays: 1,
  locale: "en" as const,
};

describe("reconcileAppointmentReminder", () => {
  beforeEach(() => jest.clearAllMocks());

  it("is disabled when reminderLeadDays is 0", async () => {
    const { db } = createTestDatabase();
    const outcome = await reconcileAppointmentReminder(db, { ...basePlan, reminderLeadDays: 0 });

    expect(outcome).toBe("disabled");
    expect(client.scheduleOneOffReminder).not.toHaveBeenCalled();
    expect(getScheduledNotificationsForSource(db, "appointment", "appt-1")).toHaveLength(0);
  });

  it("schedules one reminder the configured number of days before the appointment", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    const outcome = await reconcileAppointmentReminder(db, basePlan);

    expect(outcome).toBe("scheduled");
    expect(client.scheduleOneOffReminder).toHaveBeenCalledTimes(1);
    const rows = getScheduledNotificationsForSource(db, "appointment", "appt-1");
    expect(rows).toHaveLength(1);
    expect(rows[0].scheduledFor).toBe("2026-09-09T09:00");
  });

  it("does not schedule and reports permission-denied when the user declines", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("undetermined");
    (client.requestNotificationPermissionAsync as jest.Mock).mockResolvedValue("denied");

    const outcome = await reconcileAppointmentReminder(db, basePlan);

    expect(outcome).toBe("permission-denied");
    expect(getScheduledNotificationsForSource(db, "appointment", "appt-1")).toHaveLength(0);
  });

  it("cancels the previous reminder before scheduling the new one on a re-run (edit flow)", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    await reconcileAppointmentReminder(db, basePlan);
    await reconcileAppointmentReminder(db, { ...basePlan, date: "2026-09-17" });

    expect(client.cancelScheduledNotification).toHaveBeenCalledTimes(1);
    expect(getScheduledNotificationsForSource(db, "appointment", "appt-1")).toHaveLength(1);
  });
});
