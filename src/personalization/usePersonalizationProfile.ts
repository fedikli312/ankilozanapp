import { db } from "@/db";
import { getOnboardingState } from "@/repositories";

import { buildPersonalizationProfile } from "./buildPersonalizationProfile";
import type { PersonalizationProfile } from "./types";

/**
 * The one place UI reads personalization from (Phase R brief §5) — wraps
 * the existing `onboarding_state` repository exactly like
 * `usePaywallValuePillars` already did in Phase Q. No screen reads SQLite
 * directly, and no second persistent store is created: this is a read of
 * the same singleton row `completeOnboarding` writes, nothing more. One
 * repository read per call — a screen that renders several personalized
 * sections (Today, Track, check-in) calls this once at the top and passes
 * the resulting profile down, rather than calling it per card.
 */
export function usePersonalizationProfile(): PersonalizationProfile {
  const state = getOnboardingState(db);
  return buildPersonalizationProfile(state);
}
