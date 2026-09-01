import type { TreatmentContext } from "@/repositories/onboardingStateRepository";

/**
 * Real repository state is always authoritative for whether the user
 * actually has an active medication/injection setup — onboarding's
 * `treatmentContext` is initial personalization *intent*, captured once
 * during onboarding, never a live source of truth (Phase R brief §15: "Be
 * careful: real medication/injection presence should come from actual
 * repositories. Do not let stale onboarding treatmentContext override real
 * app state... If actual medication/injection setup disagrees with
 * onboarding context: real data wins.").
 *
 * This function makes that rule an explicit, tested contract rather than
 * an implicit omission: it always returns `repositoryHasTreatment` and
 * never even inspects `treatmentContext`, even when they visibly disagree
 * — e.g. a user who said "both" at onboarding but never actually added a
 * medication or injection, or the reverse (added treatment after choosing
 * "none"/skipping the screen). No Phase R UI decision consults
 * `treatmentContext` directly; every "does the user have treatment set up"
 * check goes through this function (or the equivalent direct repository
 * read it wraps) instead.
 */
export function resolveHasTreatment(repositoryHasTreatment: boolean, _treatmentContext: TreatmentContext | null): boolean {
  return repositoryHasTreatment;
}
