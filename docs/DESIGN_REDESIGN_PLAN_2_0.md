# Design Redesign Plan 2.0

Status: **Planning only. Nothing in this document has been implemented.** This document assumes the findings in `docs/DESIGN_RESEARCH_2_0.md` and the recommendation in `docs/DESIGN_DIRECTION_2_0.md`; read those first. Screen-by-screen verdicts below restate and lightly expand `docs/DESIGN_RESEARCH_2_0.md` §2 in NEW-STRUCTURE form; see that document for the underlying evidence.

---

## 1. Implementation risk audit — read this before touching anything

The redesign's mandate is **presentation and UX structure**, not domain logic. Everything in this section is either data-integrity-critical, safety-critical, or business-critical, and must survive the redesign completely unchanged in behavior even as every screen around it is rebuilt.

### Protect exactly (do not modify behavior, only what renders on screen)

- **Local SQLite health records** — `src/db/schema/*`, `src/db/migrations/*`. No schema change, no new migration, for any reason connected to this redesign. A visual reskin never needs a new column.
- **Check-in semantics** — `src/repositories/checkInRepository.ts`'s one-row-per-calendar-day upsert behavior (Tech Arch §D/§H), pain/fatigue/stiffness-bucket value ranges, and the optional-fields split (Wellbeing/Body Map/Note behind progressive disclosure) are product-approved contracts, not UI accidents.
- **High-Symptom Day semantics** (Phase Y) — `is_high_symptom_day` is set **only** by explicit user action; nothing may ever infer it from pain/fatigue/stiffness/body-area values. `resolveDefaultHighSymptomDay`'s precedence rules (saved value > draft > entry-path default) must survive a Check-in redesign verbatim, even if the toggle looks completely different.
- **Timeline derivation** (Phase X/W) — `buildTimelineEvents` and the whole `domain/timeline`/`domain/healthSummary` pure-aggregation layer. Timeline has **no persistence table of its own** — it is derived, on every render, from existing repository rows. A "signature surface" redesign changes `groupTimelineEvents.ts`/`presentTimelineEvent.ts`/the screen, never the domain layer underneath them, and never introduces a second source of truth for the same events.
- **Appointment Summary calculations** — `getDoctorReportInput`/`HealthSummary`, the `sufficientData` gating on every average, the "recorded doses not adherence" decision (Phase Z), and the CRP/ESR raw-value-only presentation. A more editorial visual treatment must not tempt anyone into adding interpretation, severity language, or a fabricated score to make the report "feel more complete."
- **Product 2.1 aggregation generally** — `domain/healthSummary/*`, `domain/insights/*`. These are pure functions with their own extensive test suites; a visual redesign is a *consumer* of their output, never a reason to touch their math.
- **Onboarding persistence** — `src/features/onboarding/onboardingDraft.ts`, `finishOnboarding.ts`, the exact moment `completed` flips (before the paywall, per Phase Q brief §7 — a non-entitled user who backgrounds the app on the paywall must never be sent through onboarding again). Merging/removing onboarding *screens* must preserve every persisted field and this exact completion-timing contract.
- **RevenueCat / purchases** — `src/purchases/*`, package identifiers, entitlement resolution (`entitlementMachine.ts`). The brief is explicit: keep the hard paywall, keep Annual-primary-with-trial + Monthly-secondary. Only `app/paywall.tsx`'s JSX may change.
- **RouteGate** (`app/_layout.tsx`) — the single authoritative `<Redirect>`-based gate that re-evaluates on every render and is the *only* place entitlement/onboarding-completion is checked. No screen may grow its own entitlement check. `PAYWALL_ADJACENT_SEGMENTS` and the loop-prevention logic must not be touched by a visual pass.
- **Localization** — every `t("...")` key currently in use must keep working during any incremental rollout; renaming/removing copy keys happens screen-by-screen in step with that screen's actual redesign PR, never as a blanket sweep that could silently break an unmigrated screen.
- **Accessibility contracts already in place** — `AccessibleTouchable`'s 44pt minimum enforcement, `Chip`/`SelectableCard`'s checkmark-plus-border (never color-alone) selected state, `StepperField`'s `accessibilityRole="adjustable"` pattern, `useReducedMotion`. A "more distinctive" visual system must be built *on top of* these guarantees, not around them.
- **Notification scheduling** — `src/notifications/*`, `src/features/reconciliation/*`. Entirely unrelated to visual design; do not touch while redesigning the screens that merely *display* reminder settings.

### What IS in scope

