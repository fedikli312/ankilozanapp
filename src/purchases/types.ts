/**
 * Product 2.0 Phase Q — entitlement/purchase architecture
 * (`docs/PAYWALL_AND_ENTITLEMENT_SPECIFICATION.md`).
 *
 * `unknown`/`loading` are deliberately distinct from `not_entitled` — the
 * route gate (`entitlementMachine.ts`) must never treat "not yet checked"
 * as "checked, and it's a no." `error` is likewise distinct from
 * `not_entitled` — a network failure while resolving entitlement is not
 * the same fact as a resolved absence of entitlement (spec §4).
 */
export type EntitlementStatus = "unknown" | "loading" | "entitled" | "not_entitled" | "error";

export type PurchaseStatus = "idle" | "purchasing" | "restoring" | "success" | "cancelled" | "failed";

export type PackageIdentifier = "annual" | "monthly";

/**
 * Trial-offer eligibility is tri-state, not boolean (Phase Q monetization-
 * safety pass, item 1) — RevenueCat's own `checkTrialOrIntroductoryPriceEligibility`
 * can genuinely return "I don't know" (`UNKNOWN`, always the case on
 * Android, and possible on iOS when receipt/group data is incomplete), and
 * collapsing that into `false` would make the paywall claim "no trial" to a
 * user who might actually get one, while collapsing it into `true` would
 * risk promising a trial the store may not honor. Only an explicit
 * `"eligible"` may ever unlock trial copy — `"unknown"` must render exactly
 * like `"ineligible"` in the UI (a plain, non-trial subscribe CTA), never a
 * trial promise. See `resolveTrialEligibility` in `./trialEligibility.ts`
 * for the single place this mapping happens.
 */
export type TrialEligibility = "eligible" | "ineligible" | "unknown";

/**
 * A single purchasable package, described only in terms the UI needs —
 * never a raw RevenueCat SDK type. All price/trial fields come from the
 * store at runtime; nothing here is ever a hardcoded price (spec §3 of the
 * Phase Q brief).
 */
export type PurchasePackageInfo = {
  identifier: PackageIdentifier;
  /** Localized, store-provided price string for the recurring price (e.g. "$49.99" / "₺1.499,00") — never computed/formatted manually. */
  priceString: string;
  /** Tri-state — see `TrialEligibility`. Only `"eligible"` may drive trial copy. */
  trialEligibility: TrialEligibility;
  /** Localized trial length in days, only meaningful when `trialEligibility === "eligible"`. */
  trialDays: number | null;
};

export type Offerings = {
  annual: PurchasePackageInfo | null;
  monthly: PurchasePackageInfo | null;
};

export type PurchaseResult =
  | { outcome: "success" }
  | { outcome: "cancelled" }
  | { outcome: "failed"; message: string };

export type RestoreResult =
  | { outcome: "entitled" }
  | { outcome: "not_entitled" }
  | { outcome: "failed"; message: string };

/**
 * The provider boundary (Phase Q brief §23) — screens depend on this
 * interface only, never on `react-native-purchases` directly. The native
 * implementation (`purchaseClient.ts`) wraps the real SDK; the web
 * implementation (`purchaseClient.web.ts`) is a deterministic mock, picked
 * automatically by Metro's platform-file resolution — the same pattern
 * already used for `src/db`, `src/repositories`, `src/notifications`.
 */
export interface PurchaseClient {
  configure(): Promise<void>;
  /** Whether the `premium` entitlement is currently active. Throws on genuine failure (caller maps that to `error`, never `not_entitled`). */
  isEntitled(): Promise<boolean>;
  getOfferings(): Promise<Offerings>;
  purchase(packageId: PackageIdentifier): Promise<PurchaseResult>;
  restore(): Promise<RestoreResult>;
}
