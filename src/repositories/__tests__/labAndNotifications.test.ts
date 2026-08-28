import { createTestDatabase } from "../../db/testUtils/testDatabase";
import {
  createLabResult,
  deleteLabResult,
  getLabResultById,
  getLabResultsByMarker,
  updateLabResult,
} from "../labResultRepository";
import { createLabReminder, getPendingLabReminders, markLabReminderStatus } from "../labReminderRepository";
import {
  createScheduledNotification,
  deleteScheduledNotificationsForSource,
  getScheduledNotificationsForSource,
} from "../scheduledNotificationRepository";

describe("lab repositories", () => {
  it("stores and retrieves results scoped by marker", () => {
    const { db } = createTestDatabase();
    createLabResult(db, { id: "lab-1", marker: "CRP", value: 6, unit: "mg/L", recordedDate: "2026-08-01" });
    createLabResult(db, { id: "lab-2", marker: "ESR", value: 12, unit: "mm/hr", recordedDate: "2026-08-01" });

    expect(getLabResultsByMarker(db, "CRP")).toHaveLength(1);
  });

  it("edits a lab result's value in place — no write-once rule for a corrigible user-entered fact", () => {
    const { db } = createTestDatabase();
    createLabResult(db, { id: "lab-1", marker: "CRP", value: 6, unit: "mg/L", recordedDate: "2026-08-01" });

    updateLabResult(db, "lab-1", { value: 6.5 });

    expect(getLabResultById(db, "lab-1")?.value).toBe(6.5);
  });

  it("deletes a lab result", () => {
    const { db } = createTestDatabase();
    createLabResult(db, { id: "lab-1", marker: "CRP", value: 6, unit: "mg/L", recordedDate: "2026-08-01" });

    deleteLabResult(db, "lab-1");

    expect(getLabResultById(db, "lab-1")).toBeUndefined();
    expect(getLabResultsByMarker(db, "CRP")).toHaveLength(0);
  });

  it("marks a lab reminder complete and removes it from the pending list", () => {
    const { db } = createTestDatabase();
    createLabReminder(db, { id: "reminder-1", label: "CRP check", dueDate: "2026-09-01" });

    expect(getPendingLabReminders(db)).toHaveLength(1);
    markLabReminderStatus(db, "reminder-1", "completed");
    expect(getPendingLabReminders(db)).toHaveLength(0);
  });
});

describe("scheduledNotification repository", () => {
  it("cancels every bookkeeping row for a source in one call", () => {
    const { db } = createTestDatabase();
    createScheduledNotification(db, {
      id: "notif-1",
      sourceType: "medication",
      sourceId: "med-1",
      notificationIdentifier: "os-id-1",
      scheduledFor: "2026-08-27T08:00:00.000Z",
    });
    createScheduledNotification(db, {
      id: "notif-2",
      sourceType: "medication",
      sourceId: "med-1",
      notificationIdentifier: "os-id-2",
      scheduledFor: "2026-08-28T08:00:00.000Z",
    });

    expect(getScheduledNotificationsForSource(db, "medication", "med-1")).toHaveLength(2);
    deleteScheduledNotificationsForSource(db, "medication", "med-1");
    expect(getScheduledNotificationsForSource(db, "medication", "med-1")).toHaveLength(0);
  });
});
