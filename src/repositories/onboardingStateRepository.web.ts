/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * onboardingStateRepository.ts's exported signatures exactly; native builds
 * never load this file (Metro `.web.ts` platform resolution). The seeded
 * store starts with onboarding already completed, so the preview opens
 * straight into the populated app.
 */
import { webPreviewStore } from "./web/store";

const SINGLETON_ID = "default";

export function getOnboardingState(_db: unknown) {
  return webPreviewStore.onboardingState.find((s) => s.id === SINGLETON_ID);
}

export function completeOnboarding(_db: unknown, whatToRemember: string[]): void {
  const now = new Date().toISOString();
  const existing = getOnboardingState(_db);
  if (existing) {
    existing.completed = true;
    existing.whatToRemember = JSON.stringify(whatToRemember);
    existing.completedAt = now;
    existing.updatedAt = now;
  } else {
    webPreviewStore.onboardingState.push({
      id: SINGLETON_ID,
      completed: true,
      whatToRemember: JSON.stringify(whatToRemember),
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }
}
