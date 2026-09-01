/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * onboardingStateRepository.ts's exported signatures exactly; native builds
 * never load this file (Metro `.web.ts` platform resolution). The seeded
 * store starts with onboarding already completed, so the preview opens
 * straight into the populated app.
 */
import { CURRENT_ONBOARDING_VERSION } from "../domain/constants";
import { webPreviewStore } from "./web/store";
import type { CompleteOnboardingInput } from "./onboardingStateRepository";

const SINGLETON_ID = "default";

export function getOnboardingState(_db: unknown) {
  return webPreviewStore.onboardingState.find((s) => s.id === SINGLETON_ID);
}

export function completeOnboarding(_db: unknown, input: CompleteOnboardingInput): void {
  const now = new Date().toISOString();
  const values = {
    completed: true as const,
    whatToRemember: "[]",
    goals: JSON.stringify(input.goals),
    prioritySymptoms: JSON.stringify(input.prioritySymptoms),
    priorityBodyAreas: JSON.stringify(input.priorityBodyAreas),
    treatmentContext: input.treatmentContext,
    onboardingVersion: CURRENT_ONBOARDING_VERSION,
    completedAt: now,
  };
  const existing = getOnboardingState(_db);
  if (existing) {
    Object.assign(existing, values, { updatedAt: now });
  } else {
    webPreviewStore.onboardingState.push({
      id: SINGLETON_ID,
      ...values,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export type { CompleteOnboardingInput, TreatmentContext } from "./onboardingStateRepository";
