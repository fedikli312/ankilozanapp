# Visual Art Direction 3.0 — Propagation

Status: **uncommitted working-tree pass, pending Furkan's review.** Nothing here is committed or pushed. HEAD is unchanged at `fa2d815`.

This document is the plan and the record for carrying the approved Art Direction 3.0 proof (Knowledge landing, Knowledge article, Value Reveal) across the rest of Ilium **without** turning every screen into a hero. It is deliberately conservative: six code files changed, every change additive, decorative, or a token swap — no architecture, no frozen file, no commercial semantics, no health-value color, no broad animation.

The companion research/proof document is `VISUAL_ART_DIRECTION_3_0.md`; its forward-looking §16–24 are now superseded by the per-screen decisions below.

---

## 1. The mandatory three-level visual-intensity model

Every route in the app is assigned exactly one intensity level. The level dictates how much atmosphere, illustration, motion, and compositional drama the screen is allowed — not as a suggestion, as the rule this and every future visual pass follows.

### LEVEL 1 — IMMERSIVE
The app is *selling a feeling or an idea* here, or welcoming someone in. Atmosphere is expected. One hero illustration, one ambient gradient wash, a content entrance, editorial-scale type.

| Route | Notes |
|---|---|
| `app/onboarding/welcome.tsx` | Wordmark-only brand moment — see §7 for why it keeps *no* HeroBloom. |
| `app/onboarding/goals.tsx`, `treatment-context.tsx`, `reminders.tsx`, `body-regions.tsx`, `add-medication.tsx`, `add-injection.tsx` | Immersive *frame* (progress, generous type) but they are data-entry steps — no hero art competing with the question. |
| `app/onboarding/value-reveal.tsx` | **Proof screen — already shipped.** HeroBloom strip + staged reveal. Unchanged this pass. |
| `app/paywall.tsx` | **Changed this pass** — ambient `HeroBloom variant="dawn"` strip behind the wordmark. Every commercial element untouched (§3). |
| `app/knowledge/index.tsx` | **Proof screen — already shipped.** HeroBloom `bloom` + featured `SpineConcept` + topic index. Unchanged this pass. |
| `app/knowledge/[id].tsx` | **Proof screen — extended this pass** with controlled hero-composition variation by category (§7). |

### LEVEL 1.5 — SUPPORTIVE EDUCATIONAL
Read-only educational content that is a sibling of Knowledge, not a tracked feature. One quiet decorative strip, nothing else — explicitly **no** tracking, streaks, timers, completion state, or treatment claims.

| Route | Notes |
|---|---|
| `app/nutrition/index.tsx` | **Changed this pass** — one `HeroBloom variant="drift"` strip (84pt). |
| `app/breathing/index.tsx` | **Changed this pass** — one `HeroBloom variant="dawn"` strip (84pt). |

### LEVEL 2 — EXPRESSIVE UTILITY
Screens the user opens many times a day to *do something* or *see where they stand*. They may have a confident dominant element and generous rhythm, but **utility comes first**: no full-screen entrance animation (it would be a tax paid on every visit), no hero illustration, no gradient behind working content.

| Route | Notes |
|---|---|
| `app/(tabs)/index.tsx` (Today) | Kept exactly as-is — see §6. The `QuietSurface` check-in module is already its "one dominant element". |
| `app/check-in.tsx` + `CheckInForm` | Behavior frozen; visual-finish notes in §6. |
| `app/(tabs)/track.tsx` (Health Record landing) | Kept as-is. The Timeline-preview rail is already the signature element; no generic healthcare hero was added (brief §5). |
| `app/(tabs)/insights.tsx` | Kept as-is — three boxless document `Section`s, no dashboard. |
| Empty states that are a genuine emotional first-use moment (Timeline empty, Appointments empty) | Philosophy in §9 — not changed this pass. |

### LEVEL 3 — PRECISION / RECORD
Document-like surfaces. A clinician could look over the user's shoulder without the screen feeling like a consumer wellness app. **No illustrations, no hero, no gradient, no severity/normality color, no card-per-row.** Data visualization is the *only* place Art Direction 3.0 is allowed to show here, and only as restraint (one focal point, one ink).

