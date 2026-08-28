import { db } from "../../db";
import { addDays } from "../../domain/dateUtils";
import {
  computeFatigueHistory,
  computeInjectionHistory,
  computeLabHistory,
  computeMedicationAdherence,
  computePainHistory,
  computeStiffnessHistory,
} from "../../domain/insights";
import type { DateRange } from "../../domain/insights/types";
import {
  getAdministrationsForMedication,
  getAdministrationsForTreatment,
  getAllInjectionTreatments,
  getAllLabResults,
  getAllMedications,
  getCheckInsInRange,
} from "../../repositories";
import { todayDateOnly } from "../../shared/today";

/** Landing rows compare "this week" against the immediately preceding week (UX spec §J example copy). */
const LANDING_WINDOW_DAYS = 7;

export function useInsightsLanding() {
  const today = todayDateOnly();
  const range: DateRange = { rangeStart: addDays(today, -LANDING_WINDOW_DAYS), rangeEnd: addDays(today, 1) };

  const checkIns = getCheckInsInRange(db, addDays(range.rangeStart, -LANDING_WINDOW_DAYS), range.rangeEnd);

  const pain = computePainHistory(checkIns, range);
  const stiffness = computeStiffnessHistory(checkIns, range);
  const fatigue = computeFatigueHistory(checkIns, range);

  const medications = getAllMedications(db);
  const allMedicationAdministrations = medications.flatMap((m) => getAdministrationsForMedication(db, m.id));
  const medicationAdherence = computeMedicationAdherence(allMedicationAdministrations, range);

  const injectionTreatments = getAllInjectionTreatments(db);
  const allInjectionAdministrations = injectionTreatments.flatMap((tr) => getAdministrationsForTreatment(db, tr.id));
  const injectionHistory = computeInjectionHistory(allInjectionAdministrations, range);

  const allLabResults = getAllLabResults(db);
  const crp = computeLabHistory(allLabResults, "CRP", range);
  const esr = computeLabHistory(allLabResults, "ESR", range);

  return { pain, stiffness, fatigue, medicationAdherence, injectionHistory, crp, esr };
}
