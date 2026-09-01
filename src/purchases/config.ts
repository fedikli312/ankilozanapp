/**
 * Placeholder RevenueCat/App Store configuration — Phase Q brief §26:
 * "Do not invent product IDs as if they were final... centralize clearly
 * marked placeholders/config."
 *
 * None of this is a secret. RevenueCat's public SDK API key (like Stripe's
 * publishable key) is designed to ship inside a client app — it is not
 * sensitive on its own. It is a placeholder here purely because no
 * RevenueCat project or App Store Connect app has been configured yet
 * (explicitly out of scope for Phase Q) — not because it needs protecting.
 * Replace every value below only once the real RevenueCat project and App
 * Store Connect subscription products exist, matching this exact set of
 * identifiers on both sides.
 */

/** PLACEHOLDER — RevenueCat public iOS API key. Configure() will fail loudly against this value; that's intentional until a real project exists. */
export const REVENUECAT_API_KEY_IOS = "REPLACE_WITH_REVENUECAT_IOS_PUBLIC_API_KEY";

/** The one entitlement this product checks (spec §6 — "does the user have access," not "did they buy annual"). */
export const ENTITLEMENT_IDENTIFIER = "premium";

/**
 * The RevenueCat Offering identifier to fetch packages from, if a specific
 * (non-"current") offering is ever needed — the native client currently
 * reads `offerings.current`, RevenueCat's own idiomatic "whichever
 * offering is marked current in the dashboard" pattern, which needs no
 * identifier at all. Kept here, unused for now, for the day a specific
 * named offering (e.g. an A/B test variant) needs to be targeted directly.
 */
export const OFFERING_IDENTIFIER = "default";

/** RevenueCat's own conventional cross-platform package identifiers for an annual/monthly pair — real once Offerings are configured in the RevenueCat dashboard, not invented by this app. */
export const PACKAGE_IDENTIFIER_ANNUAL = "$rc_annual";
export const PACKAGE_IDENTIFIER_MONTHLY = "$rc_monthly";

/**
 * Apple's own Standard Licensed Application End User License Agreement —
 * the default Terms of Use every App Store app is bound by unless the
 * developer configures a Custom EULA in App Store Connect (Phase Q
 * monetization-safety pass, item 3). This app has not created a custom
 * EULA, so this is the correct, real Terms destination, confirmed directly
 * against Apple's own published URL (Sept 2026) rather than invented —
 * https://www.apple.com/legal/internet-services/itunes/dev/stdeula/ is
 * Apple's iOS/iTunes Standard EULA (distinct from the macOS-apps variant at
 * .../legal/macapps/stdeula/, not applicable here). If a product-specific
 * Terms requirement ever exists that the Standard EULA doesn't satisfy, a
 * Custom EULA must be configured in App Store Connect and this constant
 * updated to point at it — do not silently keep this value in that case.
 */
export const APPLE_EULA_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

/**
 * BLOCKER (Phase Q monetization-safety pass, item 4): no public Privacy
 * Policy URL has been created or approved for this project yet. `null` is
 * the honest value here — never a fabricated or guessed URL. The paywall's
 * Privacy action falls back to the existing in-app privacy explanation
 * (`app/paywall-privacy.tsx`) while this stays `null`. This constant is the
 * one place to set the real URL once it exists — App Store Connect's
 * subscription/app-privacy metadata will need it too, not just this
 * screen, before this product can be submitted for review.
 */
export const PRIVACY_POLICY_URL: string | null = null;