| Route | Notes |
|---|---|
| `app/timeline/index.tsx` | Signature rail — polished already; untouched. |
| `app/symptoms/index.tsx` | Untouched. No severity coloring (Pain 10 == Pain 2 visually). |
| `app/medications/[id]/index.tsx`, `history.tsx` | **Frozen** (Medication + Injection Detail UX phase). Untouched. |
| `app/injections/[id]/index.tsx`, `history.tsx` | **Frozen.** Untouched. |
| `app/labs/index.tsx` | Untouched. |
| `app/labs/[marker]/index.tsx` | `TrendChart` given one quiet data-viz refinement (§5). Nothing else. |
| `app/(tabs)/appointments.tsx`, `app/appointments/[id]/*` | Untouched. Strong `DateBlock` date typography is already the identity; no doctor illustrations. |
| `app/profile/index.tsx` + all `app/profile/*` subpages | Untouched. Explicitly **no HeroBloom, no illustration** (brief §16). Profile stays quiet. |
| `app/dev/showcase.tsx` | Dev-only, not user-facing — out of scope. |

---

## 2. The Ilium visual language — four primitives (hard cap: six)

Everything visual in Art Direction 3.0 is built from these. No screen invents its own.

| # | Primitive | File | Role | Where it may appear |
|---|---|---|---|---|
| 1 | **Brand atmosphere** — `HeroBloom` | `src/design-system/illustrations/HeroBloom.tsx` | Soft, abstract, decorative warmth. Never carries meaning. Three composition variants (`bloom` / `dawn` / `drift`) — same primitive, different crop/accent placement, so a surface that shows it repeatedly never shows one identical picture. | Level 1 + Level 1.5 only. Always `accessibilityElementsHidden`. |
| 2 | **Human / body concept** — `SpineConcept` | `src/design-system/illustrations/SpineConcept.tsx` | One deliberately non-diagnostic spine/pelvis concept shape. Carries real supplementary meaning → real `accessibilityLabel` + visible "simplified, not a diagnostic image" caption. | Only alongside prose that already names that anatomy (today: the "what is AS" article, and its own featured thumbnail on the Knowledge landing). Not a per-article asset. |
| 3 | **Data visualization** — `TrendChart` | `src/design-system/components/TrendChart.tsx` | The "thread": one continuous rounded line of the user's own values, single `dataPrimary` ink, one focal point on the most recent reading. Never bars, never zones, never normality shading. | Level 3 data screens (Labs today; reserved for Insights metric detail). |
| 4 | **Editorial educational illustration** | *(none built — deferred)* | A future original SVG for a specific educational article whose content justifies it. | Deferred — the brief explicitly said *not* to build twelve unique article illustrations this phase. `SpineConcept` is the only member of this class so far. |

Primitives 5–6 are intentionally unallocated. If a genuine need appears (e.g. a single "your record over time" motif for a Health Record empty state), it goes here — it does not get bolted onto an existing primitive.

**Not primitives / not part of this system:** `MarginMark` / `Wordmark` (brand identity, pre-existing, governed separately), `DateBlock` (a data component), Ionicons (functional/navigational only, unchanged).

---

## 3. Paywall (Level 1) — what changed and what did not

**Changed:** a single decorative `HeroBloom variant="dawn"` strip (92pt, `radius.large`, `overflow:hidden`, `surfaceSecondary` ground) inserted as the first child of the scroll, above the centered `Wordmark`. It is `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` — the wordmark and headline below carry all meaning. `dawn` (wash lifted high, petals low and wide) reads as "first light" warmth, not a banner.

**Explicitly NOT changed — every commercial element is byte-for-byte the same:**
- Hard paywall: no close/X, no skip, `gestureEnabled:false` on the route (in `_layout.tsx`), reached only via the route gate + Value Reveal CTA.
- Annual is the default selection (`useState<PackageIdentifier>("annual")`).
- 7-day trial copy appears **only** when `shouldShowTrialCopy(annual.trialEligibility)` is true — CTA label, billing line, and plan-card badge all still gated on it.
- Monthly plan still visible, still selectable.
- Real localized prices from `offerings` (`priceString`) — no hardcoded prices, no fake "was/now", no fake savings percentage, no countdown, no testimonials.
- Restore / Terms (Apple Standard EULA) / Privacy row unchanged, including the offerings-error fallback path.
- Purchase / restore / cancel / error states and messages unchanged.
- No gradient on any button. No entrance animation (the offer must not be gated behind a fade).

