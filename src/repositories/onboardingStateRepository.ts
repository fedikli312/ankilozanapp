import { eq } from "drizzle-orm";

import { onboardingState } from "../db/schema";
import type { AppDatabase } from "./types";

const SINGLETON_ID = "default";

export function getOnboardingState(db: AppDatabase) {
  return db.select().from(onboardingState).where(eq(onboardingState.id, SINGLETON_ID)).get();
}

export function completeOnboarding(db: AppDatabase, whatToRemember: string[]): void {
  const now = new Date().toISOString();

  db.insert(onboardingState)
    .values({
      id: SINGLETON_ID,
      completed: true,
      whatToRemember: JSON.stringify(whatToRemember),
      completedAt: now,
    })
    .onConflictDoUpdate({
      target: onboardingState.id,
      set: { completed: true, whatToRemember: JSON.stringify(whatToRemember), completedAt: now, updatedAt: now },
    })
    .run();
}
