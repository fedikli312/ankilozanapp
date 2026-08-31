import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { db } from "../../db";
import type { FrequencyType } from "../../domain/scheduling/types";
import { useTranslation } from "../../localization";
import {
  createInitialSchedule,
  createMedication,
  getAdministrationsForMedication,
  getAllMedications,
  getCurrentSchedule,
  getScheduleTimes,
} from "../../repositories";
import { generateId } from "../../shared/id";
import { todayDateOnly } from "../../shared/today";
import { generateDueAdministrations } from "./medicationAdministrations";
import { reconcileMedicationReminders, type ReminderOutcome } from "./medicationReminders";

export type CreateMedicationFormInput = {
  name: string;
  dose: string;
  notes?: string;
  frequencyType: FrequencyType;
  intervalDays?: number;
  daysOfWeek?: number[];
  /** Single time in this batch — the schema supports multiple; the UI for adding more than one is a later refinement. */
  timeOfDay: string;
  reminderEnabled: boolean;
};

export type MedicationListRow = {
  id: string;
  name: string;
  dose: string;
  archivedAt: string | null;
  /** Schedule times joined for display, e.g. "08:00 · 20:00" — real values only, empty when no schedule exists. */
  scheduleTimesLabel: string;
  /** Earliest still-pending administration's scheduled time, if any. */
  nextDoseAt: string | null;
};

function buildRow(medicationId: string, name: string, dose: string, archivedAt: string | null): MedicationListRow {
  const schedule = getCurrentSchedule(db, medicationId);
  const scheduleTimesLabel = schedule
    ? getScheduleTimes(db, schedule.id)
        .map((t) => t.timeOfDay)
        .join(" · ")
    : "";
  const nextPending = getAdministrationsForMedication(db, medicationId)
    .filter((a) => a.status === "pending")
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))[0];

  return {
    id: medicationId,
    name,
    dose,
    archivedAt,
    scheduleTimesLabel,
    nextDoseAt: nextPending?.scheduledFor ?? null,
  };
}

export function useMedications() {
  const { locale } = useTranslation();
  const [rows, setRows] = useState(() => getAllMedications(db).map((m) => buildRow(m.id, m.name, m.dose, m.archivedAt)));

  const refresh = useCallback(() => {
    setRows(getAllMedications(db).map((m) => buildRow(m.id, m.name, m.dose, m.archivedAt)));
  }, []);

  // Re-fetch on focus (Tech Arch §K) — e.g. returning from the detail screen
  // after an archive/mark-taken action.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const medications = rows.filter((r) => !r.archivedAt);
  const archivedMedications = rows.filter((r) => r.archivedAt);

  const addMedication = useCallback(
    async (input: CreateMedicationFormInput): Promise<ReminderOutcome> => {
      const medicationId = generateId();
      const scheduleId = generateId();
      const effectiveFrom = todayDateOnly();

      createMedication(db, { id: medicationId, name: input.name, dose: input.dose, notes: input.notes });
      createInitialSchedule(db, {
        id: scheduleId,
        medicationId,
        frequencyType: input.frequencyType,
        intervalDays: input.intervalDays,
        reminderEnabled: input.reminderEnabled,
        effectiveFrom,
        daysOfWeek: input.daysOfWeek,
        timesOfDay: [input.timeOfDay],
      });

      // Materializes the pending doses Today needs to show immediately
      // (PRD §5 activation) — not just a future reminder promise.
      generateDueAdministrations(
        db,
        medicationId,
        {
          id: scheduleId,
          frequencyType: input.frequencyType,
          intervalDays: input.intervalDays ?? null,
          effectiveFrom,
          effectiveUntil: null,
        },
        input.daysOfWeek ?? [],
        [input.timeOfDay],
      );

      // Reminder scheduling is a secondary side effect — its own failure must
      // never roll back the medication that already saved (Tech Arch §P).
      let outcome: ReminderOutcome = "disabled";
      try {
        outcome = await reconcileMedicationReminders(db, {
          medicationId,
          medicationName: input.name,
          frequencyType: input.frequencyType,
          intervalDays: input.intervalDays ?? null,
          effectiveFrom,
          daysOfWeek: input.daysOfWeek ?? [],
          timesOfDay: [input.timeOfDay],
          reminderEnabled: input.reminderEnabled,
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

  return { medications, archivedMedications, addMedication, refresh };
}
