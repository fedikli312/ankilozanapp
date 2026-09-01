import type { EntitlementStatus } from "./types";

export type RouteTarget = "onboarding" | "resolving" | "app" | "paywall";

/**
 * The single authoritative route decision for the whole app (Phase Q brief
 * §6, §34) — a pure function so it's fully unit-testable without React,
 * navigation, or RevenueCat. Consumed by exactly one place,
 * `app/_layout.tsx`'s route gate; no screen re-implements this logic.
 *
 * Priority order matters: onboarding-incomplete always wins regardless of
 * entitlement status (an onboarding-incomplete user is never routed to the
 * paywall or the app), and `unknown`/`loading` are never collapsed into
 * `not_entitled` — both are real product requirements, not incidental.
 */
export function resolveRouteTarget(onboardingCompleted: boolean, entitlement: EntitlementStatus): RouteTarget {
  if (!onboardingCompleted) return "onboarding";
  if (entitlement === "unknown" || entitlement === "loading") return "resolving";
  if (entitlement === "entitled") return "app";
  // "not_entitled" and "error" both land on the paywall — an unresolved
  // network error must never be treated as free access into the app, but
  // it's surfaced there with its own error/retry state (§7 of the spec),
  // not silently conflated with a genuine "no."
  return "paywall";
}
