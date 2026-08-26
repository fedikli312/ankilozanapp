import { useCallback } from "react";

import { db } from "../../db";
import { completeOnboarding, getOnboardingState } from "../../repositories";

export function useOnboardingState() {
  const state = getOnboardingState(db);

  const complete = useCallback((whatToRemember: string[]) => {
    completeOnboarding(db, whatToRemember);
  }, []);

  return { completed: state?.completed ?? false, complete };
}
