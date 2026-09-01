import { entitlementReducer, initialEntitlementState, type EntitlementState } from "../entitlementReducer";

const entitledState: EntitlementState = { ...initialEntitlementState, status: "not_entitled" };

describe("entitlementReducer", () => {
  it("purchase success + entitlement active → entitled, app-eligible", () => {
    const purchasing = entitlementReducer(entitledState, { type: "PURCHASE_START" });
    expect(purchasing.purchaseStatus).toBe("purchasing");

    const result = entitlementReducer(purchasing, { type: "PURCHASE_RESULT_ENTITLED" });
    expect(result.status).toBe("entitled");
    expect(result.purchaseStatus).toBe("success");
  });

  it("purchase success but entitlement absent → stays not_entitled (paywall), never silently entitled", () => {
    const purchasing = entitlementReducer(entitledState, { type: "PURCHASE_START" });
    const result = entitlementReducer(purchasing, { type: "PURCHASE_RESULT_NOT_ENTITLED" });
    expect(result.status).toBe("not_entitled");
    expect(result.purchaseStatus).not.toBe("success");
  });

  it("restore + entitlement → entitled, app-eligible", () => {
    const restoring = entitlementReducer(entitledState, { type: "RESTORE_START" });
    expect(restoring.purchaseStatus).toBe("restoring");

    const result = entitlementReducer(restoring, { type: "PURCHASE_RESULT_ENTITLED" });
    expect(result.status).toBe("entitled");
  });

  it("restore without entitlement → stays not_entitled (paywall)", () => {
    const restoring = entitlementReducer(entitledState, { type: "RESTORE_START" });
    const result = entitlementReducer(restoring, { type: "PURCHASE_RESULT_NOT_ENTITLED" });
    expect(result.status).toBe("not_entitled");
  });

  it("user cancellation is non-fatal — status is untouched, no error message set", () => {
    const purchasing = entitlementReducer(entitledState, { type: "PURCHASE_START" });
    const result = entitlementReducer(purchasing, { type: "PURCHASE_RESULT_CANCELLED" });
    expect(result.purchaseStatus).toBe("cancelled");
    expect(result.status).toBe("not_entitled");
    expect(result.purchaseErrorMessage).toBeNull();
  });

  it("purchase failure carries a message and never flips entitlement", () => {
    const purchasing = entitlementReducer(entitledState, { type: "PURCHASE_START" });
    const result = entitlementReducer(purchasing, { type: "PURCHASE_RESULT_FAILED", message: "network error" });
    expect(result.purchaseStatus).toBe("failed");
    expect(result.purchaseErrorMessage).toBe("network error");
    expect(result.status).toBe("not_entitled");
  });

  it("offering/entitlement resolution error never grants entitlement", () => {
    const loading = entitlementReducer(initialEntitlementState, { type: "RESOLVE_START" });
    expect(loading.status).toBe("loading");

    const result = entitlementReducer(loading, { type: "RESOLVE_ERROR" });
    expect(result.status).toBe("error");
  });

  it("resolve not-entitled still stores offerings for the paywall to render", () => {
    const offerings = { annual: null, monthly: null };
    const result = entitlementReducer(initialEntitlementState, { type: "RESOLVE_NOT_ENTITLED", offerings });
    expect(result.status).toBe("not_entitled");
    expect(result.offerings).toBe(offerings);
  });
});
