import { CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE } from "../../domain/constants";
import { getCustomIntervalReminderWindow } from "../../domain/scheduling";
import type { SupportedLocale } from "../../localization";
import { getNotificationPermissionStatusAsync, scheduleOneOffReminder } from "../../notifications/client";
import { buildNotificationContent } from "../../notifications/copy";
import { getCurrentTimezone, hasTimezoneChanged, shouldAttemptScheduling } from "../../notifications/reconciliation";
import {
  createScheduledNotification,
  getActiveInjectionTreatments,
  getActiveMedications,
  getAdministrationsForTreatment,
  getAllUpcomingAppointments,
  getCurrentInjectionSchedule,
  getCurrentSchedule,
  getScheduleDays,
  getScheduleTimes,
  getScheduledNotificationsForSource,
  getUserPreferences,
  updateUserPreferences,
  type AppDatabase,
} from "../../repositories";
import { generateId } from "../../shared/id";
import { todayDateOnly } from "../../shared/today";
import { generateDueAdministrations } from "../medications/medicationAdministrations";
import { reconcileMedicationReminders } from "../medications/medicationReminders";
import { reconcileInjectionReminders } from "../injections/injectionReminders";
import { reconcileAppointmentReminder } from "../appointments/appointmentReminders";

/**
 * The Phase 17 orchestrator — wires the reconciliation primitives built in
 * Phase 6 (src/notifications/reconciliation.ts) into an actual app-lifecycle
 * pass (Tech Arch §G). Runs on launch, on foreground, and can be re-run
 * after any reminder-configuration or timezone change; individual add/edit
 * flows already reconcile their own entity immediately on save, so this is
 * the safety net that catches drift between those events — a permission
 * grant that arrived late, a custom-interval window that's run low, or a
 * detected timezone change.
 *
 * Never requests notification permission — only reads the current status
 * and skips scheduling work when it isn't granted, per the approved rule
 * that permission is only ever requested from a contextual save action.
 */
export async function runReconciliation(db: AppDatabase, locale: SupportedLocale): Promise<void> {
  const today = todayDateOnly();

  // Administration top-up is pure data, independent of notification permission — always safe to run.
  for (const medication of getActiveMedications(db)) {
    const schedule = getCurrentSchedule(db, medication.id);
    if (!schedule) continue;
    const days = getScheduleDays(db, schedule.id).map((d) => d.dayOfWeek);
    const times = getScheduleTimes(db, schedule.id).map((t) => t.timeOfDay);
    generateDueAdministrations(db, medication.id, schedule, days, times);
  }

  const status = await getNotificationPermissionStatusAsync();
  if (!shouldAttemptScheduling(status)) return;

  const preferences = getUserPreferences(db);
  const currentTimezone = getCurrentTimezone();
  const timezoneChanged = hasTimezoneChanged(preferences?.lastKnownTimezone ?? null, currentTimezone);
  const detailOptIn = preferences?.notificationDetailOptIn ?? false;

  // Custom-interval medication reminder window — top up what's missing, or fully reschedule on a timezone change.
  for (const medication of getActiveMedications(db)) {
    const schedule = getCurrentSchedule(db, medication.id);
    if (!schedule || schedule.frequencyType !== "custom_interval" || !schedule.reminderEnabled) continue;

    const times = getScheduleTimes(db, schedule.id).map((t) => t.timeOfDay);
    const time = times[0] ?? "08:00";
    const intervalDays = schedule.intervalDays ?? 1;

    if (timezoneChanged) {
      await reconcileMedicationReminders(db, {
        medicationId: medication.id,
        medicationName: medication.name,
        frequencyType: schedule.frequencyType,
        intervalDays: schedule.intervalDays,
        effectiveFrom: schedule.effectiveFrom,
        daysOfWeek: [],
        timesOfDay: [time],
        reminderEnabled: true,
        locale,
      });
      continue;
    }

    const existingFutureDates = getScheduledNotificationsForSource(db, "medication", medication.id)
      .map((row) => row.scheduledFor.slice(0, 10))
      .filter((date) => date >= today);

    const missing = CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE - existingFutureDates.length;
    if (missing <= 0) continue;

    const anchor = existingFutureDates.length > 0 ? existingFutureDates.sort().slice(-1)[0] : schedule.effectiveFrom;
    const newDates = getCustomIntervalReminderWindow(anchor, intervalDays, missing);
    const content = buildNotificationContent({ locale, detailOptIn, detailedBody: medication.name });

    for (const date of newDates) {
      const identifier = await scheduleOneOffReminder({ content, date: new Date(`${date}T${time}:00`) });
      createScheduledNotification(db, {
        id: generateId(),
        sourceType: "medication",
        sourceId: medication.id,
        notificationIdentifier: identifier,
        scheduledFor: `${date}T${time}`,
        isRepeating: false,
      });
    }
  }

  // Appointment reminders — fill any future appointment missing a bookkept reminder (a permission grant that arrived late), or reschedule all on a timezone change.
  for (const appointment of getAllUpcomingAppointments(db, today)) {
    if (appointment.reminderLeadDays <= 0) continue;
    const existing = getScheduledNotificationsForSource(db, "appointment", appointment.id);
    if (existing.length > 0 && !timezoneChanged) continue;

    await reconcileAppointmentReminder(db, {
      appointmentId: appointment.id,
      doctorOrInstitution: appointment.doctorOrInstitution,
      date: appointment.date,
      reminderLeadDays: appointment.reminderLeadDays,
      locale,
    });
  }

  // Injection reminders are reconciled immediately on every add/log/reschedule, so only a timezone change needs a re-run here.
  if (timezoneChanged) {
    for (const treatment of getActiveInjectionTreatments(db)) {
      const schedule = getCurrentInjectionSchedule(db, treatment.id);
      const pending = getAdministrationsForTreatment(db, treatment.id).find((a) => a.status === "pending");
      if (!schedule || !pending) continue;

      await reconcileInjectionReminders(db, {
        injectionTreatmentId: treatment.id,
        treatmentName: treatment.name,
        nextInjectionDate: pending.scheduledFor,
        reminderLeadDays: schedule.reminderLeadDays,
        reminderOnScheduledDay: schedule.reminderOnScheduledDay,
        locale,
      });
    }
  }

  updateUserPreferences(db, { lastKnownTimezone: currentTimezone });
}
