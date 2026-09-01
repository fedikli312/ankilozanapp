import { eq } from "drizzle-orm";

import { onboardingState } from "../db/schema";
import { CURRENT_ONBOARDING_VERSION } from "../domain/constants";
import type { AppDatabase } from "./types";

const SINGLETON_ID = "default";

export type TreatmentContext = "medication" | "injection" | "both" | "none";

/**
 * Product 2.0 Phase N personalization inputs (`docs/PRODUCT_2_0_UX_SPECIFICATION.md`
 * §8-9). `whatToRemember` is deliberately not part of this input — the new
 * completion path writes `"[]"` to that column rather than repurposing it
 * (see the schema comment in `src/db/schema/preferences.ts`).
 */
export type CompleteOnboardingInput = {
  goals: string[];
  prioritySymptoms: string[];
  priorityBodyAreas: string[];
  treatmentContext: TreatmentContext | null;
};

export function getOnboardingState(db: AppDatabase) {
  return db.select().from(onboardingState).where(eq(onboardingState.id, SINGLETON_ID)).get();
}

export function completeOnboarding(db: AppDatabase, input: CompleteOnboardingInput): void {
  const now = new Date().toISOString();
  const values = {
    completed: true,
    whatToRemember: "[]",
    goals: JSON.stringify(input.goals),
    prioritySymptoms: JSON.stringify(input.prioritySymptoms),
    priorityBodyAreas: JSON.stringify(input.priorityBodyAreas),
    treatmentContext: input.treatmentContext,
    onboardingVersion: CURRENT_ONBOARDING_VERSION,
    completedAt: now,
  };

  db.insert(onboardingState)
    .values({ id: SINGLETON_ID, ...values })
    .onConflictDoUpdate({
      target: onboardingState.id,
      set: { ...values, updatedAt: now },
    })
    .run();
}
