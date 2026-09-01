# Paywall & Entitlement Specification — Product 2.0 Phase Q

Status: **Draft, implementation in progress — updated after a monetization-safety pass (Sept 2026).** Records the current official requirements this phase is built against, and the architecture decisions that follow from them. Not a general research dump — only what directly constrains implementation. §1a, §2a, §4, and §11–13 below were added or corrected during the monetization-safety pass; everywhere else is unchanged from the initial draft.

---

## 1. Apple requirements (App Store Review Guideline 3.1.2)

Confirmed directly against Apple's own guideline text and current RevenueCat/community guidance (Sept 2026), not from memory:

- An auto-renewable subscription must provide **ongoing value** and last **≥ 7 days**, available across the user's devices.
- The app binary itself (not just App Store metadata) must disclose: **subscription title, length, price** (and price-per-unit where relevant), plus **functional links to Privacy Policy and Terms of Use (EULA)**.
- Misleading marketing, scams, or fraud around the entitlement are explicit grounds for removal.
- (Carried forward from Phase M's research, still current) Apple actively rejects **toggle-based trial UI** — plans must be shown as separate, always-visible cards, never a single card with a trial on/off switch.

**Binding for this phase's UI**: the paywall screen itself must show title/duration/price/trial-terms/Restore/Terms/Privacy — not defer any of them to a separate marketing screen.

## 1a. Terms of Use — Apple Standard EULA (monetization-safety pass, item 3)

This project has not configured a Custom EULA in App Store Connect, so Apple's own **Standard Licensed Application End User License Agreement** is the real, binding Terms document for this app — not something to invent or leave as a placeholder. Confirmed directly against Apple's own published legal page (Sept 2026): **https://www.apple.com/legal/internet-services/itunes/dev/stdeula/** (the iOS/iTunes variant — distinct from `.../legal/macapps/stdeula/`, which applies to macOS apps and is not relevant here). Centralized as `APPLE_EULA_URL` in `src/purchases/config.ts`; the paywall's "Terms" action opens it directly via `Linking.openURL`. The temporary `app/paywall-terms.tsx` in-app placeholder route (used before this was resolved) has been removed — it is no longer needed. If a product-specific Terms requirement ever arises that the Standard EULA doesn't cover, a Custom EULA must be configured in App Store Connect and `APPLE_EULA_URL` updated to point at it; this has not been evaluated as necessary for this app.

## 1b. Privacy Policy — public URL blocker (monetization-safety pass, item 4)

Two distinct things are being conflated if not kept separate: **(a)** the in-app privacy explanation this app already has (`app/profile/privacy-data`, mirrored at the ungated `app/paywall-privacy.tsx` for paywall access) — real content, already correct, used for current development UX — and **(b)** a **public Privacy Policy URL**, which Apple requires both in the app binary and in App Store Connect's app-privacy/subscription metadata before submission. **No public Privacy Policy URL exists for this project.** It is not invented here. `PRIVACY_POLICY_URL` in `src/purchases/config.ts` stays explicitly `null` until a real one exists, documented as a blocker; the paywall's Privacy action continues to open the in-app screen while it stays `null`.

> **BLOCKER BEFORE APP STORE SUBMISSION:** A public Privacy Policy URL must be published and configured both in the application and App Store Connect. This blocker does NOT prevent committing Phase Q.

## 2. RevenueCat + Expo/React Native — current compatibility

Checked directly against the npm registry and RevenueCat's own docs (Sept 2026):

- Latest `react-native-purchases`: **10.8.1**. Peer dependencies: `react >= 16.6.3`, `react-native >= 0.73.0`, `react-native-web` (optional, `*`). This project has `react` 19.2.3, `react-native` 0.86.2 — both satisfy the peer range with no version conflict.
- A `npm install react-native-purchases --dry-run` against this project's actual `package.json`/`package-lock.json` resolves as a **clean addition of 112 new packages** (the SDK plus its own transitive deps) with **zero changes to any existing package** — confirmed by inspecting the dry-run output for `remove`/`change`/`deduped` lines (none found) and confirming `git diff --stat` on `package.json`/`package-lock.json` stays empty after the dry run. This is a materially different situation from Phase L's `expo install` conflict.
- **Expo Go does not support real purchases.** The SDK detects Expo Go automatically and runs a built-in "Preview API Mode" (JS-level mocks) so the app loads without crashing, but no real purchase can complete. Real purchases require a **development build** (EAS or local), explicitly out of scope for this phase per your instruction.
- No Expo config plugin is required in `app.json` for `react-native-purchases` itself.
- `react-native-purchases-ui` (RevenueCat's prebuilt Paywall UI components) exists but is **not used in this phase** — this app's entire visual system is custom (warm palette, `GroupedList`, restrained typography), and a prebuilt paywall template would not match it. Only the core `react-native-purchases` SDK (offerings/purchase/restore/customer-info) is used; the paywall UI itself is hand-built the same way every other screen in this app is.

## 3. Web preview strategy

RevenueCat's SDK does have a react-native-web code path, but it routes through **RevenueCat Web Billing (Stripe-backed)** — a separate billing product requiring its own dashboard configuration, which is explicitly not being set up in this phase (no App Store Connect/pricing configuration yet, per your instruction). Rather than partially wire a billing backend we're not configuring, this phase uses the **same `.web.ts` Metro platform-file pattern already established throughout this codebase** (`src/db`, `src/repositories`, `src/notifications` all already have native/web pairs): a `src/purchases/entitlementProvider.web.ts` that never imports `react-native-purchases` at all. Metro's platform resolution means the native SDK is never bundled into the web output — the same proven mechanism that already keeps `expo-sqlite` (also web-incompatible) out of the web bundle. This satisfies your requirement directly: "no native purchase module crash on web," "web mock must never leak into native production."

## 4. Offline / caching policy (re-verified during the monetization-safety pass)

Re-checked directly against RevenueCat's current caching documentation and this exact installed version's own type definitions (`react-native-purchases@10.8.1`), not general memory:

- **On-device cache mechanics**: the SDK fetches and caches `CustomerInfo` automatically throughout the app's lifecycle, refreshing it roughly every **5 minutes while the app is foregrounded** and every **25 hours while backgrounded**, and immediately after any purchase or restore.
- **Default fetch policy is `cachedOrFetched`**: `getCustomerInfo()` returns the cached value (even if stale) when it has one, rather than blocking or throwing, and only reaches out to the network when there's nothing cached yet or a background refresh is due. This is the SDK's own documented default across every platform it wraps.
- **Grace period**: an already-active entitlement gets roughly a **3-day grace period** before it's treated as expired purely due to RevenueCat's servers being unreachable — offline access to a previously-confirmed subscription is not lost the moment connectivity drops.
- **Important correction versus this doc's earlier draft**: the earlier draft implied the native `getCustomerInfo()` call could be given an explicit `fetchPolicy` to control this. **Checked directly against the installed package's own `.d.ts` file — it cannot.** `react-native-purchases@10.8.1`'s JS wrapper exposes `getCustomerInfo(): Promise<CustomerInfo>` with **no parameters at all**; the native iOS/Android SDKs it wraps do expose a `CacheFetchPolicy`, but that control is not surfaced through this JS layer at this version. This is not a gap being worked around — the SDK-wide default (`cachedOrFetched`) already does the right thing without any explicit policy argument, so `purchaseClient.ts`'s parameterless call already benefits from it.
- **A real provider-logic bug was found and fixed**: `EntitlementProvider.resolve()` previously awaited `isEntitled()` and `getOfferings()` together via `Promise.all`, so a network failure while fetching **Offerings alone** — needed only to render the paywall's plan cards, irrelevant to a user who already has access — produced the exact same `RESOLVE_ERROR` → paywall outcome as a genuine entitlement-check failure, hard-locking an already-entitled, offline user out of their own local health records. Fixed by settling the two calls independently (`resolveEntitlementOutcome.ts`, unit-tested): only `isEntitled()` itself failing produces `"error"`; a same-time `getOfferings()` failure just means `offerings: null` alongside whatever `isEntitled()` actually determined.
- **This project's policy on top of the above**: an already-resolved `entitled` state is trusted for the rest of the app session once fetched — no mid-session re-block on a transient blip. On a fresh cold launch, entitlement is re-resolved before routing (§6); if `isEntitled()` itself fails with no cache and no network at all, the user lands on the paywall's own `error` state with Retry (§7), never a fabricated local "premium" flag that bypasses the real subscription state, and never silently granted access on ambiguity.

## 5. Anonymous user identity

Confirmed: RevenueCat supports fully anonymous `app_user_id`s with no external auth system — the exact fit for this app, which has no accounts (Tech Arch §N) and is not adding one for subscriptions. Restoring purchases (not simply reopening the app) is the mechanism that reunites a reinstalled app with a prior purchase; a plain reinstall alone generates a **new** anonymous ID and does not automatically know about a previous purchase until `restorePurchases()` runs. This is documented plainly in the paywall UX (§9 of this doc) rather than assumed to "just work."

---

## 6. Entitlement model

One entitlement: **`premium`** (RevenueCat's own guidance: "most apps need just one entitlement... multiple only for different tiers" — this product has exactly one access tier). The app asks *"does this user currently have access?"*, never *"did this user buy annual?"* — routes/features depend on entitlement state, never a specific product ID.

## 7. Entitlement state machine

```
EntitlementStatus =
  | "unknown"       // not yet checked this app session
  | "loading"       // actively resolving (RevenueCat configure + fetch)
  | "entitled"       // active premium entitlement confirmed
  | "not_entitled"   // resolved, no active entitlement
  | "error"          // resolution failed (e.g. network) — NOT the same as not_entitled

PurchaseStatus =
  | "idle" | "purchasing" | "restoring" | "success" | "cancelled" | "failed"
```

`unknown`/`loading` are never treated as `not_entitled` — the route gate (§8) has a distinct in-between state so an entitled user is never flashed the paywall, and a non-entitled user is never flashed Today, while resolution is in flight.

## 7a. Trial eligibility is tri-state, not boolean (monetization-safety pass, item 1)

```
TrialEligibility = "eligible" | "ineligible" | "unknown"
```

RevenueCat's `checkTrialOrIntroductoryPriceEligibility` genuinely returns an "I don't know" answer — `INTRO_ELIGIBILITY_STATUS_UNKNOWN` is the **only** possible result on Android, and is also possible on iOS when receipt/entitlement-group data is incomplete. Modeling that as a boolean would have forced a guess in one direction or the other; instead:

| trialEligibility | trial badge | trial CTA | trial billing copy |
|---|---|---|---|
| `eligible` | shown | shown ("Start your N-day free trial") | shown |
| `ineligible` | hidden | hidden — plain "Start annual subscription" | hidden — plain billing line |
| `unknown` | hidden | hidden — same plain CTA as `ineligible` | hidden — same plain billing line |

`unknown` is never upgraded to `eligible`, and the UI never distinguishes `unknown` from `ineligible` — both simply mean "don't promise a trial." The mapping is centralized in one pure, unit-tested function, `resolveTrialEligibility` (`src/purchases/trialEligibility.ts`):

```
resolveTrialEligibility({ hasDayBasedIntroPrice, status }):
  hasDayBasedIntroPrice === false          → "ineligible"   // nothing to be eligible for
  status === "ELIGIBLE"                    → "eligible"
  status === "INELIGIBLE" | "NO_INTRO_OFFER_EXISTS" → "ineligible"
  status === "UNKNOWN" | "NOT_CHECKED"     → "unknown"
```

`NOT_CHECKED` is this app's own state (the eligibility API call itself failed, e.g. offline) — it resolves the same as the store saying "unknown," never as "no trial." The web mock exposes all three states via `?trial=eligible|ineligible|unknown` for visual review.

## 7b. RevenueCat API semantics — re-verified against the installed version (monetization-safety pass, item 2)

Checked directly against `react-native-purchases@10.8.1`'s own installed type definitions (`node_modules/.../purchases.d.ts`, `.../errors.d.ts`), not general memory or possibly-outdated community posts:

- **Eligibility statuses**: `ELIGIBLE`, `INELIGIBLE`, `NO_INTRO_OFFER_EXISTS` (no introductory offer configured on the product at all — a definitive "no," not "unknown"), `UNKNOWN` (always returned on Android; possible on iOS) — all four are handled explicitly by §7a's mapping, none collapsed into another.
- **Introductory-offer metadata**: `product.introPrice` (`periodUnit`, `periodNumberOfUnits`) is read from the `StoreProduct` already fetched with the package — `trialDays` is only ever this real, store-provided number, never invented, and only populated when `trialEligibility === "eligible"`.
- **Purchase cancellation**: `PurchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR` is the correct, current check for this installed version. **Correction**: an earlier draft of this pass considered switching to the `PurchasesError.userCancelled` boolean field based on general RevenueCat guidance found online — checking the actual installed type definitions showed `userCancelled` is explicitly marked `@deprecated` in this version ("use `code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR` instead"), the reverse of what that general guidance suggested. The `code`-based check already in `purchaseClient.ts` was correct and was kept as-is.
- **Restore behavior**: `restorePurchases()` resolving successfully is **not** the same fact as "the restore found an active subscription" — it resolves normally even for a user with no purchase history. Only `customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER]` on the *returned* `CustomerInfo` is authoritative; `purchaseClient.ts` already checks this rather than trusting the call's own resolution, and `EntitlementProvider.restore()` re-derives entitlement from that result rather than assuming success.
- **CustomerInfo cache behavior**: see the rewritten §4 above — default `cachedOrFetched`, no `fetchPolicy` parameter exposed by this JS wrapper version, 5-min/25-hour refresh cadence, ~3-day grace period on an active entitlement.

No upgrade of `react-native-purchases` was made or needed to arrive at any of the above — every correction was to this app's own code/docs, not the dependency.

## 8. Route gate (single authoritative source)

```
if (!onboardingCompleted)        → onboarding                    // wins regardless of entitlement, incl. "entitled" (B below)
else if (entitlement === "unknown" || "loading") → launch/resolution screen
else if (entitlement === "entitled")              → app (Today/Track/Appointments/Insights/Profile/Knowledge/Nutrition/Breathing)
else                                               → paywall   // "not_entitled" or "error"
```

One gate, in `app/_layout.tsx` (already the sole place that currently gates on onboarding via `useOnboardingState`) — never scattered `if (premium)` checks inside individual feature screens.

### Route-gate matrix (monetization-safety pass, item 8 — verified against `resolveRouteTarget`'s own test suite and, where noted, live browser testing)

| # | onboarding | entitlement | current route | expected | verified via |
|---|---|---|---|---|---|
| A | incomplete | not_entitled | any | `onboarding` | `entitlementMachine.test.ts` |
| B | incomplete | entitled | any | `onboarding` — **finish onboarding first**; personalization is part of product setup, and an entitled-but-incomplete user is never routed around it | `entitlementMachine.test.ts` (`resolveRouteTarget(false, "entitled")`) |
| C | complete | unknown / loading | any | `resolving` (brand mark + spinner, no flash of Today or paywall) | `entitlementMachine.test.ts` |
| D | complete | error (temporary resolution failure) | any | `paywall`, showing its own error/Retry state — **no infinite redirect loop**: the gate redirects once to `/paywall`, which is itself in `PAYWALL_ADJACENT_SEGMENTS`, so no further redirect fires | live-tested (`?entitlement=error`), traced in code |
| E | complete | not_entitled | any protected route | `paywall` | live-tested against 11+ routes |
| F | complete | entitled | any | `app` (Today etc.) | live-tested |
| G | complete | not_entitled | `/paywall-privacy` | **allowed**, not redirected | live-tested |
| H | complete | not_entitled | Terms action | **allowed** — opens Apple's Standard EULA externally via `Linking.openURL`, not an in-app route the gate could intercept | code-traced (external link, outside the gate's domain entirely) |
| I | complete | not_entitled | any protected deep link (e.g. `/knowledge/...`) | `paywall` | live-tested (Knowledge among the 11+ routes checked) |

No scenario produces a redirect loop: every `target !== currentTop` transition redirects exactly once to a route that itself satisfies its own target on the next render.

## 9. Onboarding-complete vs. entitled — kept explicitly distinct

`OnboardingState.completed` (existing column, Tech Arch §D) and entitlement status are two independent facts. A user who finished onboarding but never subscribed (or whose subscription lapsed) launches straight into **resolution → paywall**, never back into onboarding, and never with personalization answers or health records touched. Entitlement gating is access control only (§35 of the brief) — it must never delete or reset local data.

## 10. Privacy boundary

RevenueCat receives only what it needs for entitlement/purchase infrastructure: the anonymous app-user-id, product/offering/purchase events. It **never** receives pain, stiffness, fatigue, wellbeing, body regions, medication/injection/lab/appointment data, notes, or any onboarding personalization answer. No health-derived attributes are ever set on the RevenueCat customer record in this phase.

## 11. Recommended-badge wording audit (monetization-safety pass, item 5)

Audited both locale files' entire `paywall.*` namespace for "best," "best value," "most advantageous," or any savings-percentage claim. **None found.** `paywall.recommendedBadge` is a plain "Recommended" / "Önerilen" — a product recommendation, not a monetary-savings claim — and no other paywall copy implies a false saving. No copy change was needed; this section records the audit result, not a fix. No savings percentage is calculated anywhere, consistent with real product/pricing data not existing yet.

## 12. Price-failure-state audit (monetization-safety pass, item 6)

Confirmed by re-reading `app/paywall.tsx`'s render logic: when `offerings` is `null` or both `annual`/`monthly` are `null` (a genuine load failure, or — after item 9's fix — an offline non-entitled user whose Offerings fetch failed), the screen renders **only** the offerings-error state (title, body, Retry, Restore/Terms/Privacy) — it never reaches the plan-card/price-rendering branch at all. There is no code path that renders `$0.00`, a dash placeholder, a computed "monthly equivalent," or any hardcoded currency string. Every price string rendered comes directly from `PurchasePackageInfo.priceString`, itself only ever set from the store's own `product.priceString` (native) or the clearly-marked dev mock (web).

## 13. Purchase/restore entitlement-verification summary (monetization-safety pass, item 7)

Re-confirmed and centralized, not scattered across screens:

- **Purchase**: `EntitlementProvider.purchase()` never dispatches `PURCHASE_RESULT_ENTITLED` directly from the purchase call's own `"success"` outcome — it always calls `purchaseClient.isEntitled()` again afterward and dispatches based on *that* result. A `"success"` outcome with no active entitlement dispatches `PURCHASE_RESULT_NOT_ENTITLED`, which keeps `status: "not_entitled"` and the user on the paywall (`entitlementReducer.test.ts` covers this exact scenario).
- **Restore**: `purchaseClient.restore()` (native) only ever returns `{ outcome: "entitled" }` after checking `customerInfo.entitlements.active[...]` on the CustomerInfo the restore call itself returned — never from the call merely resolving. `EntitlementProvider.restore()` dispatches based on that outcome the same way, and the web mock mirrors the same distinction (`?restore=entitled` vs. a restore with no matching state).
- Both paths funnel through the same `entitlementReducer` — there is exactly one place "does this user have access" is decided, never a per-screen assumption.

---

Next: architecture (provider boundary, routing) precedes any dependency installation, per your explicit phase ordering.
