import { hasGoal } from "./goalMapping";
import type { PersonalizationProfile } from "./types";

/** Every route this function can hand back — a closed literal union (not a bare `string`) so a call site can pass `.route` straight to `router.push` without a cast, and a typo here would fail `tsc`, not silently 404 at runtime. */
export type EmptyStateActionRoute = "/symptoms" | "/insights" | "/appointments/add" | "/knowledge";

export type EmptyStateAction = { labelKey: string; route: EmptyStateActionRoute } | null;

/**
 * Today's low-signal state (Phase R brief §9): no treatment configured, no
 * appointment, today's check-in already done — nothing urgent left to show.
 * Distinct from (and additive to) the existing "no treatment at all" empty
 * state, which always offers "add a medication" regardless of goals — this
 * is the narrower case where that primary action doesn't apply either
 * (there's genuinely no appointment) or a second, goal-driven action is
 * useful alongside it. Deterministic, first-matching goal in a fixed
 * priority order wins; never a fabricated recommendation, always a plain
 * navigation to an existing screen.
 */
export function getEmptyStateAction(profile: PersonalizationProfile): EmptyStateAction {
  if (hasGoal(profile, "symptoms")) return { labelKey: "today.emptyActionSymptomHistory", route: "/symptoms" };
  if (hasGoal(profile, "trends")) return { labelKey: "today.emptyActionInsights", route: "/insights" };
  if (hasGoal(profile, "appointments")) return { labelKey: "today.emptyActionAddAppointment", route: "/appointments/add" };
  if (hasGoal(profile, "knowledge")) return { labelKey: "today.emptyActionKnowledge", route: "/knowledge" };
  return null;
}
