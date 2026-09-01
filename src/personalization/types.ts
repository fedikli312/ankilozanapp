import type { OnboardingGoal, PrioritySymptom } from "@/features/onboarding/onboardingDraft";
import type { BodyAreaRegion } from "@/repositories";
import type { TreatmentContext } from "@/repositories/onboardingStateRepository";

/**
 * Product 2.0 Phase R — the one shape every personalization consumer reads
 * (`docs/PRODUCT_2_0_UX_SPECIFICATION.md`, Phase R brief §3-4). Built only
 * from the four approved explicit onboarding fields — never from health
 * records (pain/stiffness/fatigue/wellbeing values, body-region history,
 * CRP/ESR, medication adherence, missed injections, appointments, notes,
 * or any inferred disease state). Those stay health records, not
 * personalization signals, and no function in `src/personalization`
 * accepts them as input.
 */
export type PersonalizationProfile = {
  goals: OnboardingGoal[];
  prioritySymptoms: PrioritySymptom[];
  priorityBodyAreas: BodyAreaRegion[];
  /** Captured but deliberately unconsumed by any Phase R presentation decision — see `resolveHasTreatment.ts`'s doc comment (brief §15). Kept on the profile for a future phase, not pretended to have a Phase R effect it doesn't have. */
  treatmentContext: TreatmentContext | null;
  onboardingVersion: number;
};

/** The safe fallback for a missing row, a legacy `onboardingVersion: 1` row, or any parse failure — identical to "nothing selected," which every consumer already treats as its own neutral default order (brief §28: "no crash, no forced onboarding rerun, no fake defaults saved"). */
export const EMPTY_PERSONALIZATION_PROFILE: PersonalizationProfile = {
  goals: [],
  prioritySymptoms: [],
  priorityBodyAreas: [],
  treatmentContext: null,
  onboardingVersion: 1,
};