## 4. HeroBloom variants — the mechanism

`HeroBloom` gains one optional prop: `variant?: "bloom" | "dawn" | "drift"`, default `"bloom"`.

- `bloom` reproduces the **exact** numbers the illustration shipped with in the proof phase, so `app/knowledge/index.tsx` and `app/onboarding/value-reveal.tsx` render identically to before this prop existed (verified by inspection: same wash `cx/cy/r`, same three petal offsets/radii/rotations, same two texture-dot positions).
- `dawn` — wash origin high (`cy 24%`), petals low and wide, calmer.
- `drift` — mass pushed right (`wash cx 62%`), flattened, lateral.

Each variant is a small table of numeric constants consumed by one shared render path — the SVG structure, the three-token palette (`brandPrimary` / `accentRare` / `positive` at low alpha), and the decorative contract are identical across variants. The gradient `<RadialGradient>` id is suffixed per variant (`heroWash-bloom` etc.) so two different variants could coexist on one screen without an id collision (no screen currently does).

## 5. Labs `TrendChart` (Level 3) — the one data-viz refinement

The brief names data visualization as the place Art Direction 3.0 shows on the record screens. The refinement is deliberately minimal:

- The **most recent** reading gets one focal point: a slightly larger dot (`STROKE_WIDTH+1`) inside a faint 1px ring at 28% opacity, same `dataPrimary` ink as the line. The emphasis is **positional** ("where the thread is now"), never value-based — a high latest value and a low latest value look identical.
- The right-hand (latest) axis label is now `textPrimary` / 600 weight; the left (oldest) label stays quiet `textSecondary`. Both moved from a hardcoded `fontSize: 11` to `typography.micro`.
- Nothing else: no area fill, no gradient (recipe 3 stays reserved), no zones, no color change, no second series, no y-axis. The "chart depth" gradient recipe and a possible `react-native-svg` rewrite of `TrendChart` for a true area path are **deferred** with a written spec in `VISUAL_ART_DIRECTION_3_0.md` §7/§12 — not something a "careful propagation" pass should do to a shared charting component.

## 6. Today & Check-in (Level 2) — why nothing changed in code

- **Today** already answers "what matters today?" through a fixed hierarchy with the `QuietSurface` check-in module as its one dominant element. It is opened many times a day. A hero illustration would compete with the check-in CTA; a full-screen entrance fade would be a tax on every open. The brief is explicit: "keep architecture, no giant hero". Assessed as **already at the correct Level 2 intensity** — no change is the correct outcome, not an omission.
- **Check-in** behavior (`NumericScale`, `StiffnessSelector`, `BodyRegionMap`) is **frozen** by an earlier explicit instruction ("Do not modify these files"). The Phase 7 brief asks for a visual finish of the interaction (refined thumb/track, silhouette atmosphere). Those two instructions conflict. This pass honors the freeze and does **not** touch the three files. The visual-finish items — a subtle soft shadow on the slider thumb, a faint atmosphere behind the silhouette (never a medical heatmap), a more tactile categorical-list transition — are specced here and flagged in the final report as needing the freeze explicitly lifted before implementation.

## 7. Knowledge article hero variation (§ brief 18)

`app/knowledge/[id].tsx` now selects the `HeroBloom` variant by the article's category, via a small fixed map:

| Category | Variant |
|---|---|
| `basics` | `bloom` |
| `symptoms` | `drift` |
| `treatment` | `dawn` |
| `dailyLife` | `drift` |
| `appointmentPrep` | `bloom` |

Deterministic (same article → same hero, always), still only three total compositions, no bespoke-per-article illustration. `app/knowledge/index.tsx`'s landing hero stays fixed at `bloom` — the landing's signature composition is part of the app's identity and should not drift.

