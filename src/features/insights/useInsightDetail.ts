import { db } from "../../db";
import {
  computeFatigueHistory,
  computeInjectionHistory,
  computeLabHistory,
  computeMedicationAdherence,
  computePainHistory,
  computeStiffnessHistory,
  resolveInsightsRange,
  type InsightsRangePreset,
} from "../../domain/insights";
import {
  getAdministrationsForMedication,
  getAdministrationsForTreatment,
  getAllInjectionTreatments,
  getAllLabResults,
  getAllMedications,
  getCheckInsInRange,
} from "../../repositories";
import { todayDateOnly } from "../../shared/today";
import type { InsightMetricKey } from "./types";

export function useInsightDetail(metric: InsightMetricKey, preset: InsightsRangePreset) {
  const today = todayDateOnly();
  const range = resolveInsightsRange(preset, today);

  if (metric === "pain" || metric === "fatigue") {
    const checkIns = getCheckInsInRange(db, range.rangeStart, range.rangeEnd);
    const trend = metric === "pain" ? computePainHistory(checkIns, range) : computeFatigueHistory(checkIns, range);
    const chartPoints = checkIns
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((c) => ({ label: c.date.slice(5), value: metric === "pain" ? c.pain : c.fatigue }));
    return { kind: "numeric" as const, trend, chartPoints };
  }

  if (metric === "stiffness") {
    const checkIns = getCheckInsInRange(db, range.rangeStart, range.rangeEnd);
    const stiffness = computeStiffnessHistory(checkIns, range);
    return { kind: "stiffness" as const, stiffness };
  }

  if (metric === "crp" || metric === "esr") {
    const allResults = getAllLabResults(db);
    const marker = metric === "crp" ? "CRP" : "ESR";
    const history = computeLabHistory(allResults, marker, range);
    const chartPoints = history.values.map((v) => ({ label: v.recordedDate.slice(5), value: v.value }));
    return { kind: "lab" as const, history, chartPoints };
  }

  if (metric === "medicationAdherence") {
    const medications = getAllMedications(db);
    const entries = medications
      .map((m) => {
        const administrations = getAdministrationsForMedication(db, m.id);
        return { name: m.name, adherence: computeMedicationAdherence(administrations, range, m.id) };
      })
      .filter((e) => e.adherence.takenCount + e.adherence.missedCount + e.adherence.skippedCount > 0);
    return { kind: "medicationAdherence" as const, entries };
  }

  // injectionHistory
  const treatments = getAllInjectionTreatments(db);
  const entries = treatments
    .map((tr) => {
      const administrations = getAdministrationsForTreatment(db, tr.id);
      return { name: tr.name, history: computeInjectionHistory(administrations, range) };
    })
    .filter((e) => e.history.completedCount + e.history.missedCount > 0);
  return { kind: "injectionHistory" as const, entries };
}
