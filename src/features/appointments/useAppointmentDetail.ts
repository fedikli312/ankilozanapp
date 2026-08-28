import { useCallback, useState } from "react";

import { db } from "../../db";
import { useTranslation } from "../../localization";
import {
  cancelAppointment,
  getAppointmentById,
  updateAppointment,
  type CreateAppointmentInput,
} from "../../repositories";
import { reconcileAppointmentReminder, type ReminderOutcome } from "./appointmentReminders";

export type EditAppointmentInput = {
  type: CreateAppointmentInput["type"];
  doctorOrInstitution?: string;
  /** Date-only. Edited directly here (unlike add, where it's a relative-day offset) since the existing date is the natural starting point. */
  date: string;
  time?: string;
  notes?: string;
  reminderEnabled: boolean;
  reminderLeadDays: number;
};

export function useAppointmentDetail(appointmentId: string) {
  const { locale } = useTranslation();
  const [, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  const appointment = getAppointmentById(db, appointmentId);

  /** Any field editable until the date passes (UX spec §H) — the screen layer decides when to offer this, this hook doesn't gate it. */
  const edit = useCallback(
    async (input: EditAppointmentInput): Promise<ReminderOutcome> => {
      const reminderLeadDays = input.reminderEnabled ? input.reminderLeadDays : 0;

      updateAppointment(db, appointmentId, {
        type: input.type,
        doctorOrInstitution: input.doctorOrInstitution,
        date: input.date,
        time: input.time,
        notes: input.notes,
        reminderLeadDays,
      });

      let outcome: ReminderOutcome = "disabled";
      try {
        outcome = await reconcileAppointmentReminder(db, {
          appointmentId,
          doctorOrInstitution: input.doctorOrInstitution,
          date: input.date,
          reminderLeadDays,
          locale,
        });
      } catch {
        outcome = "permission-denied";
      }

      refresh();
      return outcome;
    },
    [appointmentId, locale, refresh],
  );

  const cancel = useCallback(() => {
    cancelAppointment(db, appointmentId);
    refresh();
  }, [appointmentId, refresh]);

  return { appointment, edit, cancel };
}
