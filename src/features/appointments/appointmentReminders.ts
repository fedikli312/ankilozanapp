import { addDays } from "../../domain/dateUtils";
import type { SupportedLocale } from "../../localization";
import {
  cancelScheduledNotification,
  getNotificationPermissionStatusAsync,
  requestNotificationPermissionAsync,
  scheduleOneOffReminder,
} from "../../notifications/client";
import { buildNotificationContent } from "../../notifications/copy";
import { shouldAttemptScheduling } from "../../notifications/reconciliation";
import {
  createScheduledNotification,
  deleteScheduledNotificationsForSource,
  getScheduledNotificationsForSource,
  getUserPreferences,
  type AppDatabase,
} from "../../repositories";
import { generateId } from "../../shared/id";

/** UX spec §H/§N don't specify a time of day for appointment reminders — 09:00 local, same default as injections, for interaction consistency. */
export const DEFAULT_REMINDER_HOUR = 9;

export type AppointmentReminderPlan = {
  appointmentId: string;
  /** Only ever used when the user has explicitly opted into detailed notification content (UX spec §N). */
  doctorOrInstitution?: string | null;
  /** Date-only. */
  date: string;
  reminderLeadDays: number;
  locale: SupportedLocale;
};

export type ReminderOutcome = "scheduled" | "disabled" | "permission-denied";

async function cancelExistingReminders(db: AppDatabase, appointmentId: string): Promise<void> {
  const existing = getScheduledNotificationsForSource(db, "appointment", appointmentId);
  await Promise.all(existing.map((row) => cancelScheduledNotification(row.notificationIdentifier)));
  deleteScheduledNotificationsForSource(db, "appointment", appointmentId);
}

/**
 * One reminder, `reminderLeadDays` before the appointment date (UX spec §H
 * default: one day before). `reminderLeadDays: 0` means "no reminder" — an
 * appointment reminder, unlike injections, has no separate "on the day"
 * flag (Tech Arch §D schema has a single `reminderLeadDays` column).
 * Re-run after every create/edit and by reconciliation (Phase 17), always
 * cancel-then-recreate so an edited date never leaves a stale notification.
 */
export async function reconcileAppointmentReminder(
  db: AppDatabase,
  plan: AppointmentReminderPlan,
): Promise<ReminderOutcome> {
  await cancelExistingReminders(db, plan.appointmentId);

  if (plan.reminderLeadDays <= 0) return "disabled";

  let status = await getNotificationPermissionStatusAsync();
  if (status === "undetermined") {
    status = await requestNotificationPermissionAsync();
  }
  if (!shouldAttemptScheduling(status)) return "permission-denied";

  const detailOptIn = getUserPreferences(db)?.notificationDetailOptIn ?? false;
  const content = buildNotificationContent({
    locale: plan.locale,
    detailOptIn,
    detailedBody: plan.doctorOrInstitution ?? undefined,
  });

  const reminderDate = addDays(plan.date, -plan.reminderLeadDays);
  const identifier = await scheduleOneOffReminder({
    content,
    date: new Date(`${reminderDate}T${String(DEFAULT_REMINDER_HOUR).padStart(2, "0")}:00:00`),
  });
  createScheduledNotification(db, {
    id: generateId(),
    sourceType: "appointment",
    sourceId: plan.appointmentId,
    notificationIdentifier: identifier,
    scheduledFor: `${reminderDate}T${String(DEFAULT_REMINDER_HOUR).padStart(2, "0")}:00`,
    isRepeating: false,
  });

  return "scheduled";
}
