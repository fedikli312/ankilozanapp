import type { BodyAreaRegion } from "../../repositories";
import type { TreatmentContext } from "../../repositories/onboardingStateRepository";

/**
 * Transient, in-memory personalization answers collected across the
 * Product 2.0 onboarding screens (Goals → Priority symptoms → Body regions
 * → Treatment context) — `docs/PRODUCT_2_0_UX_SPECIFICATION.md` §8-9.
 *
 * Same architecture as the V1 `OnboardingSelection` this module previously
 * held: not persisted, not a global store framework (Tech Arch §K forbids
 * those), lives only for the duration of the onboarding wizard and is
 * written to `onboarding_state` once, by `finishOnboarding()`, when the
 * user reaches the end of the flow.
 */
export type OnboardingGoal = "symptoms" | "treatment" | "trends" | "appointments" | "knowledge";
export type PrioritySymptom = "pain" | "stiffness" | "fatigue" | "wellbeing";

export type OnboardingPersonalization = {
  goals: OnboardingGoal[];
  prioritySymptoms: PrioritySymptom[];
  priorityBodyAreas: BodyAreaRegion[];
  treatmentContext: TreatmentContext | null;
  /**
   * Reminder-intent toggles from the Reminders screen. Deliberately never
   * persisted (Phase N brief §21 candidate list omits it) — its only real
   * effect is gating the one notification-permission request, and feeding
   * the Personalized Summary/Value Reveal screens' copy honestly. Actual
   * per-entity reminder defaults are unaffected (medication/injection forms
   * keep their own existing "Remind me" toggle, unchanged).
   */
  reminderIntent: {
    medications: boolean;
    injections: boolean;
    appointments: boolean;
  };
};

const DEFAULT_PERSONALIZATION: OnboardingPersonalization = {
  goals: [],
  prioritySymptoms: [],
  priorityBodyAreas: [],
  treatmentContext: null,
  reminderIntent: { medications: true, injections: true, appointments: true },
};

let personalization: OnboardingPersonalization = { ...DEFAULT_PERSONALIZATION };

export function getOnboardingPersonalization(): OnboardingPersonalization {
  return personalization;
}

export function setOnboardingPersonalization(next: Partial<OnboardingPersonalization>): void {
  personalization = { ...personalization, ...next };
}

/** Test/dev-only reset — mirrors the module-level-singleton pattern already accepted for `onboardingDraft`. */
export function resetOnboardingPersonalization(): void {
  personalization = { ...DEFAULT_PERSONALIZATION };
}
