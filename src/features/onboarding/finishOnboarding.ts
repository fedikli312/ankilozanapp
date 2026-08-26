import { db } from "../../db";
import { completeOnboarding } from "../../repositories";
import { getOnboardingSelection, selectedKeys } from "./onboardingDraft";

export function finishOnboarding(): void {
  completeOnboarding(db, selectedKeys(getOnboardingSelection()));
}
