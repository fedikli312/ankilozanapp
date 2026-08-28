import { createTestDatabase } from "../../../db/testUtils/testDatabase";
import { createMedication } from "../../../repositories/medicationRepository";
import { createInitialSchedule } from "../../../repositories/medicationScheduleRepository";
import { createAppointment } from "../../../repositories/appointmentRepository";
import {
  getAdministrationsForMedication,
  getScheduledNotificationsForSource,
  getUserPreferences,
} from "../../../repositories";
import * as client from "../../../notifications/client";
import { runReconciliation } from "../runReconciliation";
import { todayDateOnly } from "../../../shared/today";

jest.mock("../../../notifications/client", () => ({
  getNotificationPermissionStatusAsync: jest.fn(),
  requestNotificationPermissionAsync: jest.fn(),
  scheduleDailyReminder: jest.fn(async () => "notif-daily"),
  scheduleWeeklyReminder: jest.fn(async () => "notif-weekly"),
  scheduleOneOffReminder: jest.fn(async () => `notif-oneoff-${Math.random()}`),
  cancelScheduledNotification: jest.fn(async () => undefined),
}));

describe("runReconciliation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("tops up medication administrations even when notification permission is denied", async () => {
    const { db } = createTestDatabase();
    createMedication(db, { id: "med-1", name: "Sulfasalazine", dose: "500mg" });
    createInitialSchedule(db, {
      id: "sched-1",
      medicationId: "med-1",
      frequencyType: "daily",
      effectiveFrom: "2026-08-20",
      timesOfDay: ["08:00"],
    });
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("denied");

    await runReconciliation(db, "en");

    expect(getAdministrationsForMedication(db, "med-1").length).toBeGreaterThan(0);
    expect(client.scheduleDailyReminder).not.toHaveBeenCalled();
  });

  it("tops up a custom-interval medication's reminder window when it has run low", async () => {
    const { db } = createTestDatabase();
    createMedication(db, { id: "med-1", name: "Methotrexate", dose: "15mg" });
    createInitialSchedule(db, {
      id: "sched-1",
      medicationId: "med-1",
      frequencyType: "custom_interval",
      intervalDays: 7,
      effectiveFrom: todayDateOnly(),
      timesOfDay: ["09:00"],
    });
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    await runReconciliation(db, "en");

    expect(getScheduledNotificationsForSource(db, "medication", "med-1")).toHaveLength(8);
    expect(client.scheduleOneOffReminder).toHaveBeenCalledTimes(8);

    jest.clearAllMocks();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    // Re-running with an already-full window schedules nothing new.
    await runReconciliation(db, "en");
    expect(client.scheduleOneOffReminder).not.toHaveBeenCalled();
  });

  it("schedules a reminder for an upcoming appointment that doesn't have one yet", async () => {
    const { db } = createTestDatabase();
    createAppointment(db, { id: "appt-1", type: "rheumatology", date: "2026-09-10", reminderLeadDays: 1 });
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    await runReconciliation(db, "en");

    expect(getScheduledNotificationsForSource(db, "appointment", "appt-1")).toHaveLength(1);
  });

  it("persists the current timezone after a successful pass", async () => {
    const { db } = createTestDatabase();
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("granted");

    await runReconciliation(db, "en");

    const prefs = getUserPreferences(db);
    expect(prefs?.lastKnownTimezone).toEqual(expect.any(String));
  });

  it("does not attempt any scheduling call when permission was never granted, but still persists nothing extra", async () => {
    const { db } = createTestDatabase();
    createAppointment(db, { id: "appt-1", type: "rheumatology", date: "2026-09-10", reminderLeadDays: 1 });
    (client.getNotificationPermissionStatusAsync as jest.Mock).mockResolvedValue("undetermined");

    await runReconciliation(db, "en");

    expect(client.scheduleOneOffReminder).not.toHaveBeenCalled();
    expect(client.requestNotificationPermissionAsync).not.toHaveBeenCalled();
    expect(getScheduledNotificationsForSource(db, "appointment", "appt-1")).toHaveLength(0);
  });
});
