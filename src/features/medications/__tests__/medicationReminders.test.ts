import { createTestDatabase } from "../../../db/testUtils/testDatabase";
import { getScheduledNotificationsForSource } from "../../../repositories";
import * as client from "../../../notifications/client";
import { reconcileMedicationReminders } from "../medicationReminders";

jest.mock("../../../notifications/client", () => ({
  getNotificationPermissionStatusAsync: jest.fn(),
  requestNotificationPermissionAsync: jest.fn(),
  scheduleDailyReminder: jest.fn(async () => "notif-daily-1"),
  scheduleWeeklyReminder: jest.fn(async () => "notif-weekly-1"),
  scheduleOneOffReminder: jest.fn(async () => "notif-oneoff-1"),
  cancelScheduledNotification: jest.fn(async () => undefined),
}));

const basePlan = {
  medicationId: "med-1",
  medicationName: "Sulfasalazine",
  frequencyType: "daily" as const,
  intervalDays: null,
  effectiveFrom: "2026-08-26",
  daysOfWeek: [] as number[],
  timesOfDay: ["08:00"],
  reminderEnabled: true,
  locale: "en" as const,
};

describe("reconcileMedicationReminders", () => {
  beforeEach(() => jest.clearAllMocks());

  it("schedules nothing and creates no bookkeeping row when the reminder toggle is off", async () => {
    const { db } = createTestDatabase();
    const outcome = await reconcileMedicationReminders(db, { ...basePlan, reminderEnabled: false });

    expect(outcome).toBe("disabled");
    expect(client.scheduleDailyReminder).not.toHaveBeenCalled();
    expect(getScheduledNotificationsForSource(db, "medication", "med-1")).toHaveLength(0);
  });

  it("requests permission only when undetermined, and schedules once granted", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("undetermined");
    (client.requestNotificationPermissionAsync as jest.Mock).mockResolvedValue("granted");

    const outcome = await reconcileMedicationReminders(db, basePlan);

    expect(outcome).toBe("scheduled");
    expect(client.requestNotificationPermissionAsync).toHaveBeenCalledTimes(1);
    expect(client.scheduleDailyReminder).toHaveBeenCalledTimes(1);
    expect(getScheduledNotificationsForSource(db, "medication", "med-1")).toHaveLength(1);
  });

  it("never requests permission again once already granted", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    await reconcileMedicationReminders(db, basePlan);

    expect(client.requestNotificationPermissionAsync).not.toHaveBeenCalled();
  });

  it("does not schedule and reports permission-denied when the user declines", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("undetermined");
    (client.requestNotificationPermissionAsync as jest.Mock).mockResolvedValue("denied");

    const outcome = await reconcileMedicationReminders(db, basePlan);

    expect(outcome).toBe("permission-denied");
    expect(getScheduledNotificationsForSource(db, "medication", "med-1")).toHaveLength(0);
  });

  it("cancels every previously scheduled reminder before scheduling the new ones on a re-run (edit flow)", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    await reconcileMedicationReminders(db, basePlan);
    await reconcileMedicationReminders(db, basePlan);

    expect(client.cancelScheduledNotification).toHaveBeenCalledTimes(1);
    expect(client.cancelScheduledNotification).toHaveBeenCalledWith("notif-daily-1");
    expect(getScheduledNotificationsForSource(db, "medication", "med-1")).toHaveLength(1);
  });

  it("creates one bookkeeping row per selected weekday for specific_days schedules", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    await reconcileMedicationReminders(db, {
      ...basePlan,
      frequencyType: "specific_days",
      daysOfWeek: [1, 3, 5],
    });

    expect(client.scheduleWeeklyReminder).toHaveBeenCalledTimes(3);
    expect(getScheduledNotificationsForSource(db, "medication", "med-1")).toHaveLength(3);
  });

  it("schedules up to the rolling window size for custom_interval schedules", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    await reconcileMedicationReminders(db, {
      ...basePlan,
      frequencyType: "custom_interval",
      intervalDays: 5,
    });

    expect(client.scheduleOneOffReminder).toHaveBeenCalledTimes(8);
  });
});
