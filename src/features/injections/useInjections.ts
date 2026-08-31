import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { calculateNextInjectionDate } from "../../domain/scheduling";
import { addDays, diffInDays } from "../../domain/dateUtils";
import { useTranslation } from "../../localization";
import { db } from "../../db";
import {
  createInitialInjectionSchedule,
  createInjectionTreatment,
  createPendingInjectionAdministration,
  getAdministrationsForTreatment,
  getAllInjectionTreatments,
  logInjectionAdministration,
} from "../../repositories";
import { generateId } from "../../shared/id";
import { todayDateOnly } from "../../shared/today";
import { reconcileInjectionReminders, type ReminderOutcome } from "./injectionReminders";

export type CreateInjectionFormInput = {
  name: string;
  dose: string;
  intervalDays: number;
  /** 0 = today. */
  daysSinceLastInjection: number;
  reminderLeadDays: number;
  reminderOnScheduledDay: boolean;
  reminderEnabled: boolean;
};

export type InjectionListRow = {
  id: string;
  name: string;
  dose: string;
  archivedAt: string | null;
  nextInjectionDate: string | null;
  nextInjectionDaysLeft: number | null;
};

function buildRow(treatmentId: string, name: string, dose: string, archivedAt: string | null): InjectionListRow {
  const pending = getAdministrationsForTreatment(db, treatmentId).find((a) => a.status === "pending");
  const nextInjectionDate = pending?.scheduledFor ?? null;
  const nextInjectionDaysLeft = nextInjectionDate ? diffInDays(todayDateOnly(), nextInjectionDate) : null;

  return { id: treatmentId, name, dose, archivedAt, nextInjectionDate, nextInjectionDaysLeft };
}

export function useInjections() {
  const { locale } = useTranslation();
  const [rows, setRows] = useState(() => getAllInjectionTreatments(db).map((t) => buildRow(t.id, t.name, t.dose, t.archivedAt)));

  const refresh = useCallback(() => {
    setRows(getAllInjectionTreatments(db).map((t) => buildRow(t.id, t.name, t.dose, t.archivedAt)));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const treatments = rows.filter((r) => !r.archivedAt);
  const archivedTreatments = rows.filter((r) => r.archivedAt);

  const addInjection = useCallback(
    async (input: CreateInjectionFormInput): Promise<ReminderOutcome> => {
      const injectionTreatmentId = generateId();
      const scheduleId = generateId();
      const today = todayDateOnly();
      const lastInjectionDate = addDays(today, -input.daysSinceLastInjection);

      // No dedicated reminderEnabled column on InjectionSchedule (Tech Arch
      // §D) — "off" is reminderLeadDays: 0 + reminderOnScheduledDay: false.
      const reminderLeadDays = input.reminderEnabled ? input.reminderLeadDays : 0;
      const reminderOnScheduledDay = input.reminderEnabled && input.reminderOnScheduledDay;

      createInjectionTreatment(db, { id: injectionTreatmentId, name: input.name, dose: input.dose });
      createInitialInjectionSchedule(db, {
        id: scheduleId,
        injectionTreatmentId,
        intervalDays: input.intervalDays,
        reminderLeadDays,
        reminderOnScheduledDay,
        effectiveFrom: today,
      });

      // Records the reported last injection as already-completed history...
      const lastAdministrationId = generateId();
      createPendingInjectionAdministration(db, {
        id: lastAdministrationId,
        injectionTreatmentId,
        injectionScheduleId: scheduleId,
        scheduledFor: lastInjectionDate,
      });
      logInjectionAdministration(db, lastAdministrationId, "completed", lastInjectionDate);

      // ...then materializes the single pending "next injection" row Today needs (PRD §5 activation).
      const nextDate = calculateNextInjectionDate(
        { scheduledFor: lastInjectionDate, actualDate: lastInjectionDate, status: "completed" },
        input.intervalDays,
      );
      createPendingInjectionAdministration(db, {
        id: generateId(),
        injectionTreatmentId,
        injectionScheduleId: scheduleId,
        scheduledFor: nextDate,
      });

      let outcome: ReminderOutcome = "disabled";
      try {
        outcome = await reconcileInjectionReminders(db, {
          injectionTreatmentId,
          treatmentName: input.name,
          nextInjectionDate: nextDate,
          reminderLeadDays,
          reminderOnScheduledDay,
          locale,
        });
      } catch {
        outcome = "permission-denied";
      }

      refresh();
      return outcome;
    },
    [locale, refresh],
  );

  return { treatments, archivedTreatments, addInjection, refresh };
}
