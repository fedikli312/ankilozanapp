import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type PropsWithChildren } from "react";

import { entitlementReducer, initialEntitlementState, type EntitlementState } from "./entitlementReducer";
import { purchaseClient } from "./purchaseClient";
import { resolveEntitlementOutcome, type SettledResult } from "./resolveEntitlementOutcome";
import type { PackageIdentifier } from "./types";

/** Adapts a promise into the `SettledResult` shape `resolveEntitlementOutcome` consumes, without letting either call's rejection short-circuit the other (see that module's doc comment for why `Promise.all` was wrong here). */
function settle<T>(promise: Promise<T>): Promise<SettledResult<T>> {
  return promise.then(
    (value) => ({ ok: true as const, value }),
    () => ({ ok: false as const }),
  );
}

export type EntitlementContextValue = EntitlementState & {
  retryResolution: () => void;
  purchase: (packageId: PackageIdentifier) => Promise<void>;
  restore: () => Promise<void>;
};

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

/**
 * Product 2.0 Phase Q — the one shared entitlement/purchase state for the
 * whole app session (`docs/PAYWALL_AND_ENTITLEMENT_SPECIFICATION.md` §7-8).
 * A justified, minimal use of React Context: entitlement resolution is
 * async session state genuinely shared between the route gate
 * (`app/_layout.tsx`) and the paywall screen, not per-screen domain data —
 * Tech Arch §K's "no global store" rule is about domain/health data (still
 * respected everywhere else); its own stated escalation path explicitly
 * allows "a minimal event emitter or React Context invalidation counter"
 * for exactly this kind of cross-cutting session state, the same category
 * `DatabaseProvider` already occupies for migration readiness.
 *
 * All state transitions live in the pure `entitlementReducer` — this
 * component only wires it to the async `PurchaseClient` boundary. Resolves
 * entitlement once per app session, on mount, independent of onboarding
 * completion (the route gate itself decides whether entitlement matters
 * yet for a given user).
 */
export function EntitlementProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(entitlementReducer, initialEntitlementState);

  const resolve = useCallback(async () => {
    dispatch({ type: "RESOLVE_START" });
    try {
      await purchaseClient.configure();
    } catch {
      dispatch({ type: "RESOLVE_ERROR" });
      return;
    }

    // `isEntitled()` and `getOfferings()` are settled independently (never
    // `Promise.all`) so a transient failure fetching Offerings — needed
    // only to render the paywall's plan cards — can never mask a genuine
    // cached `isEntitled()` answer and hard-lock an already-entitled user
    // out of the app over a temporary network blip (Phase Q monetization-
    // safety pass, item 9; see `resolveEntitlementOutcome.ts`).
    const [entitledResult, offeringsResult] = await Promise.all([
      settle(purchaseClient.isEntitled()),
      settle(purchaseClient.getOfferings()),
    ]);
    const outcome = resolveEntitlementOutcome(entitledResult, offeringsResult);
    if (outcome.kind === "error") {
      dispatch({ type: "RESOLVE_ERROR" });
    } else if (outcome.kind === "entitled") {
      dispatch({ type: "RESOLVE_ENTITLED", offerings: outcome.offerings });
    } else {
      dispatch({ type: "RESOLVE_NOT_ENTITLED", offerings: outcome.offerings });
    }
  }, []);

  useEffect(() => {
    resolve();
  }, [resolve]);

  const purchase = useCallback(async (packageId: PackageIdentifier) => {
    dispatch({ type: "PURCHASE_START" });
    const result = await purchaseClient.purchase(packageId);
    if (result.outcome === "cancelled") {
      dispatch({ type: "PURCHASE_RESULT_CANCELLED" });
      return;
    }
    if (result.outcome === "failed") {
      dispatch({ type: "PURCHASE_RESULT_FAILED", message: result.message });
      return;
    }
    // outcome === "success" — verify the entitlement actually took, rather
    // than trusting the purchase call's own report.
    try {
      const entitled = await purchaseClient.isEntitled();
      dispatch(entitled ? { type: "PURCHASE_RESULT_ENTITLED" } : { type: "PURCHASE_RESULT_NOT_ENTITLED" });
    } catch {
      dispatch({ type: "PURCHASE_RESULT_NOT_ENTITLED" });
    }
  }, []);

  const restore = useCallback(async () => {
    dispatch({ type: "RESTORE_START" });
    const result = await purchaseClient.restore();
    if (result.outcome === "failed") {
      dispatch({ type: "PURCHASE_RESULT_FAILED", message: result.message });
      return;
    }
    dispatch(result.outcome === "entitled" ? { type: "PURCHASE_RESULT_ENTITLED" } : { type: "PURCHASE_RESULT_NOT_ENTITLED" });
  }, []);

  const value = useMemo<EntitlementContextValue>(
    () => ({ ...state, retryResolution: resolve, purchase, restore }),
    [state, resolve, purchase, restore],
  );

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement(): EntitlementContextValue {
  const context = useContext(EntitlementContext);
  if (!context) {
    throw new Error("useEntitlement must be used within an EntitlementProvider");
  }
  return context;
}
