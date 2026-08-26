/**
 * Transient, in-memory selection for the "What do you want help
 * remembering?" step (UX spec §C.3) — gates which of the following add-
 * screens appear. Not persisted state and not a global store framework
 * (Tech Arch §K forbids those); it only lives for the duration of the
 * onboarding wizard and is discarded once `completeOnboarding` runs.
 */
export type OnboardingSelection = {
  medications: boolean;
  injections: boolean;
  appointments: boolean;
  symptoms: boolean;
};

let selection: OnboardingSelection = {
  medications: false,
  injections: false,
  appointments: false,
  symptoms: false,
};

export function getOnboardingSelection(): OnboardingSelection {
  return selection;
}

export function setOnboardingSelection(next: OnboardingSelection): void {
  selection = next;
}

export function selectedKeys(value: OnboardingSelection): string[] {
  return (Object.keys(value) as (keyof OnboardingSelection)[]).filter((key) => value[key]);
}
