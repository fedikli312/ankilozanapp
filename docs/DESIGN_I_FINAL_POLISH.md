# Design-I — Final Cross-App Visual Consistency + Legacy Cleanup

Status: **uncommitted, held in the working tree pending Furkan's review.** Starting HEAD for this document's own scope: `fa2d815` ("Redesign Profile and Knowledge"). Everything below sits on top of three already-frozen-and-approved-but-still-uncommitted passes done earlier in the same working tree (Check-in selector redesign, Body Regions redesign, Medication + Injection Detail redesign) — this document covers only the final polish pass, not those.

This was **not** a new feature phase. No product scope was added. The goal was one coherent visual/interaction grammar across every remaining supporting surface, finishing the migration off `GroupedList`/card-per-row/legacy-alias remnants.

## 1. Screen inventory result

Every route under `app/` was inventoried and classified:

**A. Already redesigned/frozen (untouched this pass):** Today, Check-in, Health Record landing, Timeline, Appointments (list/detail/prepare/summary/add), Profile (all sub-screens), Knowledge (landing/article), Onboarding (all screens), Value Reveal, Paywall.

**B. Design-I already-in-progress carryover (built earlier this session, confirmed still correct, no further edits needed):** Symptoms, Labs (list + marker detail), Nutrition, Breathing, Medications list, Injections list (their `GroupedList`→`Section` conversions and icon removal).

**C. Legacy visual language found and fixed this pass:**
- `GroupedList` component — zero remaining production consumers (confirmed via `<GroupedList` grep), deleted along with its export.
- 5 dead color aliases (`accent`, `backgroundWarm`, `surface`, `surfaceHighlight`, `borderHairline`) — zero remaining consumers once `app/_layout.tsx`'s resolving-screen (the last real consumer of `accent`/`backgroundWarm`) was repointed to `brandPrimary`/`background`. Removed from `colors.ts`.
- `app/injections/index.tsx` — the next-injection-date caption concatenated the raw `YYYY-MM-DD` storage string directly instead of using `formatShortDate` like every other date display in the app. Fixed.
- `app.json`'s `expo.name` — still read `"Ankilozanapp"` (the OS home-screen display name, genuinely user-visible). Changed to `"Ilium"`. `slug`/`scheme` deliberately left untouched (internal/technical, deep-link-relevant).

