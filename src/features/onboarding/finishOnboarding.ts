import { db } from "../../db";
import { completeOnboarding } from "../../repositories";
import { getOnboardingPersonalization } from "./onboardingDraft";

/**
 * Called from Value Reveal's CTA. Completes onboarding unconditionally —
 * whether the app then goes straight to Today (current behavior) or through
 * a paywall first is a separate, later concern (Phase Q); see the call site
 * in `app/onboarding/value-reveal.tsx` for the explicit insertion-point
 * comment.
 */
export function finishOnboarding(): void {
  const { goals, prioritySymptoms, priorityBodyAreas, treatmentContext } = getOnboardingPersonalization();
  completeOnboarding(db, { goals, prioritySymptoms, priorityBodyAreas, treatmentContext });
}
