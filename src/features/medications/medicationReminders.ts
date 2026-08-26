import type { SupportedLocale } from "../../localization";
import { buildNotificationContent } from "../../notifications/copy";
import {
  cancelScheduledNotification,
  getNotificationPermissionStatusAsync,
  requestNotificationPermissionAsync,
  scheduleDailyReminder,
  scheduleOneOffReminder,
  scheduleWeeklyReminder,
} from "../../notifications/client";
import { shouldAttemptScheduling } from "../../notifications/reconciliation";
import { addDays } from "../../domain/dateUtils";
import { generateMedicationOccurrences } from "../../domain/scheduling";
import type { FrequencyType } from "../../domain/scheduling/types";
import { CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE } from "../../domain/constants";
import {
  createScheduledNotification,
  deleteScheduledNotificationsForSource,
  getScheduledNotificationsForSource,
  type AppDatabase,
} from "../../repositories";
import { generateId } from "../../shared/id";

export type MedicationReminderPlan = {
  medicationId: string;
  frequencyType: FrequencyType;
  intervalDays: number | null;
  effectiveFrom: string;
  daysOfWeek: number[];
  /** HH:mm, local wall-clock. */
  timesOfDay: string[];
  reminderEnabled: boolean;
  locale: SupportedLocale;
};

export type ReminderOutcome = "scheduled" | "disabled" | "permission-denied";

/**
 * Cancels every reminder currently bookkept for this medication — always
 * run first, so an edit never leaves a stale/duplicate notification behind
 * (Tech Arch §G event-driven cancellation).
 */
async function cancelExistingReminders(db: AppDatabase, medicationId: string): Promise<void> {
  const existing = getScheduledNotificationsForSource(db, "medication", medicationId);
  await Promise.all(existing.map((row) => cancelScheduledNotification(row.notificationIdentifier)));
  deleteScheduledNotificationsForSource(db, "medication", medicationId);
}

/**
 * Application-service layer wiring domain scheduling + the notifications
 * client + the ScheduledNotification bookkeeping repository together for
 * one medication. This is the one place permission is requested in this
 * feature — only reached when the user saves a medication with its
 * reminder toggle on (contextual, per the approved onboarding decision;
 * never requested at launch).
 */
export async function reconcileMedicationReminders(
  db: AppDatabase,
  plan: MedicationReminderPlan,
): Promise<ReminderOutcome> {
  await cancelExistingReminders(db, plan.medicationId);

  if (!plan.reminderEnabled) return "disabled";

  let status = await getNotificationPermissionStatusAsync();
  if (status === "undetermined") {
    status = await requestNotificationPermissionAsync();
  }
  if (!shouldAttemptScheduling(status)) return "permission-denied";

  const content = buildNotificationContent({ locale: plan.locale, detailOptIn: false });

  for (const time of plan.timesOfDay) {
    const [hour, minute] = time.split(":").map(Number);

    if (plan.frequencyType === "daily") {
      const identifier = await scheduleDailyReminder({ content, hour, minute });
      createScheduledNotification(db, {
        id: generateId(),
        sourceType: "medication",
        sourceId: plan.medicationId,
        notificationIdentifier: identifier,
        scheduledFor: `${plan.effectiveFrom}T${time}`,
        isRepeating: true,
      });
      continue;
    }

    if (plan.frequencyType === "specific_days") {
      for (const dayOfWeek of plan.daysOfWeek) {
        const identifier = await scheduleWeeklyReminder({ content, dayOfWeek, hour, minute });
        createScheduledNotification(db, {
          id: generateId(),
          sourceType: "medication",
          sourceId: plan.medicationId,
          notificationIdentifier: identifier,
          scheduledFor: `${plan.effectiveFrom}T${time}`,
          isRepeating: true,
        });
      }
      continue;
    }

    // custom_interval — the initial rolling window of one-off reminders (Tech Arch §G).
    const intervalDays = plan.intervalDays ?? 1;
    const occurrences = generateMedicationOccurrences({
      schedule: {
        id: "planning-only",
        frequencyType: "custom_interval",
        intervalDays,
        effectiveFrom: plan.effectiveFrom,
        effectiveUntil: null,
      },
      rangeStart: plan.effectiveFrom,
      rangeEnd: addDays(plan.effectiveFrom, intervalDays * CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE + 1),
    }).slice(0, CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE);

    for (const date of occurrences) {
      const identifier = await scheduleOneOffReminder({
        content,
        date: new Date(`${date}T${time}:00`),
      });
      createScheduledNotification(db, {
        id: generateId(),
        sourceType: "medication",
        sourceId: plan.medicationId,
        notificationIdentifier: identifier,
        scheduledFor: `${date}T${time}`,
        isRepeating: false,
      });
    }
  }

  return "scheduled";
}
