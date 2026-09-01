import type { OnboardingGoal } from "@/features/onboarding/onboardingDraft";

import type { PersonalizationProfile } from "./types";

/**
 * Fixed canonical order — every goal-personalizable concept in this
 * product, in one stable order. Shared by the Phase Q paywall
 * (`usePaywallValuePillars`) and every Phase R consumer so a goal ID means
 * exactly the same thing everywhere (Phase R brief §6, §25 — "avoid two
 * separate mappings where Today interprets goal IDs one way and paywall
 * interprets them another way").
 */
export const ALL_GOALS: OnboardingGoal[] = ["symptoms", "treatment", "trends", "appointments", "knowledge"];

export function hasGoal(profile: PersonalizationProfile, goal: OnboardingGoal): boolean {
  return profile.goals.includes(goal);
}

/**
 * The single deterministic ordering primitive every Phase R consumer (and
 * the Phase Q paywall) uses — "goal X gets priority" means the exact same
 * operation everywhere. `items` is a fixed candidate list in its own
 * default order; `goalOf` maps a candidate to the one goal that would
 * promote it (or `null` if no goal maps to it at all, e.g. Labs on Track).
 *
 * Every candidate whose goal is selected moves to the front, keeping their
 * original relative order to each other; everything else keeps its
 * original relative order after them. With zero matching goals the output
 * is element-for-element identical to the input — the neutral fallback
 * every "no personalization" test in this phase checks for.
 */
export function orderByGoalPriority<T>(
  items: T[],
  profile: PersonalizationProfile,
  goalOf: (item: T) => OnboardingGoal | null,
): T[] {
  const promoted = items.filter((item) => {
    const goal = goalOf(item);
    return goal !== null && hasGoal(profile, goal);
  });
  const promotedSet = new Set(promoted);
  const rest = items.filter((item) => !promotedSet.has(item));
  return [...promoted, ...rest];
}
