import { resolveEntitlementOutcome } from "../resolveEntitlementOutcome";
import type { Offerings } from "../types";

const offerings: Offerings = { annual: null, monthly: null };

describe("resolveEntitlementOutcome", () => {
  it("isEntitled fails outright → error, regardless of offerings", () => {
    expect(resolveEntitlementOutcome({ ok: false }, { ok: true, value: offerings })).toEqual({ kind: "error" });
    expect(resolveEntitlementOutcome({ ok: false }, { ok: false })).toEqual({ kind: "error" });
  });

  it("isEntitled succeeds true + offerings fails → still entitled, with null offerings (the offline-cache-preserved-access case, item 9)", () => {
    expect(resolveEntitlementOutcome({ ok: true, value: true }, { ok: false })).toEqual({
      kind: "entitled",
      offerings: null,
    });
  });

  it("isEntitled succeeds true + offerings succeeds → entitled, with the real offerings", () => {
    expect(resolveEntitlementOutcome({ ok: true, value: true }, { ok: true, value: offerings })).toEqual({
      kind: "entitled",
      offerings,
    });
  });

  it("isEntitled succeeds false + offerings fails → not_entitled, with null offerings (paywall renders its own offerings-error state)", () => {
    expect(resolveEntitlementOutcome({ ok: true, value: false }, { ok: false })).toEqual({
      kind: "not_entitled",
      offerings: null,
    });
  });

  it("isEntitled succeeds false + offerings succeeds → not_entitled, with the real offerings", () => {
    expect(resolveEntitlementOutcome({ ok: true, value: false }, { ok: true, value: offerings })).toEqual({
      kind: "not_entitled",
      offerings,
    });
  });
});
