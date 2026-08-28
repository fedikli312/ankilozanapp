import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { db } from "../../db";
import { useTranslation } from "../../localization";
import {
  createAppointment,
  getAllUpcomingAppointments,
  getPastAppointments,
  type CreateAppointmentInput,
} from "../../repositories";
import { generateId } from "../../shared/id";
import { addDays } from "../../domain/dateUtils";
import { todayDateOnly } from "../../shared/today";
import { reconcileAppointmentReminder, type ReminderOutcome } from "./appointmentReminders";

export type CreateAppointmentFormInput = {
  type: CreateAppointmentInput["type"];
  doctorOrInstitution?: string;
  /** 0 = today. */
  daysFromToday: number;
  time?: string;
  notes?: string;
  reminderEnabled: boolean;
  reminderLeadDays: number;
};

export function useAppointments() {
  const { locale } = useTranslation();
  const today = todayDateOnly();
  const [, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const upcoming = getAllUpcomingAppointments(db, today);
  const past = getPastAppointments(db, today);

  const addAppointment = useCallback(
    async (input: CreateAppointmentFormInput): Promise<ReminderOutcome> => {
      const appointmentId = generateId();
      const date = addDays(today, input.daysFromToday);
      const reminderLeadDays = input.reminderEnabled ? input.reminderLeadDays : 0;

      createAppointment(db, {
        id: appointmentId,
        type: input.type,
        doctorOrInstitution: input.doctorOrInstitution,
        date,
        time: input.time,
        notes: input.notes,
        reminderLeadDays,
      });

      let outcome: ReminderOutcome = "disabled";
      try {
        outcome = await reconcileAppointmentReminder(db, {
          appointmentId,
          doctorOrInstitution: input.doctorOrInstitution,
          date,
          reminderLeadDays,
          locale,
        });
      } catch {
        outcome = "permission-denied";
      }

      refresh();
      return outcome;
    },
    [locale, refresh, today],
  );

  return { upcoming, past, addAppointment, refresh };
}