Component visual treatment, layout composition, color/typography tokens, iconography, illustration, motion, copy density and wording (not copy *meaning* where it's health-safety-load-bearing), navigation chrome, onboarding sequencing (merging/reordering *screens*, not changing what data is collected or how it's stored), and the Appointment Preparation/Appointment Summary consolidation identified in `docs/DESIGN_RESEARCH_2_0.md` §2 (a UX-architecture change, but one that consolidates onto the *already-correct* Phase W/Z data layer — it deletes a duplicate lookback implementation, it does not add one).

### Rollout discipline this implies

Because presentation and domain logic are cleanly separated in this codebase already (`domain/` never imports repositories; `features/` is the only place they meet), the redesign can proceed screen-family by screen-family without a big-bang rewrite: swap a screen's JSX and its immediate feature-layer presenter, run the existing test suite (which exercises the domain/feature layers the screen consumes, not the JSX), confirm nothing broke, move to the next family. The existing test baseline (53 suites / 313 tests as of the last shipped phase) should never decrease during the redesign for exactly this reason — a pure presentation change should not need to touch, and should not break, a single existing domain/feature test.

---

## 2. Screen redesign plan — KEEP / REMOVE / CHANGE / NEW STRUCTURE

*(Full rationale for every verdict is in `docs/DESIGN_RESEARCH_2_0.md` §2. This table restates each screen's verdict plus a one-line note on the new structure direction, informed by `docs/DESIGN_DIRECTION_2_0.md`.)*

### Onboarding

- **Welcome** — CHANGE structure entirely: replace the icon-circle+eyebrow template with an actual brand moment built from the new identity system (§ logo/wordmark). New structure: a real visual/typographic brand introduction, not a generic hero block.
- **Privacy** — CHANGE: keep as a distinct trust moment (this content deserves its own beat, not to be buried), restyle.
- **Goals + Priority Symptoms + Treatment Context** — MERGE into one combined "what matters to you" step using one selection interaction, removing two full screens.
- **Body Regions** — CHANGE: replace the placeholder Chip list with the real `BodyRegionMap` component (refined to the new visual language), closing an already-documented gap.
- **Medication / Injection setup** — CHANGE: keep as functional forms, restyle; consider inlining Reminders rather than a separate step.
- **Reminders** — MERGE into medication/injection setup.
- **Appointment setup** — CHANGE: restyle only.
- **Personalized Summary + Value Reveal** — MERGE into one "here's what we understood, here's what's ready" moment, removing one full screen.
- **Paywall** — CHANGE presentation completely (§ Design Direction's paywall philosophy); business model, RevenueCat wiring, plan structure unchanged.

Net effect: roughly 11 onboarding-adjacent screens down to roughly 7-8, with zero loss of currently-collected data.

### Core

- **Today** — REDESIGN per Design Direction's Today philosophy: one dominant daily state/action, not a stacked feature list.
- **Check-in** — REDESIGN per Design Direction's Check-in philosophy: one coherent interaction rather than five stacked control types; High-Symptom-Day semantics unchanged, presentation folded into the same coherent flow.

### Track

- **Track (landing)** — REDESIGN as "my health record," with Timeline promoted to visual anchor (not an equal-weight list row) and the remaining modules (Medications/Injections/Labs, Knowledge/Nutrition/Breathing) restructured around it rather than beside it.
- **Symptoms (history list)** — REMOVE as a standalone destination once Timeline fully absorbs its role; redirect its one internal deep-link (Today's "view symptom history" shortcut) to Timeline instead.
- **Medications / Injections / Labs** — CHANGE: restyle, keep structure.
- **Knowledge / Nutrition / Breathing** — CHANGE: restyle, keep subordinate weighting.

### Product 2.1

- **My AS Timeline** — REDESIGN further toward a continuous, typography-led chronology with fewer per-day containers — Track's new visual anchor.

### Appointments

- **Appointments (list) / Appointment Detail** — CHANGE: restyle.
- **Appointment Preparation + Appointment Summary** — MERGE into one redesigned Before/During/After experience built entirely on the Phase W/Z deterministic data layer; Prepare's unique value (notes surfacing, "since last visit" framing) is preserved as a feature, folded into the new single screen rather than kept as a second, older, parallel implementation.
- **Appointment Summary** content — REDESIGN toward a more editorial "bring this to your doctor" visual register, without adopting clinical/EHR styling.

### Insights

- **Insights (landing)** — REDESIGN: replace the flat 7-row menu with a narrative/visual landing (restrained charts and/or a "story of this period" framing) so the tab's own name is true of its own landing screen, not just its detail screens.

### Account

- **Profile + settings sub-screens** — KEEP structure (this is the one place the flat-list pattern is correct), CHANGE cosmetics (icon set, type, color) only.

---

## 3. Proposed implementation phases

Informed by `docs/BRAND_NAMING_STRATEGY_2_0.md` (recommending **Ilium**, stress-tested and confirmed in `docs/DESIGN_DIRECTION_VALIDATION_2_0.md`) and `docs/DESIGN_DIRECTION_2_0.md` (originally the Editorial Health Journal direction, **updated by the stress test to Hybrid "Warm Precision"** — see `docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §5/§12). Design-B/C/D/E/F below should build the **validation document's §6-7 screen concepts** (Today/Check-in/Timeline/Appointment Summary/Paywall), not the earlier abstract direction alone — the validation document is the more current, more concrete specification for exactly the phases that follow. Adjusted from the brief's own suggested Design-B through Design-I structure only where this research surfaced a concrete reason to reorder or split — noted inline. **None of these phases are authorized to begin by this document** — Furkan's explicit design/naming approval is required first (per the brief's own closing instruction), and each phase remains subject to the risk audit in §1 regardless of order.

- **Design-B — Brand + Design System 2.0.** Rename to Ilium in design artifacts only (no production rename yet — see §1); build the logo/wordmark, app icon, the "Paper & Ink" color tokens (light + dark, contrast-verified), the extended typography scale plus tabular-numeral treatment for logged values, and the retired-vs-kept component inventory (§1 of `docs/DESIGN_RESEARCH_2_0.md`'s current-app audit names exactly what `GroupedList`/`MetricCard`/icon usage needs to change). This phase produces the token/component foundation every later phase consumes — it must genuinely land first, not just nominally.
- **Design-C — Welcome + Onboarding + Paywall.** Implement the merged onboarding sequence (§2 above): Goals/Priority Symptoms/Body Regions as one adaptive flow reusing the real `BodyRegionMap` component instead of onboarding's current placeholder chip list; Medication/Injection setup merged with Reminders; Privacy folded into Welcome; Personalized Summary/Value Reveal merged into one moment that opens the Paywall's own narrative; Appointment setup deferred out of onboarding (a product-scope question flagged for Furkan's decision, not assumed). Paywall presentation rebuilt per `docs/DESIGN_DIRECTION_2_0.md` §21 — business model, RevenueCat wiring, and plan structure untouched.
- **Design-D — Today + Check-in.** The two most-used, most safety-load-bearing screens — deliberately scheduled early (after the system exists, before the lower-traffic screens) so the new brand is proven against real daily-use interaction, not just static/marketing screens, while the redesign still has the most runway to correct course.
- **Design-E — Track + Timeline (+ navigation change, if approved).** Timeline promoted to Track's visual anchor; if the 3-tab navigation recommendation (`docs/DESIGN_DIRECTION_2_0.md` §19) is separately approved, this is the phase that would fold Insights into Track — flagged as its own explicit go/no-go decision within this phase, not a silent default, given the recommendation itself is marked "needs validation" in the direction document.
- **Design-F — Appointments + Appointment Summary.** Includes the Appointment Preparation/Appointment Summary merge identified in §1/§2 above — the one place this redesign changes UX *architecture*, not just presentation, and therefore the phase most worth its own isolated review before/after landing.
- **Design-G — Insights.** Kept as its own phase even if Design-E folds it into Track structurally, since its narrative/visualization rebuild (§9 of the direction doc) is substantial regardless of which tab it lives under.
- **Design-H — Profile + Knowledge + Supporting Content.** Lowest-risk, cosmetic-only phase (§1's audit found Profile's structure already correct) — good candidate to run in parallel with a later phase rather than strictly sequentially if implementation capacity allows.
- **Design-I — Cross-app polish + accessibility + motion.** A final pass confirming the accessibility findings in `docs/DESIGN_RESEARCH_2_0.md` §11 are actually met (not just designed for) across every rebuilt screen, plus the motion system's Reduce-Motion equivalents, before considering the reset complete.

**One explicit reordering flag beyond the brief's own suggested sequence**: the brief's default order places Design-D (Today/Check-in) after Design-C (Onboarding/Paywall) — kept as-is above — but within Design-C itself, the Paywall's new narrative approach (echoing onboarding answers back, per `docs/DESIGN_DIRECTION_2_0.md` §21) means Design-C cannot really be finished independently of the merged Personalized-Summary/Value-Reveal onboarding work landing first within the same phase — they should not be split into separate implementation passes even though they're both named in Design-C, or the Paywall will be built against onboarding content that's about to change underneath it.
