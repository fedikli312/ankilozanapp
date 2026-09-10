# Visual Craft Pass 3.1

Status: **uncommitted working-tree pass, pending Furkan's review.** HEAD unchanged at `fa2d815`. Nothing committed or pushed.

This is not a redesign. IA, product features, and health semantics are untouched. It is a focused *execution-quality* pass on the Art Direction 3.0 surfaces, judged from rendered 390-width screenshots, not code cleanliness. The question asked of every surface: **"Does this look intentionally art-directed, or merely decorated?"**

---

## 1. Problems found from screenshot review

| Surface | Problem |
|---|---|
| `HeroBloom` (everywhere) | Three flat translucent ellipses + a wash. No depth, no foreground/background separation, no line work, no intentional negative space. Read as generated SVG, not designed. |
| Value Reveal | Vertically stacked: strip · headline · label · **big tinted `QuietSurface` box** · index rows. The box felt heavy; illustration and content were two separate layers; the real answers weren't treated as design material. |
| Paywall preview | The example record's numbers used the default `MetricLine` (24pt), same weight as the unit — no scale confidence. The atmosphere strip (92pt) competed with the offer for first-glance attention. |
| Check-in slider | Value readout at 15pt, same weight as everything. Thin 4pt track, flat thumb with no depth, no drag feedback. |
| Check-in stiffness | Hairline `Section` list with hollow-ring markers — read as a form's radio group. |
| Body map | Silhouette on blank paper; permanent hotspots outlined (peppered-target look). |
| Nutrition / Breathing | The propagation pass's decorative `HeroBloom` strip was filler on a plain educational list. |

## 2. Visual elements removed ("remove before add", §19)

- **Nutrition + Breathing HeroBloom strips** — deleted. Replaced with an editorial header (confident title + real lead line + generous space). A screen does not need an illustration because it is educational.
- **Value Reveal's `QuietSurface` box** — removed. The record is now an open, hairline-ruled block.
- **Body-map atmospheric field** — *tried and removed*. At the figure's tall, narrow scale the organic-mass fragments read as faint lumps rather than an even glow, and the cleanest implementation tripped a benign `collapsable` DOM warning on the web preview. The outline + softened hotspots carry it.
- **Body-map hotspot strokes** — removed; the permanent "tap here" cues are now a bare, strokeless 6%-tint whisper.

## 3. Visual elements added

- **Atmosphere primitive family** (`src/design-system/illustrations/atmosphere.tsx`) — 5 composable SVG fragments (§5).
- **`HeroBloom` rebuilt** as a layered composition of those fragments, with three genuinely different variant arrangements (§6).
- **Value Reveal**: atmosphere now bleeds behind the record block; tabular index numerals at `metricMedium`; a real "fact line" from live onboarding counts (§7).
- **Paywall preview**: hero-scale (`metricLarge`) tabular values with a whispered `/10`, a fine `dataPrimary` record thread with a latest-point anchor, hairline structure (§9).
- **Depth tokens** (`src/design-system/tokens/elevation.ts`) — 3 tiers; `elevation.focal` soft shadow used on the slider thumb (§14).
- **Typography**: `typography.metricDisplay` (46pt tabular) added for hero-numeral moments (§15).
- **Slider**: 6pt track, `elevation.focal` thumb, `thumbScale` grow-on-drag, `metricMedium` accent value readout (§11).
- **Stiffness**: tier-1 tonal selection band (`colors.selected`), quiet bullet markers instead of radio rings (§12).
- **Body map**: softened hotspots, `rx/ry` grow on the selection highlight (§13 — note the `rx/ry` animation was reverted, see §13).

## 4. Depth system (§14)

Three tiers, no deeper hierarchy. `src/design-system/tokens/elevation.ts`.

| Tier | Name | Means | Where |
|---|---|---|---|
| 0 | canvas | `colors.background`, nothing | every screen ground |
| 1 | atmospheric | tonal separation only — a step-off surface token + deliberate overlap. No shadow, no required border. | `QuietSurface`, the stiffness selection band, the Value Reveal atmosphere behind the record |
| 2 | focal | the ONE allowed soft shadow (`elevation.focal`: `#0B0906` @ 18%, 6px radius, 2px offset). Rare. | the Check-in slider thumb (a control that genuinely lifts off its track); reserved for a future active bottom-sheet |