`app/onboarding/welcome.tsx` keeps its **Wordmark-only** treatment (no HeroBloom) — that *is* the intentional composition variation the brief asks for in onboarding: the first screen is a pure brand moment, `value-reveal` is the one onboarding screen that carries the atmosphere motif. Spreading HeroBloom across every onboarding step is exactly the "illustrations everywhere" failure the brief warns against.

## 8. Nutrition & Breathing (Level 1.5)

One `HeroBloom` strip each (84pt), `drift` on Nutrition, `dawn` on Breathing — so the two sibling screens don't look copy-pasted. Decorative, hidden from the a11y tree. This is the "one meaningful visual at most" the brief allows for these screens. No content, tracking, or interaction added. These screens are read-only bundled educational text and stay that way.

---

## 9. Empty-state philosophy (one rule for the whole app)

An empty state gets an illustration **only** if the emptiness is an emotionally meaningful first-use moment the user is meant to feel good about starting. Everything else gets a plain factual line + the single relevant action.

- **Illustration-eligible (not built this pass, listed for a future decision):** the very first Timeline (nothing has happened yet — "your record starts here"), the first Today before any check-in.
- **Plain factual, always:** medication history, injection history, lab-marker history, appointment history, symptoms history, "need more readings for a trend". No floating-document illustration, no "no data" mascot, ever. Current code already does this (e.g. `labs/[marker]` empty body, `symptoms` empty title) — no change needed, now written down as policy.

## 10. Motion map

| Role (`motion.ts`) | Duration | Allowed on | Used today |
|---|---|---|---|
| `micro` | 100–140ms | any — press/tap feedback | `AccessibleTouchable` tier1, `PressableScale` |
| `selection` | 140–200ms | any — a value registering | `PressableScale` scale settle |
| `contentEnter` | 220–320ms | Level 1 push screens only | Knowledge article fade/translate, Value Reveal staged rows |
| `surfaceTransition` | 180–320ms | any — a sheet/section opening | `ActionSheet` (fade), Section expand |
| `heroEnter` | 300–600ms | **Level 1 immersive only** | Knowledge landing hero fade, Value Reveal |

Rules this pass enforces:
- **No entrance animation on any tab screen** (Today, Health Record, Insights, Appointments) or any Level 3 record screen. They are opened too often; a fade is a recurring cost with no payoff.
- `heroEnter` never appears outside Level 1.
- Every animation already collapses to an instant state change under `useReducedMotion()` — verified in the three proof screens; no new animation was added anywhere else this pass, so nothing new to verify.
- Paywall: **no** entrance animation (commercial content must be immediate).

## 11. `PressableScale` policy

`PressableScale` is a *selective* affordance, not a global replacement for `AccessibleTouchable`.

**Use it on:** a featured/hero content card (Knowledge featured article), a large meaningful navigational tile, a primary consumer-surface CTA that benefits from tactility.

**Never use it on:** history rows, clinical record rows, list rows in a document `Section`, tiny controls, text links, tab bar items, destructive actions (Archive / Delete), plan-selection cards on the Paywall (selection state already gives feedback), the check-in slider/stepper (its own motion is the feedback).

This pass added **zero** new `PressableScale` call sites. The only consumer remains the Knowledge featured-article card from the proof phase. Documented here so future work doesn't mechanically swap it in everywhere.

## 12. Gradient usage

Three recipes, defined in `VISUAL_ART_DIRECTION_3_0.md` §7, unchanged. Current real usage:

| Recipe | Where | Status |
|---|---|---|
| 1 — ambient hero wash (`brandPrimary` ~10% → 0, radial) | Inside every `HeroBloom` (all variants) | Live |
| 2 — illustration atmosphere fill (`brandPrimary` 12% → `accentRare` 6%, linear) | Reserved for inside an illustration's own background shape | Not used yet |
| 3 — chart depth (`dataPrimary` 14% → transparent, vertical) | Reserved for `TrendChart` area fill | **Deferred**, spec written |

No gradient on any button, surface, record card, or "score". No new recipe was added.

## 13. SVG / asset performance audit

