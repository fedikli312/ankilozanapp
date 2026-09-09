import type { OnboardingPersonalization, PrioritySymptom } from "./onboardingDraft";

export type Translate = (key: string, options?: Record<string, unknown>) => string;

export type ValueRevealOutcome = { key: "symptoms" | "treatment" | "appointmentPrep"; label: string };

const MAX_OUTCOMES = 3;

/**
 * Design-C, felt chapter 6 (brief §11) — turns the real, already-selected
 * onboarding answers into at most 3 concrete, truthful capability
 * statements. No invented recommendation, no "AI analyzed your answers"
 * framing (brief explicitly bans this) — every row is a plain template
 * over data the user actually chose two chapters ago. The symptom-tracking
 * row is the one guaranteed baseline (Ilium's daily check-in always
 * exists, regardless of what else was selected) — its wording sharpens
 * when the user named specific symptoms, and falls back to a still-honest
 * generic line when they selected none, matching Design-D/E/F's own
 * "never render an empty/padded section" discipline applied to wording
 * instead of visibility.
 */
export function presentValueReveal(
  personalization: Pick<OnboardingPersonalization, "goals" | "prioritySymptoms" | "treatmentContext">,
  hasUpcomingAppointment: boolean,
  t: Translate,
): ValueRevealOutcome[] {
  const { goals, prioritySymptoms, treatmentContext } = personalization;
  const outcomes: ValueRevealOutcome[] = [{ key: "symptoms", label: presentSymptomsOutcome(prioritySymptoms, t) }];

  const wantsTreatment = (treatmentContext !== null && treatmentContext !== "none") || goals.includes("treatment");
  if (wantsTreatment) {
    outcomes.push({ key: "treatment", label: presentTreatmentOutcome(treatmentContext, t) });
  }

  const wantsAppointmentPrep = goals.includes("appointments") || hasUpcomingAppointment;
  if (wantsAppointmentPrep) {
    outcomes.push({ key: "appointmentPrep", label: t("onboarding.valueReveal.outcome.appointmentPrep") });
  }

  return outcomes.slice(0, MAX_OUTCOMES);
}

function presentSymptomsOutcome(prioritySymptoms: PrioritySymptom[], t: Translate): string {
  if (prioritySymptoms.length === 0) return t("onboarding.valueReveal.outcome.symptomsGeneric");
  if (prioritySymptoms.length === 1) {
    return t("onboarding.valueReveal.outcome.symptomsOne", { symptom: t(`onboarding.prioritySymptoms.${prioritySymptoms[0]}`) });
  }
  if (prioritySymptoms.length === 2) {
    return t("onboarding.valueReveal.outcome.symptomsTwo", {
      symptomA: t(`onboarding.prioritySymptoms.${prioritySymptoms[0]}`),
      symptomB: t(`onboarding.prioritySymptoms.${prioritySymptoms[1]}`),
    });
  }
  return t("onboarding.valueReveal.outcome.symptomsMany", { count: prioritySymptoms.length });
}

function presentTreatmentOutcome(treatmentContext: OnboardingPersonalization["treatmentContext"], t: Translate): string {
  if (treatmentContext === "medication") return t("onboarding.valueReveal.outcome.treatmentMedication");
  if (treatmentContext === "injection") return t("onboarding.valueReveal.outcome.treatmentInjection");
  if (treatmentContext === "both") return t("onboarding.valueReveal.outcome.treatmentBoth");
  // treatmentContext is null/"none" here — this row was only reached
  // because `goals.includes("treatment")` is a real, explicit signal on
  // its own, just not yet backed by a saved medication/injection.
  return t("onboarding.valueReveal.outcome.treatmentGeneric");
}
