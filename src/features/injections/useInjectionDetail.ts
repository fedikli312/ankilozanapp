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
        treatmentName: treatment?.name ?? "",
        nextInjectionDate,
        reminderLeadDays: schedule.reminderLeadDays,
        reminderOnScheduledDay: schedule.reminderOnScheduledDay,
        locale,
      });
    },
    [schedule, treatment, injectionTreatmentId, locale],
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

  /**
   * Corrects an already-resolved historical row (Furkan-requested Medication
   * + Injection Detail restructuring, §8) — a thin wrapper around the same
   * `logInjectionAdministration` repository call `logCompleted`/`logMissed`
   * already use, just parameterized by an explicit id instead of always
   * targeting the single current `pending` row. Deliberately does NOT
   * create a new pending row or touch `nextInjectionDate`/reminders the way
   * `logCompleted`/`logMissed` do — those side effects only make sense when
   * resolving the actual current dose, never when editing old history. No
   * new domain/repository behavior: `logInjectionAdministration` already
   * allows changing any administration's status by id (Tech Arch §F
   * invariant 1 only protects `scheduledFor`, not `status`).
   */
  const correctAdministration = useCallback(
    (administrationId: string, status: "completed" | "missed") => {
      logInjectionAdministration(db, administrationId, status, status === "completed" ? todayDateOnly() : null);
      refresh();
    },
    [refresh],
  );

  return {
    treatment,
    schedule,
    administrations,
    nextInjectionDate: pending?.scheduledFor ?? null,
    logCompleted,
    logMissed,
    rescheduleBy,
    archive,
    correctAdministration,
  };
}
