import type { PrioritySymptom } from "@/features/onboarding/onboardingDraft";

import { hasGoal } from "./goalMapping";
import type { PersonalizationProfile } from "./types";

export type KnowledgeRecommendationSource = "goal" | "prioritySymptom" | "rotation";

export type KnowledgeRecommendation =
  | { kind: "knowledge"; articleId: string; source: KnowledgeRecommendationSource }
  | { kind: "breathing" };

/**
 * Only priority symptoms with an unambiguous, explicitly-named matching
 * article qualify — never a stretch or inferred mapping (brief §17/§18:
 * "explicit selected symptom → educational article about that symptom,"
 * nothing else, and explicitly NOT "pain = 8 → biologic treatment
 * article"). Wellbeing has no dedicated article in the current content set
 * and is deliberately left unmapped here rather than guessed at — it still
 * has a real Phase R effect elsewhere (`getCheckInPresentation`'s
 * `wellbeingEmphasized`), so this omission isn't "no consumer," just "no
 * Knowledge-recommendation consumer."
 */
const PRIORITY_SYMPTOM_ARTICLE: Partial<Record<PrioritySymptom, string>> = {
  stiffness: "morning-stiffness",
  pain: "pain-and-fatigue",
  fatigue: "pain-and-fatigue",
};

/**
 * Today's single supportive-slot recommendation (brief §17/§18) — still
 * exactly one item, still deterministic, still zero health-record
 * inference (only explicit `goals`/`prioritySymptoms` are read, never a
 * check-in value). `dateRotationPrefersKnowledge` is Phase P's existing
 * date-seeded parity check, passed in so this stays a pure function with
 * no date or knowledge-content dependency of its own.
 *
 * Priority order: an explicit "learn about AS" goal always wins (favors
 * Knowledge over Breathing outright); otherwise an explicit priority
 * symptom with a real matching article wins; otherwise Phase P's existing
 * rotation decides — so a user with no goals/priority symptoms sees
 * exactly the same behavior as before Phase R (the neutral fallback).
 */
export function getKnowledgeRecommendation(
  profile: PersonalizationProfile,
  params: { defaultArticleId: string; dateRotationPrefersKnowledge: boolean },
): KnowledgeRecommendation {
  if (hasGoal(profile, "knowledge")) {
    return { kind: "knowledge", articleId: params.defaultArticleId, source: "goal" };
  }

  for (const symptom of profile.prioritySymptoms) {
    const articleId = PRIORITY_SYMPTOM_ARTICLE[symptom];
    if (articleId) return { kind: "knowledge", articleId, source: "prioritySymptom" };
  }

  return params.dateRotationPrefersKnowledge
    ? { kind: "knowledge", articleId: params.defaultArticleId, source: "rotation" }
    : { kind: "breathing" };
}
