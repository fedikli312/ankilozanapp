import type { TrialEligibility } from "./types";

/**
 * A platform-agnostic mirror of RevenueCat's `INTRO_ELIGIBILITY_STATUS`
 * enum (verified against the installed `react-native-purchases@10.8.1`
 * type definitions and RevenueCat's own current documentation, Sept 2026):
 *   - ELIGIBLE — the store confirms this user can receive the intro/trial offer.
 *   - INELIGIBLE — the store confirms this user cannot (e.g. already used a trial for this product/group).
 *   - NO_INTRO_OFFER_EXISTS — no introductory offer is configured on this product at all.
 *   - UNKNOWN — the store cannot determine eligibility (always the case on Android; possible on iOS with incomplete receipt/group data).
 *   - NOT_CHECKED — this app's own state, not a RevenueCat value: the eligibility API was never called for this product (e.g. the call itself threw).
 * `NOT_CHECKED` is included so the native client can express "we don't
 * know, we couldn't even ask" the same way it expresses "the store said it
 * doesn't know" — both must land on `"unknown"`, never `"ineligible"`.
 */
export type IntroEligibilityStatus = "ELIGIBLE" | "INELIGIBLE" | "NO_INTRO_OFFER_EXISTS" | "UNKNOWN" | "NOT_CHECKED";

/**
 * The single place the tri-state trial-eligibility decision is made
 * (Phase Q monetization-safety pass, item 1) — pure and platform-free so
 * it's directly unit-testable without React Native or RevenueCat. Two
 * independent facts must both hold for `"eligible"`:
 *   1. The product actually has a day-based introductory price at all
 *      (`hasDayBasedIntroPrice`) — without one, there is nothing to be
 *      eligible *for*, regardless of what the eligibility API reports.
 *   2. The store's own eligibility check returned exactly `"ELIGIBLE"`.
 * Every other combination resolves to `"ineligible"` or `"unknown"` —
 * never `"eligible"` by default, and `"unknown"` is never silently
 * upgraded to `"eligible"`.
 */
export function resolveTrialEligibility(params: {
  hasDayBasedIntroPrice: boolean;
  status: IntroEligibilityStatus;
}): TrialEligibility {
  if (!params.hasDayBasedIntroPrice) return "ineligible";

  switch (params.status) {
    case "ELIGIBLE":
      return "eligible";
    case "INELIGIBLE":
    case "NO_INTRO_OFFER_EXISTS":
      return "ineligible";
    case "UNKNOWN":
    case "NOT_CHECKED":
      return "unknown";
    default:
      return "unknown";
  }
}

/** Whether trial-specific copy (badge, CTA, billing explanation) may be shown. Only `"eligible"` qualifies — the one call site this belongs in. */
export function shouldShowTrialCopy(eligibility: TrialEligibility): boolean {
  return eligibility === "eligible";
}
