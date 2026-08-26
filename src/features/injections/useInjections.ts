import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { calculateNextInjectionDate } from "../../domain/scheduling";
import { addDays } from "../../domain/dateUtils";
import { useTranslation } from "../../localization";
import { db } from "../../db";
import {
  createInitialInjectionSchedule,
  createInjectionTreatment,
  createPendingInjectionAdministration,
  getActiveInjectionTreatments,
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

export function useInjections() {
  const { locale } = useTranslation();
  const [treatments, setTreatments] = useState(() => getActiveInjectionTreatments(db));

  const refresh = useCallback(() => setTreatments(getActiveInjectionTreatments(db)), []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

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

  return { treatments, addInjection, refresh };
}
