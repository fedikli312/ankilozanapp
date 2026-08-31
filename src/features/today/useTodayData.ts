import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { db } from "../../db";
import { generateDueAdministrations } from "../medications/medicationAdministrations";
import {
  getActiveInjectionTreatments,
  getActiveMedications,
  getAdministrationsForMedication,
  getAdministrationsForTreatment,
  getCheckInByDate,
  getCurrentSchedule,
  getScheduleDays,
  getScheduleTimes,
  getUpcomingAppointments,
  markAdministration,
} from "../../repositories";
import { todayDateOnly } from "../../shared/today";

export type UpcomingAppointmentRow = {
  id: string;
  type: "rheumatology" | "laboratory" | "imaging" | "other";
  doctorOrInstitution: string | null;
  date: string;
  time: string | null;
};

export type DueMedicationRow = {
  administrationId: string;
  medicationName: string;
  medicationDose: string;
  scheduledFor: string;
};

export type NextInjectionRow = {
  treatmentId: string;
  treatmentName: string;
  scheduledFor: string;
};

export function useTodayData() {
  const [, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  // Reconciliation on Today load (Implementation Plan Phase 6/17's
  // narrower scope for this batch): tops up pending doses for every active
  // medication so the list below is never stale just because the app
  // wasn't opened on the exact day a dose was due.
  useFocusEffect(
    useCallback(() => {
      for (const medication of getActiveMedications(db)) {
        const schedule = getCurrentSchedule(db, medication.id);
        if (!schedule) continue;
        const days = getScheduleDays(db, schedule.id).map((d) => d.dayOfWeek);
        const times = getScheduleTimes(db, schedule.id).map((t) => t.timeOfDay);
        generateDueAdministrations(db, medication.id, schedule, days, times);
      }
      refresh();
    }, [refresh]),
  );

  const medications = getActiveMedications(db);
  const injections = getActiveInjectionTreatments(db);
  const today = todayDateOnly();
  const todaysCheckIn = getCheckInByDate(db, today);

  // 14-day window, named domain constant (Tech Arch §D) — same rule as the Appointments tab's own 14-day surfacing, applied here via the repository helper that already wraps it.
  const upcomingAppointment: UpcomingAppointmentRow | null = getUpcomingAppointments(db, today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((a) => ({ id: a.id, type: a.type, doctorOrInstitution: a.doctorOrInstitution, date: a.date, time: a.time ?? null }))[0] ?? null;

  const allMedicationAdministrations = medications.flatMap((medication) =>
    getAdministrationsForMedication(db, medication.id)
      .filter((a) => a.status === "pending")
      .map((a) => ({ ...a, medicationName: medication.name, medicationDose: medication.dose })),
  );

  const dueToday: DueMedicationRow[] = allMedicationAdministrations
    .filter((a) => a.scheduledFor.startsWith(today))
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
    .map((a) => ({ administrationId: a.id, medicationName: a.medicationName, medicationDose: a.medicationDose, scheduledFor: a.scheduledFor }));

  const nextMedicationSorted = allMedicationAdministrations
    .slice()
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  const nextMedication: DueMedicationRow | null = nextMedicationSorted[0]
    ? {
        administrationId: nextMedicationSorted[0].id,
        medicationName: nextMedicationSorted[0].medicationName,
        medicationDose: nextMedicationSorted[0].medicationDose,
        scheduledFor: nextMedicationSorted[0].scheduledFor,
      }
    : null;

  const nextInjectionRows: NextInjectionRow[] = injections
    .map((treatment) => {
      const pending = getAdministrationsForTreatment(db, treatment.id).find((a) => a.status === "pending");
      return pending
        ? { treatmentId: treatment.id, treatmentName: treatment.name, scheduledFor: pending.scheduledFor }
        : null;
    })
    .filter((row): row is NextInjectionRow => row !== null)
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

  const markTaken = useCallback(
    (administrationId: string) => {
      markAdministration(db, administrationId, "taken", new Date().toISOString());
      refresh();
    },
    [refresh],
  );

  return {
    hasAnyTreatment: medications.length > 0 || injections.length > 0,
    dueToday,
    nextMedication,
    nextInjection: nextInjectionRows[0] ?? null,
    todaysCheckIn,
    upcomingAppointment,
    markTaken,
  };
}
