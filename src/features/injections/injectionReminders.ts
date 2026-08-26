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
  type AppDatabase,
} from "../../repositories";
import { generateId } from "../../shared/id";

/** UX spec §G/§N don't specify a time of day for injection reminders — 09:00 local is this feature's default. */
const DEFAULT_REMINDER_HOUR = 9;

export type InjectionReminderPlan = {
  injectionTreatmentId: string;
  nextInjectionDate: string;
  /**
   * `InjectionSchedule` (Tech Arch §D) has no dedicated `reminderEnabled`
   * column — "reminders off" is represented by `reminderLeadDays: 0` and
   * `reminderOnScheduledDay: false` together, so this plan mirrors the
   * schema exactly rather than inventing a field it doesn't have.
   */
  reminderLeadDays: number;
  reminderOnScheduledDay: boolean;
  locale: SupportedLocale;
};

export type ReminderOutcome = "scheduled" | "disabled" | "permission-denied";

async function cancelExistingReminders(db: AppDatabase, injectionTreatmentId: string): Promise<void> {
  const existing = getScheduledNotificationsForSource(db, "injection", injectionTreatmentId);
  await Promise.all(existing.map((row) => cancelScheduledNotification(row.notificationIdentifier)));
  deleteScheduledNotificationsForSource(db, "injection", injectionTreatmentId);
}

/**
 * Recalculated and rescheduled after every logged administration (Tech
 * Arch §G) — never a repeating trigger, since the next date can drift from
 * the "ideal" schedule if logged early/late.
 */
export async function reconcileInjectionReminders(
  db: AppDatabase,
  plan: InjectionReminderPlan,
): Promise<ReminderOutcome> {
  await cancelExistingReminders(db, plan.injectionTreatmentId);

  const remindersEnabled = plan.reminderLeadDays > 0 || plan.reminderOnScheduledDay;
  if (!remindersEnabled) return "disabled";

  let status = await getNotificationPermissionStatusAsync();
  if (status === "undetermined") {
    status = await requestNotificationPermissionAsync();
  }
  if (!shouldAttemptScheduling(status)) return "permission-denied";

  const content = buildNotificationContent({ locale: plan.locale, detailOptIn: false });

  const dates: string[] = [];
  if (plan.reminderLeadDays > 0) dates.push(addDays(plan.nextInjectionDate, -plan.reminderLeadDays));
  if (plan.reminderOnScheduledDay) dates.push(plan.nextInjectionDate);

  for (const date of dates) {
    const identifier = await scheduleOneOffReminder({
      content,
      date: new Date(`${date}T${String(DEFAULT_REMINDER_HOUR).padStart(2, "0")}:00:00`),
    });
    createScheduledNotification(db, {
      id: generateId(),
      sourceType: "injection",
      sourceId: plan.injectionTreatmentId,
      notificationIdentifier: identifier,
      scheduledFor: `${date}T${String(DEFAULT_REMINDER_HOUR).padStart(2, "0")}:00`,
      isRepeating: false,
    });
  }

  return "scheduled";
}
