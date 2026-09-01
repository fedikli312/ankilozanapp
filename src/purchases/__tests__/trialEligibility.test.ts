import { resolveTrialEligibility, shouldShowTrialCopy } from "../trialEligibility";

describe("resolveTrialEligibility", () => {
  it("trial eligible: day-based intro price + store confirms ELIGIBLE → eligible", () => {
    expect(resolveTrialEligibility({ hasDayBasedIntroPrice: true, status: "ELIGIBLE" })).toBe("eligible");
  });

  it("trial ineligible: day-based intro price + store confirms INELIGIBLE → ineligible", () => {
    expect(resolveTrialEligibility({ hasDayBasedIntroPrice: true, status: "INELIGIBLE" })).toBe("ineligible");
  });

  it("trial ineligible: no introductory offer exists on the product at all → ineligible, regardless of status", () => {
    expect(resolveTrialEligibility({ hasDayBasedIntroPrice: true, status: "NO_INTRO_OFFER_EXISTS" })).toBe("ineligible");
    expect(resolveTrialEligibility({ hasDayBasedIntroPrice: false, status: "ELIGIBLE" })).toBe("ineligible");
  });

  it("trial unknown: store cannot determine eligibility (always the case on Android) → unknown, never eligible", () => {
    expect(resolveTrialEligibility({ hasDayBasedIntroPrice: true, status: "UNKNOWN" })).toBe("unknown");
  });

  it("trial unknown: eligibility was never checked at all (e.g. the API call itself failed) → unknown, never ineligible", () => {
    expect(resolveTrialEligibility({ hasDayBasedIntroPrice: true, status: "NOT_CHECKED" })).toBe("unknown");
  });

  it("unknown never silently converts to eligible under any input combination", () => {
    const statuses = ["ELIGIBLE", "INELIGIBLE", "NO_INTRO_OFFER_EXISTS", "UNKNOWN", "NOT_CHECKED"] as const;
    for (const status of statuses) {
      for (const hasDayBasedIntroPrice of [true, false]) {
        const result = resolveTrialEligibility({ hasDayBasedIntroPrice, status });
        if (status === "UNKNOWN" || status === "NOT_CHECKED") {
          expect(result).not.toBe("eligible");
        }
      }
    }
  });
});

describe("shouldShowTrialCopy", () => {
  it("only 'eligible' may show trial copy — 'ineligible' and 'unknown' both render the plain subscribe CTA", () => {
    expect(shouldShowTrialCopy("eligible")).toBe(true);
    expect(shouldShowTrialCopy("ineligible")).toBe(false);
    expect(shouldShowTrialCopy("unknown")).toBe(false);
  });
});
