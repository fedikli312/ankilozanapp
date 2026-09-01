import { hasGoal } from "./goalMapping";
import type { PersonalizationProfile } from "./types";

export type TrackHealthRowId = "symptoms" | "medications" | "injections" | "labs";

/** Track's existing, unchanged default order — every module always present, never hidden (brief §16). */
const TRACK_HEALTH_DEFAULT_ORDER: TrackHealthRowId[] = ["symptoms", "medications", "injections", "labs"];

export type TrackPersonalization = {
  /** Always contains all 4 rows, only ever reordered — never a subset (brief §16: "Do NOT hide any module"). */
  healthOrder: TrackHealthRowId[];
  /** Knowledge already sits first in the subordinate "GÜNLÜK DESTEK" group by default — this flags it for a restrained visual cue rather than reordering Nutrition/Breathing around it, keeping Track's IA stable across users (brief §16: "avoid making Track unstable every time data changes," "do not create dramatically different information architectures per user"). */
  knowledgeEmphasized: boolean;
};

/**
 * Track's health-section ordering (brief §16). Symptoms is already first
 * by default, matching the symptom-tracking goal's preferred position, so
 * no reorder is needed for it. The one real reordering case: the
 * treatment goal selected without the symptom-tracking goal also selected
 * promotes Medications+Injections (kept as a pair, their relative order to
 * each other preserved) ahead of Symptoms. Labs never moves — no Phase N
 * goal maps to it, and inventing one would be fake personalization (brief
 * §23). With no goals selected, or with "symptoms" among them, the output
 * is the exact existing default order.
 */
export function getTrackSupportOrder(profile: PersonalizationProfile): TrackPersonalization {
  const treatmentPreferred = hasGoal(profile, "treatment") && !hasGoal(profile, "symptoms");

  return {
    healthOrder: treatmentPreferred ? ["medications", "injections", "symptoms", "labs"] : TRACK_HEALTH_DEFAULT_ORDER,
    knowledgeEmphasized: hasGoal(profile, "knowledge"),
  };
}
