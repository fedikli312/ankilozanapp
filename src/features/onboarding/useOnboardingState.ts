import { useCallback } from "react";

import { db } from "../../db";
import { completeOnboarding, getOnboardingState } from "../../repositories";
import type { CompleteOnboardingInput } from "../../repositories/onboardingStateRepository";

export function useOnboardingState() {
  const state = getOnboardingState(db);

  const complete = useCallback((input: CompleteOnboardingInput) => {
    completeOnboarding(db, input);
  }, []);

  return { completed: state?.completed ?? false, complete };
}
