import { useCallback, useState } from "react";

import { db } from "../../db";
import type { FrequencyType } from "../../domain/scheduling/types";
import { useTranslation } from "../../localization";
import {
  archiveMedication,
  deleteFutureUnrecordedAdministrations,
  getAdministrationsForMedication,
  getCurrentSchedule,
  getMedicationById,
  getScheduleDays,
  getScheduleTimes,
  markAdministration,
  reviseSchedule,
} from "../../repositories";
import { generateId } from "../../shared/id";
import { todayDateOnly } from "../../shared/today";
import { generateDueAdministrations } from "./medicationAdministrations";
import { reconcileMedicationReminders } from "./medicationReminders";

export type ReviseScheduleInput = {
  frequencyType: FrequencyType;
  intervalDays?: number;
  daysOfWeek?: number[];
  timeOfDay: string;
  reminderEnabled: boolean;
};

export function useMedicationDetail(medicationId: string) {
  const { locale } = useTranslation();
  // A plain re-render trigger: every read below queries fresh from SQLite
  // on each render body, so bumping this after a mutation is enough to
  // reflect the change (Tech Arch §K — no reactive query layer in V1).
  const [, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  const medication = getMedicationById(db, medicationId);
  const schedule = getCurrentSchedule(db, medicationId);
  const scheduleDays = schedule ? getScheduleDays(db, schedule.id) : [];
  const scheduleTimes = schedule ? getScheduleTimes(db, schedule.id) : [];
  const administrations = getAdministrationsForMedication(db, medicationId)
    .slice()
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));

  const markTaken = useCallback(
    (administrationId: string) => {
      markAdministration(db, administrationId, "taken", new Date().toISOString());
      refresh();
    },
    [refresh],
  );

  const markMissed = useCallback(
    (administrationId: string) => {
      markAdministration(db, administrationId, "missed");
      refresh();
    },
    [refresh],
  );

  const archive = useCallback(() => {
    archiveMedication(db, medicationId, new Date().toISOString());
    refresh();
  }, [medicationId, refresh]);

  /** Future scheduled doses only — never touches an existing administration (Tech Arch §F). */
  const editSchedule = useCallback(
    async (input: ReviseScheduleInput) => {
      if (!schedule) return "disabled" as const;

      const effectiveDate = todayDateOnly();
      const newScheduleId = generateId();

      reviseSchedule(db, schedule.id, effectiveDate, {
        id: newScheduleId,
        medicationId,
        frequencyType: input.frequencyType,
        intervalDays: input.intervalDays,
        reminderEnabled: input.reminderEnabled,
        effectiveFrom: effectiveDate,
        daysOfWeek: input.daysOfWeek,
        timesOfDay: [input.timeOfDay],
      });

      // Drop not-yet-occurred doses generated under the old cadence, then
      // materialize doses under the new one — recorded history (taken/
      // missed/skipped) from before today is never touched either way.
      deleteFutureUnrecordedAdministrations(db, schedule.id, effectiveDate);
      generateDueAdministrations(
        db,
        medicationId,
        {
          id: newScheduleId,
          frequencyType: input.frequencyType,
          intervalDays: input.intervalDays ?? null,
          effectiveFrom: effectiveDate,
          effectiveUntil: null,
        },
        input.daysOfWeek ?? [],
        [input.timeOfDay],
      );

      const outcome = await reconcileMedicationReminders(db, {
        medicationId,
        frequencyType: input.frequencyType,
        intervalDays: input.intervalDays ?? null,
        effectiveFrom: effectiveDate,
        daysOfWeek: input.daysOfWeek ?? [],
        timesOfDay: [input.timeOfDay],
        reminderEnabled: input.reminderEnabled,
        locale,
      });

      refresh();
      return outcome;
    },
    [schedule, medicationId, locale, refresh],
  );

  return {
    medication,
    schedule,
    scheduleDays,
    scheduleTimes,
    administrations,
    markTaken,
    markMissed,
    archive,
    editSchedule,
  };
}
