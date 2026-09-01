import { resolveRouteTarget } from "../entitlementMachine";

describe("resolveRouteTarget", () => {
  it("onboarding incomplete → onboarding, regardless of entitlement", () => {
    expect(resolveRouteTarget(false, "unknown")).toBe("onboarding");
    expect(resolveRouteTarget(false, "entitled")).toBe("onboarding");
    expect(resolveRouteTarget(false, "not_entitled")).toBe("onboarding");
  });

  it("onboarding complete + entitlement unknown → resolving", () => {
    expect(resolveRouteTarget(true, "unknown")).toBe("resolving");
  });

  it("onboarding complete + entitlement loading → resolving", () => {
    expect(resolveRouteTarget(true, "loading")).toBe("resolving");
  });

  it("onboarding complete + not entitled → paywall", () => {
    expect(resolveRouteTarget(true, "not_entitled")).toBe("paywall");
  });

  it("onboarding complete + entitled → app", () => {
    expect(resolveRouteTarget(true, "entitled")).toBe("app");
  });

  it("onboarding complete + entitlement resolution error → paywall, never a silent bypass", () => {
    expect(resolveRouteTarget(true, "error")).toBe("paywall");
  });

  it("never treats unknown/loading as not_entitled (never flashes the paywall to an unresolved user)", () => {
    expect(resolveRouteTarget(true, "unknown")).not.toBe("paywall");
    expect(resolveRouteTarget(true, "loading")).not.toBe("paywall");
  });

  it("never treats unknown/loading as entitled (never flashes the app to an unresolved user)", () => {
    expect(resolveRouteTarget(true, "unknown")).not.toBe("app");
    expect(resolveRouteTarget(true, "loading")).not.toBe("app");
  });
});
