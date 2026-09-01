import type { OnboardingGoal, PrioritySymptom } from "@/features/onboarding/onboardingDraft";
import type { BodyAreaRegion, getOnboardingState } from "@/repositories";

import { EMPTY_PERSONALIZATION_PROFILE, type PersonalizationProfile } from "./types";

type OnboardingStateRow = ReturnType<typeof getOnboardingState>;

function parseArray<T extends string>(raw: string | undefined): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/**
 * Pure — no React, no SQLite call of its own (that's `usePersonalizationProfile`'s
 * job). Takes whatever `getOnboardingState` returned and produces a safe
 * `PersonalizationProfile` no matter what: a missing row, a legacy
 * `onboardingVersion: 1` row (whose `goals`/`prioritySymptoms`/
 * `priorityBodyAreas` columns already default to `"[]"` at the schema
 * level — never null, never a crash), or malformed JSON all resolve to the
 * same empty/neutral profile rather than throwing (brief §28).
 */
export function buildPersonalizationProfile(row: OnboardingStateRow): PersonalizationProfile {
  if (!row) return EMPTY_PERSONALIZATION_PROFILE;
  return {
    goals: parseArray<OnboardingGoal>(row.goals),
    prioritySymptoms: parseArray<PrioritySymptom>(row.prioritySymptoms),
    priorityBodyAreas: parseArray<BodyAreaRegion>(row.priorityBodyAreas),
    treatmentContext: row.treatmentContext ?? null,
    onboardingVersion: row.onboardingVersion,
  };
}
