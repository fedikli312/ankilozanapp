import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { db } from "../../db";
import { addDays } from "../../domain/dateUtils";
import { computePainHistory } from "../../domain/insights";
import { generateDueAdministrations } from "../medications/medicationAdministrations";
import {
  getActiveInjectionTreatments,
  getActiveMedications,
  getAdministrationsForMedication,
  getAdministrationsForTreatment,
  getCheckInByDate,
  getCheckInsInRange,
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
  status: "pending" | "taken";
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
  // Redesign Phase D (§"check-in summary"): "previous context" line on the
  // not-yet-checked-in card — explicitly the previous day's own recorded
  // value, never presented as today's. Plain repository read, no new domain logic.
  const yesterdayCheckIn = getCheckInByDate(db, addDays(today, -1));

  // 14-day window, named domain constant (Tech Arch §D) — same rule as the Appointments tab's own 14-day surfacing, applied here via the repository helper that already wraps it.
  const upcomingAppointment: UpcomingAppointmentRow | null = getUpcomingAppointments(db, today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((a) => ({ id: a.id, type: a.type, doctorOrInstitution: a.doctorOrInstitution, date: a.date, time: a.time ?? null }))[0] ?? null;

  const allMedicationAdministrations = medications.flatMap((medication) =>
    getAdministrationsForMedication(db, medication.id).map((a) => ({
      ...a,
      medicationName: medication.name,
      medicationDose: medication.dose,
    })),
  );

  // UX spec §D: taken items "visually settle... rather than disappear" —
  // today's list includes both still-pending and already-taken doses so a
  // completed dose renders as a quiet success row instead of vanishing.
  const dueToday: DueMedicationRow[] = allMedicationAdministrations
    .filter((a) => a.scheduledFor.startsWith(today) && (a.status === "pending" || a.status === "taken"))
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
    .map((a) => ({
      administrationId: a.id,
      medicationName: a.medicationName,
      medicationDose: a.medicationDose,
      scheduledFor: a.scheduledFor,
      status: a.status as "pending" | "taken",
    }));

  const pendingAdministrations = allMedicationAdministrations.filter((a) => a.status === "pending");
  const nextMedicationSorted = pendingAdministrations
    .slice()
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  const nextMedication: DueMedicationRow | null = nextMedicationSorted[0]
    ? {
        administrationId: nextMedicationSorted[0].id,
        medicationName: nextMedicationSorted[0].medicationName,
        medicationDose: nextMedicationSorted[0].medicationDose,
        scheduledFor: nextMedicationSorted[0].scheduledFor,
        status: "pending",
      }
    : null;

  // Redesign Phase D "Son 7 gün" — composes existing Insights domain logic
  // (computePainHistory) and the existing check-in-range repository read
  // over a plain 7-day window; no new domain function. Renders only when
  // computePainHistory's own sufficiency threshold (>=3 check-ins) is met,
  // matching Today's "a section only renders when it has real content" rule.
  const recentRangeStart = addDays(today, -6);
  const recentRangeEnd = addDays(today, 1);
  const recentCheckIns = getCheckInsInRange(db, recentRangeStart, recentRangeEnd);
  const recentPainTrend = computePainHistory(recentCheckIns, {
    rangeStart: recentRangeStart,
    rangeEnd: recentRangeEnd,
  });
  const recentSummary = recentPainTrend.sufficientData
    ? { averagePain: recentPainTrend.average, checkInCount: recentCheckIns.length, windowDays: 7 }
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
    yesterdayCheckIn,
    recentSummary,
    upcomingAppointment,
    markTaken,
  };
}
