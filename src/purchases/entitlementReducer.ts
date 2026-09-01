import type { EntitlementStatus, Offerings, PurchaseStatus } from "./types";

export type EntitlementState = {
  status: EntitlementStatus;
  offerings: Offerings | null;
  purchaseStatus: PurchaseStatus;
  purchaseErrorMessage: string | null;
  /** Which action the current `purchaseStatus` belongs to — lets the UI show "no subscription found to restore" only after an actual restore attempt, never after a purchase attempt (both can land on the same `not_entitled` outcome, but the correct message differs). */
  lastAction: "purchase" | "restore" | null;
};

export type EntitlementAction =
  | { type: "RESOLVE_START" }
  | { type: "RESOLVE_ENTITLED"; offerings: Offerings | null }
  | { type: "RESOLVE_NOT_ENTITLED"; offerings: Offerings | null }
  | { type: "RESOLVE_ERROR" }
  | { type: "PURCHASE_START" }
  | { type: "RESTORE_START" }
  | { type: "PURCHASE_RESULT_ENTITLED" }
  | { type: "PURCHASE_RESULT_CANCELLED" }
  | { type: "PURCHASE_RESULT_FAILED"; message: string }
  | { type: "PURCHASE_RESULT_NOT_ENTITLED" };

export const initialEntitlementState: EntitlementState = {
  status: "unknown",
  offerings: null,
  purchaseStatus: "idle",
  purchaseErrorMessage: null,
  lastAction: null,
};

/**
 * Pure reducer — the entire entitlement/purchase state machine
 * (`docs/PAYWALL_AND_ENTITLEMENT_SPECIFICATION.md` §7), independent of
 * React and of `react-native-purchases`, so it's directly unit-testable
 * (Phase Q brief §33) without touching native StoreKit or a rendered
 * component at all.
 */
export function entitlementReducer(state: EntitlementState, action: EntitlementAction): EntitlementState {
  switch (action.type) {
    case "RESOLVE_START":
      return { ...state, status: "loading" };
    case "RESOLVE_ENTITLED":
      return { ...state, status: "entitled", offerings: action.offerings };
    case "RESOLVE_NOT_ENTITLED":
      return { ...state, status: "not_entitled", offerings: action.offerings };
    case "RESOLVE_ERROR":
      return { ...state, status: "error" };
    case "PURCHASE_START":
      return { ...state, purchaseStatus: "purchasing", purchaseErrorMessage: null, lastAction: "purchase" };
    case "RESTORE_START":
      return { ...state, purchaseStatus: "restoring", purchaseErrorMessage: null, lastAction: "restore" };
    case "PURCHASE_RESULT_ENTITLED":
      return { ...state, purchaseStatus: "success", status: "entitled" };
    case "PURCHASE_RESULT_CANCELLED":
      // User cancellation is non-fatal — status stays whatever it was
      // (still not_entitled, still on the paywall), never surfaced as an
      // error (Phase Q brief §18: "Cancellation should NOT be shown as a
      // scary error").
      return { ...state, purchaseStatus: "cancelled" };
    case "PURCHASE_RESULT_FAILED":
      return { ...state, purchaseStatus: "failed", purchaseErrorMessage: action.message };
    case "PURCHASE_RESULT_NOT_ENTITLED":
      // A purchase/restore call that reported success but whose
      // entitlement didn't actually verify — stays on the paywall rather
      // than trusting the call's own claimed outcome (Phase Q brief
      // §18/§33: "purchase success but entitlement absent → stay paywall").
      return { ...state, purchaseStatus: "failed", status: "not_entitled", purchaseErrorMessage: null };
    default:
      return state;
  }
}