No generic drop shadows anywhere else. On the dark canvas the shadow reads as nothing and tier-1 tonal separation carries the weight — correct behaviour.

## 5. The atmosphere primitive family

`src/design-system/illustrations/atmosphere.tsx` — 5 fragments, one shared visual DNA (organic Bézier contour, 3-token palette at low alpha, controlled asymmetry, one crisp foreground anchor). Each renders raw `react-native-svg` children and must sit inside a parent `<Svg>`; none carry accessibility semantics (the composition's call site marks the whole `<Svg>` decorative).

| Fragment | Role |
|---|---|
| `AtmosphereField` | far layer — a soft radial halo + one very large faint organic mass drifting off one edge |
| `OrganicMass` | mid-depth asymmetric contoured shape (replaces the old bare `<Ellipse>`); 4 fixed asymmetry "seeds" so masses relate without repeating |
| `ContourLine` | a single open, gently curved stroke — the "line work", echoing the spine curve / a margin rule |
| `AnchorDot` | the one crisp higher-contrast foreground accent, placed in negative space; optional concentric ring |
| `MarginBracket` | a scaled fragment of `MarginMark`'s corner bracket — the one explicit tie between the abstract atmosphere and the brand identity (one variant only) |

Helpers `blobPath()` / `curvePath()` build smooth Catmull-Rom-derived Béziers. Total primitive count stays at 5 (cap is 6). They are exported from `@/design-system` for reuse.

## 6. HeroBloom evolution

`HeroBloom` keeps its API (`width`, `height`, `variant`) but is now a composition of the family. Three variants, each a different *arrangement* — different dominant element, different negative-space distribution — not the same shapes nudged:

- **`bloom`** — one dominant `OrganicMass` left-of-centre with a smaller gold mass overlapping it (the overlap is the deliberate tonal moment), a calm `ContourLine` skimming below like a margin rule, one ringed `AnchorDot` in the open right third. Used on Knowledge landing + article `basics`/`appointmentPrep` + Value Reveal is `drift`.
- **`dawn`** — a high, wide `AtmosphereField` (most of the frame is quiet light), one low wide gold mass along the base like a horizon, a small `MarginBracket` upper-left, one small anchor. Used on Paywall + Knowledge `treatment` articles.
- **`drift`** — `ContourLine` is the subject: one long calm drift across the whole frame with a supporting mass resting on it and two anchors setting a rhythm. Used on Value Reveal + Knowledge `symptoms`/`dailyLife` articles.

`bloom` no longer renders byte-for-byte as the proof-phase version — that is sanctioned: the brief said "HeroBloom is not final art… evolve it."

## 7. Value Reveal — before / after composition

**Before:** `[progress] → HeroBloom strip (100pt boxed) → display title → QuietSurface{ 01/02/03 rows } → [Devam et]`. A vertical stack.

**After:** `[progress] → display title (crisp, 88% width) → { atmosphere (drift) bleeding behind } KAYDIN ŞEKILLENIYOR → 01 / 02 / 03 hairline-ruled record rows (tabular metricMedium index in brandPrimary) → one factual line: "Eklenen tedaviler: N · Yaklaşan randevular: N" → [Devam et]`.

- Data and navigation unchanged: same `presentValueReveal` presenter, same `useOnboardingSummary`, same `finishOnboarding()` → `router.replace("/paywall")`, same `OnboardingProgress step={6}`.
- The **real onboarding counts** (treatments added, upcoming appointments) now surface as one quiet factual line — real repository reads (the same ones Today uses), never invented, never a score, returns `null` when there's nothing concrete to state.
- **Pain / Fatigue numbers were NOT added here.** The user's §4/§5 reference to "3.2 /10 / 2.8 /10 / Sulfasalazine" is the **Paywall's** example preview — at Value Reveal the user has recorded zero check-ins, so showing numbers would be dishonest. The honest "record taking shape" is the structure (the real capability statements the user's own answers produced) given editorial weight. That craft — tabular numerals, hairlines, a record/thread motif — was applied to the Paywall preview instead, where the values actually live.
- The staged reveal is preserved (`Animated.stagger`), switched to the non-native driver (the native-driven version was not painting the freshly-mounted rows in the web preview) and given a completion-callback snap so content visibility never depends on the animation playing.

## 8. Knowledge refinement (§7)

Architecture untouched. The hero improved automatically via the family evolution (Knowledge landing keeps `bloom`; articles vary by category — see §6). The featured `SpineConcept` thumbnail and the inline diagram are unchanged — still deliberately conceptual, still captioned, still medically honest. No content, IA, or source change.

## 9. Paywall refinement (§8)

**All commercial behaviour frozen and verified in live QA:** hard paywall, annual default + selected, 7-day trial copy only when eligible, monthly visible, real localized `priceString` prices, billing disclosure, Restore / Terms / Privacy, no fake urgency/savings/testimonials, no gradient button.

Visual craft only:
- Atmosphere strip shrunk 92 → 76pt, `dawn` variant, so it stays subordinate to the offer.
- The example record preview recomposed: `ÖRNEK` uppercase micro label, `Ağrı 3.2 /10` and `Yorgunluk 2.8 /10` as hero-scale (`metricLarge`, 32pt) tabular numbers with a whispered `/10`, then a fine terracotta record thread with a latest-point anchor, a hairline, then `Sulfasalazine · 9 alındı, 1 kaçırıldı` as one quiet record line. It reads as a glimpse of a real Ilium record; still clearly labelled an example. It is the screen's focal moment.

## 10. Nutrition decision

**HeroBloom strip removed.** Editorial header instead (confident `title`, real lead line at `body` size, `spacing.xl` before the first section). The strip added no comprehension or brand value on a plain educational list (§9, §19).

## 11. Breathing decision

Same as Nutrition — strip removed, editorial header.

## 12. Pain slider refinement

Behaviour/semantics **frozen** (0–10 integer, snapping, `onChange`, PanResponder math, accessibility actions — all untouched). Visual only:
- Value readout: `24pt` `metricMedium` tabular in `brandPrimary`, with `/ 10` whispered in `caption`/`textSecondary` on the baseline. (Was one flat 15pt string.)
- Track: `4 → 6pt`.
- Thumb: `elevation.focal` soft shadow (tier-2 depth) + `thumbScale` (`1 → 1.15`) grow while the finger is down, settling back on release. `motion.micro` duration, non-native driver (consistent with the thumb's `left` animation on the same view), instant under Reduce Motion.

## 13. Fatigue slider refinement

Identical to Pain — it is the same `NumericScale` component (`PainScale`/`FatigueSelector` are thin wrappers). One change, both surfaces.

## 14. Stiffness refinement

Categorical selection preserved (5 buckets, stored enum untouched). The hairline `Section` list was replaced with a short column of soft-cornered rows separated by whitespace (`gap: xxs`, `radius.small`). Selection is now a **tier-1 tonal band** (`colors.selected` behind the row, no border, no shadow) + a solid `brandPrimary` dot + bold `brandPrimary` label. Unselected rows carry a small quiet neutral **bullet** (5pt `borderStrong` dot) — deliberately not a hollow radio ring. Every row still clears 44pt; selection is never colour-only.

## 15. Body Map refinement

All approved interaction, geometry, touch targets, and persistence **untouched** (`REGION_ELLIPSES`, `REGION_TOUCH_TARGETS*`, the silhouette path, the `Pressable` overlay). Visual only:
- Permanent hotspots softened to a bare, strokeless `textTertiary` @ 6% tint — a whisper, not an outlined target.
- The selection highlight's `rx`/`ry` grow-in animation was written and then **reverted** — animating extra SVG props on `AnimatedEllipse` in the web preview surfaced a benign `collapsable` DOM warning; the opacity fade (the approved proof-phase behaviour) is kept.
- A decorative atmospheric field behind the figure was tried and **removed** (§2).

## 16. Typography refinement (§15)

- New tier `typography.metricDisplay` — `46pt / 50 / 700`, tabular. The hero-numeral step above `metricLarge`, for the one place a screen leads with a value like a consumer-health reference. Not force-applied; available. Currently the Paywall preview uses `metricLarge` (32) as the right size for a two-up at 390; `metricDisplay` is reserved for a single-hero-number moment.
- Number-vs-unit contrast applied on the slider readout and the Paywall preview: the number carries the confidence, the unit whispers (`micro`/`textTertiary`).
- No other tier renamed or resized. "Premium" is not "every heading huge" — Nutrition/Breathing kept `title` (28), not `display`.

## 17. Depth-system implementation

See §4. `elevation.ts` exports `elevation.atmospheric` (a `{}` marker) and `elevation.focal` (the one shadow). Exported from `@/design-system`. One consumer so far: `NumericScale` thumb.

## 18. Motion refinement

- Slider thumb grow/settle: `motion.micro` (100–140ms), non-native driver, Reduce-Motion → instant.
- Value Reveal staged reveal: `motion.contentEnter`, `Animated.stagger` (90ms step), non-native driver + completion snap.
- No new motion on any Level 3 record screen. `heroEnter` still Level 1 only.
- Nothing animates continuously; nothing is tied to scroll.

## 19. Reduce Motion

Every new/changed animation collapses to an instant end state under `useReducedMotion()`:
- `NumericScale.settleThumbScale(to, reduced)` — `reduced` → `thumbScale.setValue(to)`, no timing.
- Value Reveal effect — `reducedMotion` → `snapVisible()` immediately, returns before the stagger.
- Body map highlight — unchanged (was already Reduce-Motion-safe via `progress`).
Not live-verifiable on the web preview (same standing limitation); code-reviewed.

## 20. Accessibility

- All atmosphere SVG stays decorative — `HeroBloom` call sites keep `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`; the atmosphere fragments carry no semantics.
- `SpineConcept`'s labelled/decorative wrapper (fixed in the propagation pass) is unchanged.
- Slider: `accessibilityRole="adjustable"`, `accessibilityValue`, increment/decrement actions — untouched. The value is still exposed as text.
- Stiffness: `accessibilityRole="button"` + `accessibilityState={{ selected }}` per row — unchanged; selection is band + dot + weight, never colour alone.
- Body map: every region `Pressable` keeps its role/state/label; 44pt via `hitSlop` — untouched.
- 44pt: no interactive target shrunk. Stiffness rows still `minHeight: 44`.
- Contrast: the slider readout moved to `brandPrimary` (an approved action/text colour on `background`). The Paywall `/10` uses `textTertiary` (a WCAG-verified body tier). No new pairing.
- Long Turkish: Nutrition/Breathing headers wrap cleanly (verified at 390); the slider readout row is `space-between` with a short numeral, no overflow.

## 21. Performance

- Atmosphere fragments are static `<Path>`/`<Circle>` — `HeroBloom` is ~8–12 nodes, rendered once per screen, never in a list, never animated. `blobPath`/`curvePath` run once at render, pure arithmetic.
- No SVG filters, no blur, no continuous animation, no scroll-linked animation.
- `NumericScale` adds one `Animated.Value` (`thumbScale`) and one interpolation — negligible.
- Live scroll spot-check (Knowledge, Nutrition, Breathing, Check-in, Value Reveal): smooth, no jank.

## 22. 390 QA (live, web preview, `?entitlement=entitled`)

| Screen | Result |
|---|---|
| Value Reveal | Recomposed; atmosphere frames the record; `01`/`02` tabular rows + real fact line render; no console error. (QA'd via a temporary `store.ts` `completed:false` flip, reverted — `git diff` on `store.ts` is empty.) |
| Knowledge landing | Evolved `bloom` hero — layered, negative space preserved; featured thumbnail intact; no console error. |
| Knowledge article | `bloom`/`dawn`/`drift` variants render distinctly by category; inline `SpineConcept` + caption intact; no `accessible` or `collapsable` error. |
| Paywall | `dawn` atmosphere subordinate; example preview reads as a real record with hero numbers + thread; every commercial element intact (annual default, trial gating, monthly, prices, Restore/Terms/Privacy). |
| Check-in Pain / Fatigue | Confident `24pt` accent readout, 6pt track, shadowed thumb; drag works, value updates. |
| Check-in Stiffness | Tonal selection band + bullet markers — reads as considered options, not a radio form. |
| Body Regions | Softened hotspots; silhouette + outline; no console error (atmosphere field removed). |
| Today | Untouched; renders clean; 3 tabs. |
| Labs CRP | Untouched this pass (Level 3); latest-point ring + bold latest label from the propagation pass render fine. |
| Nutrition / Breathing | Strips removed; editorial header; lists intact. |

## 23. 430 status

Not verifiable — `resize_window` is non-functional in this environment (unchanged standing limitation). Deferred to device QA. The component vocabulary is the same one verified at 390/430 in prior phases; the new elements are fixed-height decorative bands and typographic changes with no fragile width behaviour.

## 24. Dark-mode status

Token-level only; web preview forces light. Zero hardcoded colour added except `elevation.focal`'s shadow (`#0B0906`, an optical effect, reads as nothing on the dark canvas — correct). Every atmosphere colour is `brandPrimary`/`accentRare`/`positive`/`brandSecondary` (all have dark values). Native dark checklist carried forward: confirm the evolved `HeroBloom` masses read as warmth not smudge on `#1A1714`; confirm the stiffness `colors.selected` band (`#3D2A22`) has enough contrast with the row text; confirm the slider thumb shadow is invisible-but-harmless on dark.

## 25. Tests

`npm test -- --runInBand` — 60 suites, 367 tests, all pass (i18n en/tr parity passes with the 3 new `onboarding.valueReveal` keys: `recordLabel`, `factTreatments`, `factAppointments`).

## 26. tsc

`npx tsc --noEmit` — clean.

## 27. lint

`npm run lint` — clean (0 errors, 0 warnings).

## 28. Protected-file audit

No change to: schema, migrations, repositories, domain semantics, scheduling, administration semantics, Timeline derivation, Appointment Summary semantics, notification policy, RevenueCat / entitlement machine, RouteGate, `package.json`, `package-lock.json`. No HealthKit, AI, or EAS. `src/repositories/web/store.ts` diff is empty (temporary QA flip reverted). `npx expo install --check` unchanged from the prior pass (same pre-existing version drift, not touched).

## 29. Files changed (this pass)

**New:** `src/design-system/illustrations/atmosphere.tsx`, `src/design-system/tokens/elevation.ts`, `docs/VISUAL_CRAFT_PASS_3_1.md`.

**Modified:** `src/design-system/illustrations/HeroBloom.tsx`, `src/design-system/index.ts`, `src/design-system/tokens/index.ts`, `src/design-system/tokens/typography.ts`, `src/features/checkIn/NumericScale.tsx`, `src/features/checkIn/StiffnessSelector.tsx`, `src/features/checkIn/BodyRegionMap.tsx`, `app/onboarding/value-reveal.tsx`, `app/paywall.tsx`, `app/knowledge/[id].tsx`, `app/nutrition/index.tsx`, `app/breathing/index.tsx`, `src/localization/translations/{en,tr}.json`, `PROJECT_MEMORY.md`.

(`CheckInForm.tsx` shows in `git status` from earlier phases — not touched this pass. `TrendChart.tsx` was the propagation pass.)

## 30. Remaining visual debt

1. `HeroBloom` `bloom`'s dominant mass still has a slightly dark core where `brandPrimary` overlaps the field — reads as depth, but a hair muddy; could tune the blend.
2. Value Reveal's `drift` contour passes close under the first record row's text — low-contrast and acceptable as an underlay, but a deliberate gap would be cleaner.
3. `SpineConcept` remains minimal (a curve + a pelvis blob) — honest and conceptual, but not yet "a real editorial illustration". Deferred (proof-phase approved; not this pass's scope).
4. Native rendering of the atmosphere Béziers under real `react-native-svg` (transform origin / gradient units occasionally differ from web) — low risk, same structure as the shipped proof, worth a device glance.
5. Body-map "more sophisticated selection transition" (§13) — only the opacity fade ships; a size ease is desirable but needs a web-safe technique.
6. 430 + dark + Reduce Motion — device QA (§23, §24, §19).

## 31. Does the rendered product now meet the original reference quality bar?

**Substantially, on the surfaces this pass touched — not yet uniformly across the whole app, and honestly not to the polish ceiling of the two Dribbble shots.**

Where it now holds up: the references' core craft moves are present — one confident visual per screen used once at real size (not a repeated motif), real number weight with quiet supporting labels (Paywall preview, slider readout, Value Reveal indices), a single ambient graphic giving a plain area atmosphere without a card (Value Reveal, Knowledge, Paywall), consistent restrained rounding, and one accent used sparingly. `HeroBloom` reads as a deliberate layered composition now, not three ellipses. Value Reveal reads as "my record taking shape" rather than a feature list in a box. The Paywall preview has genuine number confidence. Check-in feels tactile.

Where it still falls short of the bar: the illustration sophistication is *good abstract art direction*, not *illustrated storytelling* — `SpineConcept` in particular is deliberately minimal, and there is no bespoke editorial illustration for any single article (correctly deferred). The reference shots also carry a level of micro-detail (subtle inner shadows on cards, precise icon-plus-sparkline stat tiles, a hero gauge) that Ilium deliberately does not adopt because those patterns imply the dashboard / severity / at-a-glance-score reading the product bans on health data. So on the Level-3 record screens the "premium" is entirely typography, spacing, chronology, and data restraint — which is the right call for a clinical record, but it will never *look* like a consumer wellness app, by design.

Net: the expressive surfaces (Level 1 / 1.5 / the Value Reveal moment / the Check-in interaction) now look art-directed rather than decorated. The record surfaces look like a considered clinical document, which is the intended ceiling for them. I would not call the whole product "finished art", but the specific weakness the brief named — "developer-created SVG decoration" — is addressed on every surface it appeared on.

## 32. Remaining native QA

430×932 physical layout; dark mode (full §24 checklist); Reduce Motion (slider grow, Value Reveal stagger); native `react-native-svg` rendering of the atmosphere family; haptics (still none wired — no new dependency, deferred as before).

---

## Composition correction (3.2)

A follow-up screenshot-driven pass — no redesign, no new primitives/tokens/illustrations, no architecture. Three files: `app/onboarding/value-reveal.tsx`, `app/paywall.tsx`, `src/features/checkIn/BodyRegionMap.tsx`.

**Rule established:** decorative atmosphere may frame / lead / balance / create depth; it may NOT cross body copy or a CTA label, reduce contrast, or look like data / selection / symptom intensity.

- **Value Reveal** — the `drift` atmosphere was moved out from behind the record statements into the negative space *above* the headline (bleeds to the screen edges, no box, clears the headline's top with a real gap via `ATMOSPHERE_LIFT`). The record zone (`KAYDIN ŞEKILLENIYOR` → `01`/`02`/`03` → fact line) now sits on completely clean background — no line, mass, or dot touches it. The whole composition flows from near the top (`paddingTop`, not `justifyContent: center`) so the CTA reads as part of the content, not a detached footer.
- **Onboarding hero (Paywall top)** — the atmosphere box (`surfaceSecondary` fill + `borderRadius`) was removed. `dawn` now sits in the negative space above the wordmark, bleeding to the screen edges, lifted so only its empty upper part grazes the wordmark and the `MarginBracket` reads as a corner mark — the headline below is left entirely clear of art. Reads as one wordmark + headline + atmosphere lockup, not a banner over two text blocks. Every commercial element re-verified unchanged.
- **Body Map unselected landmarks** — the region-sized faint ellipses ("translucent oval overlays") were replaced with one small neutral dot per landmark (`HOTSPOT_DOT_RADIUS = 3`, `textTertiary` @ 32%). Discoverable pin-points, no longer patches over the figure. Selected state (`AnatomyHighlight`) unchanged. Geometry / touch targets / taxonomy / persistence untouched.
- **Redundant Body Map copy** — `checkIn.bodyMapEmptyHint` is no longer rendered; it duplicated the "Ağrı hissettiğin bölgelere dokun" instruction shown right above the silhouette. One instruction only; the absence of selected tags is the empty state. The key stays in both locale files (parity preserved) but unused.
- **Atmosphere collision audit** — every current `HeroBloom`/atmosphere use checked: Value Reveal ✓, Paywall ✓, Knowledge landing/article ✓ (atmosphere in its own boxed zone, all text below it), Nutrition/Breathing ✓ (removed in 3.1). No decorative element crosses body copy or a CTA anywhere.
- **Pre-existing warning, not from this pass:** mounting the Body Map on the web preview logs a benign dev warning — `Received 'false' for a non-boolean attribute 'collapsable'` — from `Animated.createAnimatedComponent(Ellipse)` in `AnatomyHighlight` (approved body-map internals, unchanged). `collapsable` is an Android view-flattening hint; `false` is the safe default; no functional/native/a11y impact. Separate cleanup if desired.
