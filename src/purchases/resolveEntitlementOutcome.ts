import type { Offerings } from "./types";

export type SettledResult<T> = { ok: true; value: T } | { ok: false };

export type EntitlementResolutionOutcome =
  | { kind: "entitled"; offerings: Offerings | null }
  | { kind: "not_entitled"; offerings: Offerings | null }
  | { kind: "error" };

/**
 * Combines the two independent async calls `EntitlementProvider.resolve()`
 * makes — `isEntitled()` (determines access) and `getOfferings()` (only
 * needed to render the paywall's plan cards) — into one outcome, without
 * letting a failure in the one call that doesn't gate access mask a
 * genuine answer from the one that does (Phase Q monetization-safety pass,
 * item 9).
 *
 * Before this existed, `EntitlementProvider.resolve()` awaited both calls
 * with `Promise.all`, so a network failure while fetching Offerings alone
 * — irrelevant to a user who is already entitled and never needs to see
 * purchase options — produced the same `"error"` outcome as a genuine
 * entitlement-check failure, hard-locking an already-paying, previously-
 * entitled user out of their own local health records over a transient
 * blip in fetching pricing data. RevenueCat's SDK already serves
 * `isEntitled()` from its on-device CustomerInfo cache by default
 * (`cachedOrFetched`, confirmed against current RevenueCat docs — see
 * `docs/PAYWALL_AND_ENTITLEMENT_SPECIFICATION.md` §4) when the network is
 * unreachable, so that call succeeding from cache while Offerings fails to
 * fetch live pricing is a real, expected scenario, not a hypothetical.
 *
 * Only `isEntitled()` failing outright (no cache, no network — a genuine
 * "we cannot determine access at all" case) produces `"error"`, which
 * still correctly routes to the paywall's own Retry state rather than
 * granting access on ambiguity.
 */
export function resolveEntitlementOutcome(
  entitledResult: SettledResult<boolean>,
  offeringsResult: SettledResult<Offerings>,
): EntitlementResolutionOutcome {
  if (!entitledResult.ok) return { kind: "error" };
  const offerings = offeringsResult.ok ? offeringsResult.value : null;
  return entitledResult.value ? { kind: "entitled", offerings } : { kind: "not_entitled", offerings };
}