| Asset | Node count | Assessment |
|---|---|---|
| `HeroBloom` (any variant) | 1 `<Defs>` + 1 gradient + 6 `<Ellipse>` = ~8 nodes | Trivial. Renders once per screen, never in a list, never animated. `width` comes from one `onLayout` pass (guarded `heroWidth > 0`). |
| `SpineConcept` | 1 `<Path>` + 1 `<Ellipse>` + 2 `<Circle>` = 4 nodes, now inside 1 wrapper `<View>` | Trivial. One instance per article; one small static instance on the Knowledge landing. |
| `TrendChart` | plain `<View>`s: ~2 per data point + 1 extra for the latest ring, capped at `MAX_POINTS = 24` | ~50 views worst case, static, no re-layout after first `onLayout`. Fine. |

Scroll-perf spot check (390-width preview, `?entitlement=entitled`): Knowledge landing, Knowledge article, Nutrition, Breathing, Labs marker detail — all scroll smoothly, no jank, no layout thrash. `HeroBloom` strips are fixed-height so they cause no reflow as content loads. **No `FlatList`/virtualization change needed** — none of these lists are long enough (Knowledge ≤ 12 rows, Nutrition/Breathing ≤ 8, Labs history ≤ handful).

## 14. Accessibility audit

- **Decorative SVG hidden:** every `HeroBloom` call site wraps it in a `View` with `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`. `SpineConcept` when used decoratively (landing thumbnail) is now also hidden via the same wrapper.
- **Educational SVG labeled:** `SpineConcept` in the article carries a real localized `accessibilityLabel` (`knowledge.spineIllustrationLabel`) + a visible italic caption. **Fixed this pass:** the label/role moved from the `<Svg>` element onto a wrapping `<View>` — `react-native-svg`'s web build was forwarding `accessible` onto the DOM `<svg>`, which React rejects as a non-boolean attribute (a console error on web preview; native unaffected). The error is now gone (verified in live console). This is a net improvement over the approved proof phase.
- **44pt targets:** no new interactive element was added. Existing targets unchanged.
- **Contrast:** no new color pairing. `TrendChart`'s latest-label change is `textSecondary` → `textPrimary` (higher contrast) + weight; the faint ring is decoration layered on an already-labeled chart (the chart's `accessibilityLabel` text summary is unchanged and still carries the real information).
- **Non-color-only state:** unchanged. The `TrendChart` focal point is size + ring, not color; the latest axis label is weight + color, not color alone.
- **Dynamic Type / long Turkish:** `HeroBloom` strips are fixed-height decorative bands that never contain text, so longer Turkish copy below them is unaffected. Nutrition/Breathing/Paywall headings were already tested against Turkish length in prior phases.
- **Chart accessibility:** `TrendChart` still requires and renders its caller-supplied `accessibilityLabel` text summary — unchanged.

## 15. Dark-mode audit (token-level; web preview forces light)

Every change reads from theme tokens only — **zero hardcoded hex added:**
- `HeroBloom` variants use `colors.brandPrimary` / `colors.accentRare` / `colors.positive` (all have dark values: `#D97B5C` / `#D4AF5D` / `#7FA382`) at low alpha, plus `colors.surfaceSecondary` (`#211D19` dark) as the strip ground.
- `TrendChart` focal ring uses `colors.dataPrimary` (`#D97B5C` dark); labels use `colors.textPrimary` / `colors.textSecondary` (both have dark values).
- `SpineConcept` wrapper adds no color.

**Native dark-mode QA debt (carried forward, cannot be done on web preview):** confirm the `HeroBloom` low-alpha petals read as gentle warmth and not muddy smudges against `#211D19`; confirm the `dawn`/`drift` washes don't band on OLED; confirm the `TrendChart` faint ring (28% `dataPrimary`) is still visible against the dark surface. Same standing limitation as every prior phase (`resize_window` non-functional, web forces light).

## 16. Screens changed vs. intentionally kept restrained

**Changed (6 code files):**
1. `src/design-system/illustrations/HeroBloom.tsx` — `variant` prop (additive, default preserves exact prior render).
2. `src/design-system/illustrations/SpineConcept.tsx` — a11y semantics moved to a wrapper `View` (fixes a web console error; API unchanged).
3. `src/design-system/components/TrendChart.tsx` — latest-point focal treatment + token axis labels.
4. `app/knowledge/[id].tsx` — category-driven hero variant.
5. `app/paywall.tsx` — decorative `HeroBloom` strip; no commercial change.
6. `app/nutrition/index.tsx` + `app/breathing/index.tsx` — one decorative `HeroBloom` strip each.

