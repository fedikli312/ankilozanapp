import type { PrioritySymptom } from "@/features/onboarding/onboardingDraft";
import type { BodyAreaRegion } from "@/repositories";

import type { PersonalizationProfile } from "./types";

const CORE_SYMPTOMS: PrioritySymptom[] = ["pain", "stiffness", "fatigue"];

export type CheckInPersonalization = {
  /**
   * Auto-expand the "+ Daha fazlası" disclosure so Wellbeing/Body Map are
   * visible without an extra tap — triggered by an explicit wellbeing
   * priority or any priority body area (brief §12/§13's own "choose the
   * cleaner UX" / "whichever keeps the single-sheet check-in fastest"
   * guidance). This only changes visibility, nothing is auto-filled or
   * auto-selected.
   */
  autoExpandMore: boolean;
  /** Pain/Stiffness/Fatigue the user explicitly flagged as a priority — for a restrained indicator only. Never reorders or hides these three; the approved base set and its stored semantics are untouched (brief §11). */
  emphasizedCoreSymptoms: PrioritySymptom[];
  wellbeingEmphasized: boolean;
  /**
   * Body areas the user said matter to them at onboarding — for a
   * non-interactive visual label on the Body Map only ("Takip etmek
   * istediğin bölgeler"). Never today's selection, never pre-checked
   * (brief §13/§14's critical distinction: "these areas matter to me" is
   * not "I have pain there today").
   */
  priorityBodyAreas: BodyAreaRegion[];
};

export function getCheckInPresentation(profile: PersonalizationProfile): CheckInPersonalization {
  const wellbeingEmphasized = profile.prioritySymptoms.includes("wellbeing");
  const hasPriorityBodyAreas = profile.priorityBodyAreas.length > 0;

  return {
    autoExpandMore: wellbeingEmphasized || hasPriorityBodyAreas,
    emphasizedCoreSymptoms: CORE_SYMPTOMS.filter((symptom) => profile.prioritySymptoms.includes(symptom)),
    wellbeingEmphasized,
    priorityBodyAreas: profile.priorityBodyAreas,
  };
}
