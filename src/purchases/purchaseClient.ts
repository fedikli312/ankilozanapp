import Purchases, { INTRO_ELIGIBILITY_STATUS, PURCHASES_ERROR_CODE, type PurchasesError } from "react-native-purchases";

import {
  ENTITLEMENT_IDENTIFIER,
  PACKAGE_IDENTIFIER_ANNUAL,
  PACKAGE_IDENTIFIER_MONTHLY,
  REVENUECAT_API_KEY_IOS,
} from "./config";
import { resolveTrialEligibility, type IntroEligibilityStatus } from "./trialEligibility";
import type {
  Offerings,
  PackageIdentifier,
  PurchaseClient,
  PurchasePackageInfo,
  PurchaseResult,
  RestoreResult,
} from "./types";

/** Maps RevenueCat's own enum to this app's platform-free `IntroEligibilityStatus` union (see `trialEligibility.ts`) — the one place that translation happens. */
function toIntroEligibilityStatus(status: INTRO_ELIGIBILITY_STATUS | undefined): IntroEligibilityStatus {
  switch (status) {
    case INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE:
      return "ELIGIBLE";
    case INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_INELIGIBLE:
      return "INELIGIBLE";
    case INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_NO_INTRO_OFFER_EXISTS:
      return "NO_INTRO_OFFER_EXISTS";
    case INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN:
      return "UNKNOWN";
    default:
      // The eligibility API didn't return an entry for this product at all
      // (e.g. the whole call threw and was caught below) — we genuinely
      // never asked, which must resolve the same as the store saying it
      // doesn't know, never as "no trial."
      return "NOT_CHECKED";
  }
}

/**
 * Native RevenueCat implementation of the `PurchaseClient` boundary
 * (`docs/PAYWALL_AND_ENTITLEMENT_SPECIFICATION.md` §6). Real purchases only
 * function inside a development build or a real device — inside Expo Go,
 * `react-native-purchases` itself automatically substitutes its own
 * "Preview API Mode" JS mocks (per RevenueCat's own current docs), so this
 * file is safe to run there without crashing, but nothing here can be
 * exercised as a real purchase QA path until that build exists (spec §2,
 * Phase Q brief §25 — "Real purchase QA deferred until native
 * development build/device phase").
 */
