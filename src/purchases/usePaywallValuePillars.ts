import { buildPersonalizationProfile } from "@/personalization/buildPersonalizationProfile";
import { ALL_GOALS, orderByGoalPriority } from "@/personalization/goalMapping";

import { db } from "../db";
import { getOnboardingState } from "../repositories";
import type { OnboardingGoal } from "../features/onboarding/onboardingDraft";

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
 *
 * As of Phase R, `ALL_GOALS` and the ordering primitive itself are shared
 * with every other personalization consumer (`src/personalization/goalMapping.ts`)
 * rather than duplicated here, so a goal ID is interpreted identically on
 * Today/Track/Knowledge and on this paywall (Phase R brief §25) — the
 * behavior below is unchanged from before that consolidation.
 */
export function usePaywallValuePillars(): OnboardingGoal[] {
  const state = getOnboardingState(db);
  const profile = buildPersonalizationProfile(state);
  return orderByGoalPriority(ALL_GOALS, profile, (goal) => goal).slice(0, MAX_PILLARS);
}