**D. Utility/legal/system screens reviewed for consistency only (no changes needed):** `app/dev/showcase.tsx` (dev-only, `SelectableCard`'s one legitimate remaining consumer — correctly kept), onboarding sub-routes, paywall-privacy.

## 2. Symptoms / Labs / Nutrition / Breathing / Medication+Injection lists

All five were already brought into the current grammar in this session's earlier Design-I carryover work (before this final pass began) and were re-verified, not re-redesigned:

- **Symptoms** — one boxless `Section`, hairline rows, factual `"Ağrı %{pain} · Yorgunluk %{fatigue}"` label, body-area text appended to the caption, today's row is the only navigable one. No icons, no cards, no severity color.
- **Labs** (list) — two `ListRow`s (CRP/ESR) inside one titled `Section`, factual `value unit · date` captions, chevron navigation. (marker detail) — headline value with `tabular-nums`, a real `TrendChart`, a factual delta line, a capped history `Section`, no reference ranges, no red/green.
- **Nutrition** — editorial title, `SectionLabel` category groupings, `ListRow` content rows, italic disclaimer. No food diary, no tracking, no score.
- **Breathing** — same editorial grammar, `Section`/`ListRow` with a trailing duration label, italic safety note. No completion state, no streak, no persistence.
- **Medications/Injections list screens** — compact `ListRow`s inside "Aktif"/"Arşiv" `Section`s, chevron navigation into the (now Furkan-approved-and-frozen) redesigned detail screens. One bug fixed here: injections' next-date caption now uses `formatShortDate` (see §1).

## 3. Design-system dead code

| Component | Real consumers found | Decision |
|---|---|---|
| `MetricCard` | Zero (confirmed in an earlier session pass) | Already deleted before this pass |
| `GroupedList` | Zero (`<GroupedList` grep: no matches anywhere in `app/`/`src/`) | **Deleted this pass** — `GroupedList.tsx` removed, export dropped from `src/design-system/index.ts`, stale "still available" doc comments in `Hairline.tsx`/`Section.tsx` corrected to past tense |
| `SelectableCard` | One: `app/dev/showcase.tsx` (dev-only demo route) | **Kept** — real consumer, correctly a dev-only showcase of the component, not a production leftover |

No broad token renaming was performed — only components/aliases with zero remaining consumers were removed.

## 4. QuietSurface audit

Four real JSX consumers, all reviewed:

- `app/(tabs)/index.tsx` — Today's single dominant check-in CTA. Explicitly commented "ONE dominant daily check-in state/action." Kept.
- `app/appointments/[id]/summary.tsx` — "Things to Review," explicitly documented in-code as "the one place a `QuietSurface` earns its keep this screen." Kept.
- `app/paywall.tsx` — the one real product-preview panel. Kept.
- `app/dev/showcase.tsx` — dev-only demo. Kept.

No usage found that functions as a default screen container or an undeserved card. Nothing removed.

## 5. Icon audit

Remaining `Ionicons` imports, by file:

- `app/(tabs)/_layout.tsx` — tab bar icons. Functional, necessary.
- `app/(tabs)/index.tsx` — medication/injection type-differentiation leading icons + a "taken today" checkmark status marker. Functional (row-type differentiation + status), not decorative. Today is an already-frozen primary screen, out of this pass's editing scope.
- `app/_layout.tsx` — a single `leaf-outline` mark on the transient entitlement-resolving screen (loading-state brand mark, not a decorated list/section/bullet). Repointed to current tokens (§1); icon choice itself kept.
- `app/paywall.tsx` — pillar checkmarks. Functional.
- `app/profile/index.tsx` — settings-row category icons (language/notifications/privacy/lock), an established iOS-Settings-style pattern from the already-approved, frozen Design-H Profile. Not this pass's target.
- `app/profile/language.tsx` — selected-language checkmark. Functional, non-color-only signal.

Every icon remaining in the codebase after Symptoms/Nutrition/Breathing/Labs/Medications/Injections had theirs stripped (earlier carryover work) now carries functional or navigational meaning. No icon was removed or kept solely to hit "zero icons" or "some icons" as a target — each was evaluated individually.

## 6. Brand audit

- `grep -ri "Ankilozanapp\|Ankilozan App"` across `src/localization/translations`, `app/`, and `src/`: zero remaining matches in user-visible copy (already fully cleaned in Design-H).
- `app.json`'s `expo.name`: found and fixed (§1) — the one remaining genuinely user-visible occurrence (OS home-screen app name).
- Confirmed untouched, correctly: `src/db/client.ts`'s `DATABASE_NAME = "ankilozanapp.db"` (internal SQLite filename), `app.json`'s `slug`/`scheme` (Expo project slug / deep-link scheme), `package.json`'s `name` (npm package name) — all technical/internal identifiers, explicitly out of scope.
- "Ankilozanı Anla" (Profile → Support entry point) and Knowledge's "AS"/"Ankilozan" medical-term usage are the actual Turkish clinical term for ankylosing spondylitis, not the old app brand name — correctly left as-is, not a brand leak.

## 7. Navigation audit

Confirmed via `app/(tabs)/_layout.tsx` and `app/(tabs)/track.tsx`:
- Exactly 3 visible tabs: Today / Health Record / Appointments. Profile is a persistent header button, not a tab.
- Insights: `href: null` (unreachable from the tab bar) but the route stays live, reached via Health Record's own "Analiz" row — matches the approved subordinate placement.
- Health Record lists Symptoms/Medications/Injections/Labs/Insights as one continuous list, then a visually separated "GÜNLÜK DESTEK" (Daily Support) section holds Nutrition and Breathing — confirmed subordinate, not competing with the primary categories.
- Knowledge confirmed reachable only via Profile → Support → Knowledge (`app/profile/index.tsx`'s Support section), not duplicated into Health Record.

No IA changes made — this was audit-only, and the existing structure already matched every stated requirement.

Note: the route filename `app/(tabs)/track.tsx` and its `track.*` i18n key namespace are internal leftovers from before the tab was relabeled "Health Record" in Design-B — no visible copy anywhere reads "Track" (confirmed via grep of every `t("track.*")` call site). Left untouched per the explicit "do not perform broad renaming for cleanliness" instruction — this is internal naming debt, not a user-visible inconsistency.

## 8. Copy / safety audit

Re-swept the screens touched or reviewed this pass for gamified copy, adherence/compliance percentages, severity labels, diagnostic/causal/treatment-effectiveness claims, and generic motivational health copy. None found. Existing factual conventions (counts, not percentages; "Alındı"/"Kaçırıldı" as plain status, never good/bad framing; Knowledge's hedged "bazı kişilerin faydalı bulduğu" language) were already in place from earlier phases and are unchanged.

## 9. Accessibility audit

No ad-hoc small touch targets found in any reviewed screen — every interactive row goes through `AccessibleTouchable`/`ListRow`/`Button`, which already enforce the 44pt floor at the shared-component level, not per-screen. Non-color-only selected states (checkmarks, weight changes, dot markers) are consistent across every list touched. No new icon-only actions were introduced. No change was made that reduces accessibility for visual minimalism — this pass only removed decoration, never removed a label, target, or a non-color signal.

## 10. Known remaining debt (not fixed this pass, explicitly deferred)

- 430×932 responsive behavior: reviewed structurally (relative units, `flexWrap`, no hardcoded pixel widths anywhere touched this pass) but **not live-verified** — the web-preview `resize_window` tool remains non-functional in this environment (confirmed non-functional again this pass via `window.innerWidth` staying pinned after a "successful" resize call). Native multi-device QA is the real verification path, deferred to release.
- Dark mode: token-level audit only (every touched screen reads theme tokens, never hardcoded hex) — **not live-verified**, the web preview forces light mode. Deferred to native/device QA.
- `app/profile/about.tsx`'s Terms/EULA row (mentioned in earlier session notes) was not re-verified this pass — About is a frozen, unmodified Design-H screen, out of this pass's scope; it rendered correctly (Wordmark, version, tagline) in live QA.
- The `track.tsx` filename/i18n-namespace internal-naming debt (§7) remains, by design (out of scope per the no-renaming-for-cleanliness instruction).

## 11. Validation

`npx tsc --noEmit`: clean. `npm run lint`: clean. `npm test -- --runInBand`: 60/60 suites, 367/367 tests (unchanged from the Medication+Injection Detail pass — this pass added no new logic, only removed dead code and fixed 3 small presentation bugs). `npx expo install --check`: same pre-existing Phase L drift as every prior phase, not touched, per explicit instruction.

## 12. Protected-file audit

`package.json`, `package-lock.json`, `src/db/*`, `src/domain/scheduling/*`, `src/notifications/*`, `src/purchases/*`, `app/appointments/*` all confirmed untouched via `git diff --name-only` against this list. No HealthKit/AI/EAS work started. The three frozen prior passes (Check-in selectors, Body Regions, Medication+Injection Detail) received no further edits this pass beyond what's listed above (only `app/injections/index.tsx`, which is the injections *list* screen, distinct from the frozen *detail* screen).
