import { addDays, isBefore } from "../../domain/dateUtils";
import {
  computeFatigueHistory,
  computeInjectionHistory,
  computeMedicationAdherence,
  computePainHistory,
  computeStiffnessHistory,
} from "../../domain/insights";
import { resolveAppointmentPreparationLookback } from "../../domain/scheduling";
import { db } from "../../db";
import {
  getAdministrationsForMedication,
  getAdministrationsForTreatment,
  getAllAppointments,
  getAllInjectionTreatments,
  getAllMedications,
  getAppointmentById,
  getCheckInsInRange,
  getLabResultsByMarker,
} from "../../repositories";

export type MedicationAdherenceSummary = {
  medicationId: string;
  medicationName: string;
  takenCount: number;
  missedCount: number;
  adherencePercentage: number | null;
};

export type InjectionHistorySummary = {
  treatmentId: string;
  treatmentName: string;
  completedCount: number;
  missedCount: number;
};

/**
 * Aggregates every prior feature's data into the Appointment Preparation
 * summary (UX spec §K) — reads only, no writes; this screen is a read-only
 * synthesis of what already exists elsewhere.
 */
export function useAppointmentPreparation(appointmentId: string) {
  const appointment = getAppointmentById(db, appointmentId);

  if (!appointment) {
    return { appointment: null } as const;
  }

  const allAppointments = getAllAppointments(db);
  const lookback = resolveAppointmentPreparationLookback(allAppointments, appointment.date);
  // Insight/adherence domain functions use an exclusive rangeEnd (Tech Arch §I convention); the lookback range's own rangeEnd is inclusive (the appointment date itself).
  const range = { rangeStart: lookback.rangeStart, rangeEnd: addDays(lookback.rangeEnd, 1) };

  const checkIns = getCheckInsInRange(db, range.rangeStart, range.rangeEnd);

  const pain = computePainHistory(checkIns, range);
  const stiffness = computeStiffnessHistory(checkIns, range);
  const fatigue = computeFatigueHistory(checkIns, range);

  const medications = getAllMedications(db);
  const medicationHistory: MedicationAdherenceSummary[] = medications
    .map((medication) => {
      const administrations = getAdministrationsForMedication(db, medication.id);
      const adherence = computeMedicationAdherence(administrations, range, medication.id);
      return {
        medicationId: medication.id,
        medicationName: medication.name,
        takenCount: adherence.takenCount,
        missedCount: adherence.missedCount,
        adherencePercentage: adherence.adherencePercentage,
      };
    })
    .filter((entry) => entry.takenCount + entry.missedCount > 0);

  const injectionTreatments = getAllInjectionTreatments(db);
  const injectionHistory: InjectionHistorySummary[] = injectionTreatments
    .map((treatment) => {
      const administrations = getAdministrationsForTreatment(db, treatment.id);
      const history = computeInjectionHistory(administrations, range);
      return {
        treatmentId: treatment.id,
        treatmentName: treatment.name,
        completedCount: history.completedCount,
        missedCount: history.missedCount,
      };
    })
    .filter((entry) => entry.completedCount + entry.missedCount > 0);

  const crpResults = getLabResultsByMarker(db, "CRP").filter(
    (r) => r.recordedDate >= range.rangeStart && r.recordedDate < range.rangeEnd,
  );
  const esrResults = getLabResultsByMarker(db, "ESR").filter(
    (r) => r.recordedDate >= range.rangeStart && r.recordedDate < range.rangeEnd,
  );

  // Reads every check-in note in range, not just ones flagged important:
  // `flaggedImportant` has no approved UX to set it in V1 (it stays an
  // unused, always-false schema column per PROJECT_MEMORY.md), so gating on
  // it here would make this section permanently empty regardless of what
  // the user actually wrote.
  const recordedNotes = checkIns
    .filter((c) => c.notes && c.notes.trim().length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => ({ date: c.date, notes: c.notes as string }));

  const hasPriorRheumatologyAppointment = allAppointments.some(
    (a) => a.type === "rheumatology" && isBefore(a.date, appointment.date),
  );

  return {
    appointment,
    range: lookback,
    hasPriorRheumatologyAppointment,
    checkInCount: checkIns.length,
    pain,
    stiffness,
    fatigue,
    medicationHistory,
    injectionHistory,
    crpResults,
    esrResults,
    recordedNotes,
  } as const;
}