export const purchaseClient: PurchaseClient = {
  async configure() {
    Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
  },

  async isEntitled() {
    // No `fetchPolicy` parameter to pass here — checked directly against
    // this exact installed version's own type definitions
    // (`react-native-purchases@10.8.1`'s `purchases.d.ts`):
    // `getCustomerInfo(): Promise<CustomerInfo>` takes no arguments in this
    // JS wrapper, unlike the native iOS/Android SDKs it wraps (which do
    // expose a `CacheFetchPolicy`). That's not a gap to work around here —
    // RevenueCat's own documented SDK-wide default fetch policy is
    // `cachedOrFetched` regardless of which platform wrapper is used: it
    // returns the on-device cached `CustomerInfo` (even if stale) when the
    // network call fails, rather than throwing. So this call already
    // benefits from offline-cached entitlement without any extra code —
    // see `docs/PAYWALL_AND_ENTITLEMENT_SPECIFICATION.md` §4 for the full
    // cache-TTL/grace-period details. It still throws when there is
    // genuinely no cache and no network at all (e.g. first launch,
    // offline) — that failure is intentionally not swallowed here; the
    // caller (`EntitlementProvider.resolve`, via `resolveEntitlementOutcome`)
    // maps it to the `"error"` route, never to a fabricated `false`.
    const customerInfo = await Purchases.getCustomerInfo();
    return Boolean(customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER]);
  },

  async getOfferings() {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];

    const annualPkg = packages.find((p) => p.identifier === PACKAGE_IDENTIFIER_ANNUAL) ?? null;
    const monthlyPkg = packages.find((p) => p.identifier === PACKAGE_IDENTIFIER_MONTHLY) ?? null;

    const productIdentifiers = [annualPkg?.product.identifier, monthlyPkg?.product.identifier].filter(
      (id): id is string => Boolean(id),
    );

    // Always UNKNOWN on Android, and possible on iOS with incomplete
    // receipt/group data — the tri-state model in `trialEligibility.ts` is
    // what makes that a first-class, correctly-rendered UI state instead
    // of a silently-dropped edge case (spec: "do not hardcode a trial CTA
    // when eligibility cannot be confirmed").
    let eligibility: Record<string, { status: INTRO_ELIGIBILITY_STATUS }> = {};
    try {
      if (productIdentifiers.length > 0) {
        eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIdentifiers);
      }
    } catch {
      // The whole eligibility call failed (e.g. offline) — leave `eligibility`
      // empty so every product maps to `toIntroEligibilityStatus(undefined)`
      // → `"NOT_CHECKED"` → `"unknown"`, never `"ineligible"`.
      eligibility = {};
    }

    const toPackageInfo = (
      pkg: NonNullable<typeof annualPkg>,
      identifier: PackageIdentifier,
    ): PurchasePackageInfo => {
      const intro = pkg.product.introPrice;
      const hasDayBasedIntroPrice = intro !== null && intro !== undefined && intro.periodUnit === "DAY";
      const status = toIntroEligibilityStatus(eligibility[pkg.product.identifier]?.status);
      const trialEligibility = resolveTrialEligibility({ hasDayBasedIntroPrice, status });
      return {
        identifier,
        priceString: pkg.product.priceString,
        trialEligibility,
        trialDays: trialEligibility === "eligible" ? intro!.periodNumberOfUnits : null,
      };
    };

    const result: Offerings = {
      annual: annualPkg ? toPackageInfo(annualPkg, "annual") : null,
      monthly: monthlyPkg ? toPackageInfo(monthlyPkg, "monthly") : null,
    };
    return result;
  },

  async purchase(packageId: PackageIdentifier): Promise<PurchaseResult> {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    const identifier = packageId === "annual" ? PACKAGE_IDENTIFIER_ANNUAL : PACKAGE_IDENTIFIER_MONTHLY;
    const pkg = packages.find((p) => p.identifier === identifier);
    if (!pkg) {
      return { outcome: "failed", message: "Package not available." };
    }

    try {
      await Purchases.purchasePackage(pkg);
      return { outcome: "success" };
    } catch (error) {
      const purchasesError = error as PurchasesError;
      // Checked directly against this exact installed version's own type
      // definitions (`@revenuecat/purchases-typescript-internal@10.8.1`'s
      // `errors.d.ts`), not general community docs, which described an
      // older pattern: that package's `PurchasesError.userCancelled` field
      // is explicitly marked `@deprecated — use code ===
      // PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR instead`, i.e. the
      // reverse of what some older RevenueCat community posts suggest. The
      // `code` comparison below is the currently-correct check for this
      // installed version, not a fallback.
      if (purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return { outcome: "cancelled" };
      }
      return { outcome: "failed", message: purchasesError.message ?? "Purchase failed." };
    }
  },

  async restore(): Promise<RestoreResult> {
    // `restorePurchases()` resolving is not itself "restore succeeded" —
    // it can resolve normally for a user with no purchase history at all,
    // or a lapsed one. The returned `CustomerInfo`'s active entitlements
    // are the only authoritative signal (Phase Q monetization-safety pass,
    // item 7: "restore API completion != restore success").
    try {
      const customerInfo = await Purchases.restorePurchases();
      const entitled = Boolean(customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER]);
      return { outcome: entitled ? "entitled" : "not_entitled" };
    } catch (error) {
      const purchasesError = error as PurchasesError;
      return { outcome: "failed", message: purchasesError.message ?? "Restore failed." };
    }
  },
};
