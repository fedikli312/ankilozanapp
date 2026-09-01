import type { Offerings, PackageIdentifier, PurchaseClient, PurchaseResult, RestoreResult, TrialEligibility } from "./types";

/**
 * Dev-web-preview-only mock — never bundled into native builds (Metro
 * `.web.ts` platform resolution, the same pattern already used throughout
 * this codebase for `src/db`, `src/repositories`, `src/notifications`).
 * `react-native-purchases` is never imported here, so it is never present
 * in the web bundle at all (Phase Q brief §22: "no native purchase module
 * crash on web," "web mock must never leak into native production").
 *
 * Real StoreKit/Play purchases cannot be meaningfully tested through a
 * browser under any circumstances — this mock exists solely so the paywall
 * UI and the route gate can be visually reviewed, never as a stand-in for
 * real purchase QA (deferred to a native development build, per spec §2).
 *
 * Deterministic and dev-controllable via URL query params, so a specific
 * state can be reviewed directly by navigating to it — not a hidden
 * backdoor (it only ever exists in the web bundle, which is never a
 * production target — Redesign Spec §21), and not a random/AI-driven mock:
 *   ?entitlement=entitled   — start already entitled
 *   ?entitlement=error      — simulate an entitlement-resolution failure
 *   ?purchase=cancelled     — simulate the user cancelling a purchase
 *   ?purchase=failed        — simulate a purchase failure
 *   ?restore=entitled       — simulate a successful restore
 *   ?restore=failed         — simulate a restore failure
 *   ?trial=eligible|ineligible|unknown — the Annual package's tri-state
 *     trial eligibility (default "eligible"), so all three paywall states
 *     can be reviewed (Phase Q monetization-safety pass, item 1). Monthly
 *     is always "ineligible" — it's the no-initial-trial secondary plan by
 *     product decision, not a state under review here.
 */
function queryParam(name: string): string | null {
  if (typeof window === "undefined" || !window.location) return null;
  return new URLSearchParams(window.location.search).get(name);
}

function mockAnnualTrialEligibility(): TrialEligibility {
  const raw = queryParam("trial");
  if (raw === "ineligible" || raw === "unknown") return raw;
  return "eligible";
}

function buildMockOfferings(): Offerings {
  const trialEligibility = mockAnnualTrialEligibility();
  return {
    annual: {
      identifier: "annual",
      priceString: "$49.99",
      trialEligibility,
      trialDays: trialEligibility === "eligible" ? 7 : null,
    },
    monthly: { identifier: "monthly", priceString: "$5.99", trialEligibility: "ineligible", trialDays: null },
  };
}

let mockEntitled = queryParam("entitlement") === "entitled";

export const purchaseClient: PurchaseClient = {
  async configure() {
    // Nothing to configure for the mock.
  },

  async isEntitled() {
    if (queryParam("entitlement") === "error") {
      throw new Error("Mock entitlement resolution error (web preview only).");
    }
    return mockEntitled;
  },

  async getOfferings() {
    return buildMockOfferings();
  },

  async purchase(_packageId: PackageIdentifier): Promise<PurchaseResult> {
    if (queryParam("purchase") === "cancelled") return { outcome: "cancelled" };
    if (queryParam("purchase") === "failed") {
      return { outcome: "failed", message: "Mock purchase failure (web preview only)." };
    }
    mockEntitled = true;
    return { outcome: "success" };
  },

  async restore(): Promise<RestoreResult> {
    if (queryParam("restore") === "failed") {
      return { outcome: "failed", message: "Mock restore failure (web preview only)." };
    }
    if (mockEntitled || queryParam("restore") === "entitled") {
      mockEntitled = true;
      return { outcome: "entitled" };
    }
    return { outcome: "not_entitled" };
  },
};