**Intentionally kept fully restrained (documented decision, no code):** Today, Check-in (frozen), Health Record landing, Insights, Timeline, Symptoms, Medication detail + history (frozen), Injection detail + history (frozen), Labs landing, all Appointments screens, all Profile screens, onboarding welcome/goals/treatment-context/reminders/body-regions/add-medication/add-injection. Value Reveal + Knowledge landing were already shipped in the proof phase and were not re-touched.

## 17. Side-by-side, logo-hidden consistency test

Screens compared (390 preview, logo/tab-bar mentally masked): Knowledge landing, Today, Check-in, Timeline, Labs marker detail, Medication detail, Appointment summary, Paywall.

Verdict: **they read as one product.** The through-line is the shared vocabulary that predates this pass — warm `#FAF7F2` ground, hairline-separated `Section`/`ListRow`, uppercase `SectionLabel`, `DateBlock`, tabular metrics, one terracotta accent used sparingly, natural-case editorial month/title headings. Art Direction 3.0's contribution is a *graded* layer on top: Knowledge/Paywall/Value Reveal carry visible atmosphere; Nutrition/Breathing carry a whisper of it; Today/Health Record/Insights carry the rhythm but no atmosphere; Timeline/Labs/Medication/Appointments/Profile stay pure document. Nothing looks like it wandered in from a different app, and nothing on the record side looks like a consumer wellness dashboard.

## 18. What creates "premium" on each surface (it is not always illustration)

| Surface | The premium signal |
|---|---|
| Knowledge landing | One confident illustration used **once** at real size + editorial `display` type + a real featured moment |
| Knowledge article | Reading comfort — measure, standfirst weight, calm sources — *then* one content-justified diagram |
| Paywall | Restraint: one ambient band, one accent, a real (not fake) product preview, honest pricing |
| Value Reveal | The reveal is built from the user's **real answers**, staged calmly |
| Today | Speed and a single unambiguous next action — no clutter, no competing focal points |
| Check-in | The custom slider/track feeling tactile and considered vs. a native control |
| Timeline | The continuous rail + tabular day numerals — an editorial record, not a list |
| Labs | One clean thread with one clear "you are here" point, tabular numbers, no chartjunk |
| Medication / Injection | One clear current dose, one button pair, no adherence-percentage theater |
| Appointments | Big confident date typography; feels like a clinic's own record |
| Profile | Quiet and out of the way — premium here is *not shouting* |

## 19. Protected architecture — confirmed untouched

No change to: schema / migrations / repositories / domain scheduling / administration semantics / Timeline derivation / Appointment Summary semantics / notification policy / RevenueCat / entitlement machine / RouteGate / `package.json` / `package-lock.json`. No HealthKit, no AI, no EAS config. `npx expo install --check` reports the same pre-existing version drift as before this pass (expo 57.0.16 vs 57.0.21, etc.) — **not touched**, per the brief.

## 20. Validation

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean (0 errors, 0 warnings).
- `npm test -- --runInBand` — 60 suites, 367 tests, all pass.
- `npx expo install --check` — pre-existing drift only, unchanged.
- Live 390 preview (`?entitlement=entitled`): Paywall, Knowledge landing, Knowledge article (`bloom` and `dawn` variants), Nutrition, Breathing, Labs CRP detail, Today — all render correctly, no console errors, the previously-present `accessible` non-boolean warning is resolved.

## 21. Remaining native / device QA debt

1. 390×844 and 430×932 physical layout (`resize_window` is non-functional in this environment — every prior phase's standing limitation).
2. Dark mode — all of §15's native checklist.
3. Reduce Motion — code-review-confirmed only; no new animation added this pass, so risk is low.
4. Haptics — still none wired anywhere; deferred as before.
5. `HeroBloom` variant rendering under real `react-native-svg` on iOS/Android (web SVG and native SVG occasionally differ on `transform` origin and gradient units — the variants use the same structure as the already-shipped `bloom`, so risk is low, but worth a glance).
