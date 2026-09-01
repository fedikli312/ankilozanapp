import { db } from "../db";
import { getOnboardingState } from "../repositories";
import type { OnboardingGoal } from "../features/onboarding/onboardingDraft";

/** Fixed canonical order — every pillar the paywall can ever show, in a stable order. */
const ALL_GOALS: OnboardingGoal[] = ["symptoms", "treatment", "trends", "appointments", "knowledge"];

const MAX_PILLARS = 4;

/**
 * Personalized paywall value-pillar ordering (Phase Q brief §12) — reads
 * the user's real, already-persisted onboarding goals (not the transient
 * in-memory onboarding draft, which may be gone by the time the paywall is
 * reached after an app restart) and surfaces the pillars matching selected
 * goals first, then fills any remaining slots from the fixed canonical
 * list, capped at 4. Deterministic, no inference from health-record values
 * (pain/stiffness/fatigue never touch this) — exactly the "deterministic
 * ordering from the selected goals" the brief asks for when true dynamic
 * personalization would add unnecessary complexity.
 */
export function usePaywallValuePillars(): OnboardingGoal[] {
  const state = getOnboardingState(db);
  let selected: OnboardingGoal[] = [];
  try {
    selected = state ? (JSON.parse(state.goals) as OnboardingGoal[]) : [];
  } catch {
    selected = [];
  }

  const selectedValid = ALL_GOALS.filter((goal) => selected.includes(goal));
  const unselected = ALL_GOALS.filter((goal) => !selected.includes(goal));
  return [...selectedValid, ...unselected].slice(0, MAX_PILLARS);
}
