import { createTestDatabase } from "../../../db/testUtils/testDatabase";
import { getScheduledNotificationsForSource } from "../../../repositories";
import * as client from "../../../notifications/client";
import { reconcileInjectionReminders } from "../injectionReminders";

jest.mock("../../../notifications/client", () => ({
  getNotificationPermissionStatusAsync: jest.fn(),
  requestNotificationPermissionAsync: jest.fn(),
  scheduleOneOffReminder: jest.fn(async () => "notif-1"),
  cancelScheduledNotification: jest.fn(async () => undefined),
}));

const basePlan = {
  injectionTreatmentId: "inj-1",
  nextInjectionDate: "2026-09-10",
  reminderLeadDays: 1,
  reminderOnScheduledDay: true,
  locale: "en" as const,
};

describe("reconcileInjectionReminders", () => {
  beforeEach(() => jest.clearAllMocks());

  it("is disabled when both reminderLeadDays is 0 and reminderOnScheduledDay is false", async () => {
    const { db } = createTestDatabase();
    const outcome = await reconcileInjectionReminders(db, {
      ...basePlan,
      reminderLeadDays: 0,
      reminderOnScheduledDay: false,
    });
    expect(outcome).toBe("disabled");
    expect(client.scheduleOneOffReminder).not.toHaveBeenCalled();
  });

  it("schedules both the lead-day and scheduled-day reminders by default", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    const outcome = await reconcileInjectionReminders(db, basePlan);

    expect(outcome).toBe("scheduled");
    expect(client.scheduleOneOffReminder).toHaveBeenCalledTimes(2);
    expect(getScheduledNotificationsForSource(db, "injection", "inj-1")).toHaveLength(2);
  });

  it("cancels the previous reminders before scheduling new ones (re-run after logging an injection)", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    await reconcileInjectionReminders(db, basePlan);
    await reconcileInjectionReminders(db, { ...basePlan, nextInjectionDate: "2026-09-24" });

    expect(client.cancelScheduledNotification).toHaveBeenCalledTimes(2);
    expect(getScheduledNotificationsForSource(db, "injection", "inj-1")).toHaveLength(2);
  });
});
