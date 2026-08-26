import { useCallback, useState } from "react";

import { calculateNextInjectionDate } from "../../domain/scheduling";
import { addDays } from "../../domain/dateUtils";
import { db } from "../../db";
import { useTranslation } from "../../localization";
import {
  archiveInjectionTreatment,
  createPendingInjectionAdministration,
  getAdministrationsForTreatment,
  getCurrentInjectionSchedule,
  getInjectionTreatmentById,
  logInjectionAdministration,
  rescheduleInjectionAdministration,
} from "../../repositories";
import { generateId } from "../../shared/id";
import { todayDateOnly } from "../../shared/today";
import { reconcileInjectionReminders } from "./injectionReminders";

export function useInjectionDetail(injectionTreatmentId: string) {
  const { locale } = useTranslation();
  const [, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  const treatment = getInjectionTreatmentById(db, injectionTreatmentId);
  const schedule = getCurrentInjectionSchedule(db, injectionTreatmentId);
  const administrations = getAdministrationsForTreatment(db, injectionTreatmentId)
    .slice()
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));
  const pending = administrations.find((a) => a.status === "pending");

  const rescheduleReminders = useCallback(
    async (nextInjectionDate: string) => {
      if (!schedule) return "disabled" as const;
      return reconcileInjectionReminders(db, {
        injectionTreatmentId,
        nextInjectionDate,
        reminderLeadDays: schedule.reminderLeadDays,
        reminderOnScheduledDay: schedule.reminderOnScheduledDay,
        locale,
      });
    },
    [schedule, injectionTreatmentId, locale],
  );

  /** Completed today by default — the Today "Log now" action (UX spec §D). */
  const logCompleted = useCallback(async () => {
    if (!pending || !schedule) return;
    const actualDate = todayDateOnly();
    logInjectionAdministration(db, pending.id, "completed", actualDate);

    const nextDate = calculateNextInjectionDate(
      { scheduledFor: pending.scheduledFor, actualDate, status: "completed" },
      schedule.intervalDays,
    );
    createPendingInjectionAdministration(db, {
      id: generateId(),
      injectionTreatmentId,
      injectionScheduleId: schedule.id,
      scheduledFor: nextDate,
    });

    await rescheduleReminders(nextDate);
    refresh();
  }, [pending, schedule, injectionTreatmentId, rescheduleReminders, refresh]);

  const logMissed = useCallback(async () => {
    if (!pending || !schedule) return;
    logInjectionAdministration(db, pending.id, "missed", null);

    // No actual date — the domain function anchors to the originally
    // scheduled date instead (Tech Arch §F invariant 5).
    const nextDate = calculateNextInjectionDate(
      { scheduledFor: pending.scheduledFor, actualDate: null, status: "missed" },
      schedule.intervalDays,
    );
    createPendingInjectionAdministration(db, {
      id: generateId(),
      injectionTreatmentId,
      injectionScheduleId: schedule.id,
      scheduledFor: nextDate,
    });

    await rescheduleReminders(nextDate);
    refresh();
  }, [pending, schedule, injectionTreatmentId, rescheduleReminders, refresh]);

  /** Moves the single upcoming due date without treating it as missed and without touching the recurring interval (UX spec §G). */
  const rescheduleBy = useCallback(
    async (deltaDays: number) => {
      if (!pending || !schedule) return;
      const newDate = addDays(pending.scheduledFor, deltaDays);

      rescheduleInjectionAdministration(
        db,
        {
          id: generateId(),
          injectionTreatmentId,
          injectionScheduleId: schedule.id,
          scheduledFor: newDate,
        },
        pending.id,
      );

      await rescheduleReminders(newDate);
      refresh();
    },
    [pending, schedule, injectionTreatmentId, rescheduleReminders, refresh],
  );

  const archive = useCallback(() => {
    archiveInjectionTreatment(db, injectionTreatmentId, new Date().toISOString());
    refresh();
  }, [injectionTreatmentId, refresh]);

  return {
    treatment,
    schedule,
    administrations,
    nextInjectionDate: pending?.scheduledFor ?? null,
    logCompleted,
    logMissed,
    rescheduleBy,
    archive,
  };
}
