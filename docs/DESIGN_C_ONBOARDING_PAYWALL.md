# Design-C — Onboarding + Personalized Value Reveal + Hard Paywall

Phase Design-C, built on Design System 2.0 foundation commit `56ef9be` and
Design-F (`6228582`). UX/presentation work only — no schema, migration,
repository, RouteGate, or RevenueCat product-configuration change. Status:
**implemented, uncommitted**, pending review per the brief's explicit
instruction.

## 1. Felt-step count

**Previous: 11 felt steps** (Welcome, Privacy, Goals, Priority Symptoms,
Body Regions, Treatment Context, Add Medication/Injection, Reminders, Add
Appointment, Personalized Summary, Value Reveal), each with its own
progress dot, plus the hard paywall.

**Final: 6 felt chapters + the hard paywall (~7 total felt screens)**:
Welcome (merged with Privacy) → Goals + Priority Symptoms (merged, one
question) → Body Regions → Treatment Context → Treatment setup + Reminders
(one chapter — Add Medication/Add Injection/Reminders share one progress
dot) → Value Reveal (merged with the old Personalized Summary) → Paywall.
Appointment setup was removed from the primary progression entirely (§9).

Net code change: -299 lines across onboarding + paywall (3 route files
deleted outright, 1 more merged away, despite adding one new reusable
component and one new tested presenter module).

## 2. Route → chapter mapping

| Chapter (progress dot) | Route(s) |
|---|---|
| 1. Welcome | `/onboarding/welcome` |
| 2. Goals + Priority Symptoms | `/onboarding/goals` |
| 3. Body Regions | `/onboarding/body-regions` |
| 4. Treatment Context | `/onboarding/treatment-context` |
| 5. Treatment setup + Reminders | `/onboarding/add-medication` → `/onboarding/add-injection` (if "both") → `/onboarding/reminders` |
| 6. Value Reveal | `/onboarding/value-reveal` |
| — (un-dotted) | `/paywall` |

`OnboardingProgress`'s `TOTAL_STEPS` is now `6`; `step` values were
updated across every screen to match. Technical route count (9, down from
11) stays independent of felt-chapter count, exactly as the brief allows.

## 3. Welcome

Merges the old Welcome + Privacy screens into one (brief §3). Concrete
product thesis, not a mood statement: **"Keep the time between
rheumatology visits in one place."** / "Romatoloji randevuların
arasındaki süreci tek bir yerde tut." — directly answering "what does
Ilium organize" (check-ins, treatments, lab results) without a feature
checklist, in one supporting sentence. One condensed local-first/privacy
line (replacing the old 3-item icon+checkmark list) plus the existing
"More about privacy" link to `/profile/privacy-data`. No icon circle, no
decorative illustration — `Wordmark` (Margin Mark + "Ilium") is the one
brand moment on the screen, per brief §3's "use sparingly."

## 4. Goals + Priority Symptoms

One screen, one framing question ("What do you want Ilium to help you
keep track of?" — the brief's own suggested framing), with two clearly
distinct sub-prompts and two `Section`s of `OptionRow`s underneath. Stored
as the exact same two separate fields they always were —
`OnboardingPersonalization.goals` (max 3) and `.prioritySymptoms`
(unlimited) — **never merged data models**, per brief §6's explicit
instruction. `priority-symptoms.tsx` deleted; its screen-level `title` key
retired (redundant with the shared chapter title), its `supporting` key
repurposed as the symptoms sub-prompt.

## 5. Body Regions

Left structurally as-is (already a concise `Chip` multi-select over the
exact 7-region taxonomy, no Body Map dependency, per brief §7) — only its
progress-dot number and its `supporting` copy were touched (shortened per
the copy audit, §21 below).

## 6. Treatment Context

Single-select question, unchanged branching logic (decides which of
Add Medication/Add Injection appear next). Its visual grammar changed
from `SelectableCard` (icon + bordered card) to the new `OptionRow`
(boxless, large text) — the same retirement applied to Goals/Priority
Symptoms. `TREATMENT_CONTEXT_ICONS` (now orphaned) was deleted from
`personalizationIcons.ts`.

## 7. Treatment setup + Reminders

Add Medication/Add Injection kept their real, existing, compact quick-add
forms (`MedicationForm`/`InjectionForm`, 71/90 lines each — already short)
and their existing Skip buttons, unchanged. Only the decorative
`Ionicons` glyph above each title was removed (brief §4: no icon
ornament), and both now share progress dot 5 with Reminders rather than
each advancing the indicator. Reminders' own permission-request timing is
unchanged: the one, explicit, user-initiated request still fires only
from Continue, after this same screen's own title/supporting text has
already explained what it's for (brief §9) — no request on screen load.

## 8. Appointment setup — removed from onboarding

`app/onboarding/add-appointment.tsx` deleted outright (brief §10: "If it
currently lengthens onboarding materially: remove it from the primary
onboarding progression"). Reminders' `proceed()` now routes straight to
Value Reveal. Appointment *functionality* itself is completely untouched
— creating an appointment remains fully available from the Appointments
tab/Today, exactly as before; only its forced place inside onboarding is
gone. The Reminders screen's own "appointment reminders" toggle (a
different, general reminder-intent question, unrelated to creating one
specific appointment) was left exactly as-is.

## 9. Personalized Value Reveal

Merges the old two-screen "Personalized Summary" + "Value Reveal" into
one screen and one moment (brief §11), via a new pure, unit-tested
presenter, `src/features/onboarding/presentValueReveal.ts`. At most 3
concrete, truthful capability rows — never "AI analyzed your answers,"
never a fabricated recommendation. Candidate rows:

1. **Symptom tracking** (always shown; the one guaranteed baseline,
   since daily check-in is always available) — sharpens to name the
   actual selected symptom(s) when 1 or 2 were chosen (matching the
   brief's own literal example, "Track pain and morning stiffness
   together"), falls back to a symptom count for 3+, and to a generic
   but still honest line when none were selected.
2. **Treatment record** — shown only if `treatmentContext` is
   medication/injection/both, or the `treatment` goal was selected;
   wording matches exactly which treatment type was chosen (brief's own
   example, "Keep injections and medications in one record," used
   verbatim for the "both" case).
3. **Appointment prep** — shown only if the `appointments` goal was
   selected, or a real upcoming appointment already exists; copy is the
   brief's own literal example, "Review the last 30 or 90 days before
   your next appointment."

## 10. Proof personalization uses real inputs (live-verified)

Live QA selected goals `symptoms` + `appointments` and priority symptoms
`pain` + `stiffness`, then treatment context `both`. The resulting Value
Reveal screen showed exactly:

- "Birlikte takip et: Ağrı ve Sabah tutukluğu" (symptomsTwo, naming the
  two real selections)
- "İğnelerini ve ilaçlarını tek kayıtta tut" (treatmentBoth)
- "Randevundan önce son 30 veya 90 günü gözden geçir" (appointmentPrep)

— matching `presentValueReveal`'s own 13 unit tests exactly (zero
priority symptoms → generic fallback; one → named; two → both named;
three+ → count only; each `treatmentContext` value → its own specific
copy; `treatmentContext` null but the `treatment` goal selected → the
generic-but-still-real fallback, never inventing specifics; appointment
row gated on the real `appointments` goal OR a real upcoming-appointment
count; never more than 3 rows even when every condition qualifies).

## 11. Paywall hierarchy

Restructured to brief §15's order: Wordmark → concise value statement
(headline + subheadline) → one real product preview → 2-3 concrete
benefits → plan selection → CTA → Restore/Terms/Privacy. Plans no longer
sit directly under the headline — the preview and benefits push them down
so they don't dominate the first viewport.

Fixed the stale pre-rebrand `"Ankilozanapp"` brand-row text (a leftover
from before Design-B's "Ilium" rebrand) — replaced with the real
`Wordmark` component, consistent with Welcome.

## 12. Product preview

One real preview (brief §16): a `QuietSurface` panel — the paywall's one
deliberate use of that "genuine emphasis" primitive — reusing the exact
Appointment Summary visual language (`MetricLine` tabular Pain/Fatigue
values, a "Recorded doses" treatment line, `Hairline` separation)
verified in Design-F. Labeled "Example"/"Örnek" and never presented as
the user's own data — nothing is recorded yet at this point in the flow.
Not a fabricated dashboard: every element (label, tabular value, unit,
"taken/missed" language) is copied directly from a real, already-shipped
screen's own component and copy conventions.

## 13. Annual-plan behavior

Unchanged from the Phase Q architecture (`Annual = default/primary,
7-day trial if eligible`) — `PlanCard`, `shouldShowTrialCopy`,
`resolveTrialEligibility`, and the whole entitlement/purchase layer were
not touched. Live-verified: trial-eligible mock shows the "7 gün ücretsiz"
badge and a trial CTA/billing line; trial-ineligible mock (`?trial=ineligible`)
correctly drops the badge and switches to a plain, non-trial CTA/billing
line — never promising a trial the store didn't confirm.

## 14. Monthly-plan behavior

Unchanged: always visible, no trial, its own price. Live-verified:
selecting Monthly updates the selected-state styling, the CTA
("Aylık aboneliği başlat"), and the billing line correctly and
immediately.

## 15. Trial eligibility/copy behavior

Untouched `trialEligibility.ts` tri-state logic. Live-verified at all
three practically-testable mock states (`eligible` default, explicit
`?trial=ineligible`) — `unknown` renders identically to `ineligible` by
the same unchanged code path, per that module's own doc comment.

## 16. Restore / Terms / Privacy

Unchanged destinations and logic (`restore()`, Apple's Standard EULA via
`Linking.openURL`, `/paywall-privacy`). Live-verified: reachable and
functional on the normal paywall, **and still visible/reachable on the
offerings-load-error state** (brief §19: "hard paywall does not justify
hiding legitimate controls") — confirmed by screenshot. Restore itself
live-verified end-to-end: clicking it under a mocked successful-restore
state flips entitlement and the route gate redirects to Today.

## 17. Loading/error states

The offerings-load-error branch (`status === "error"` or no offerings)
was not restructured — calm, factual copy ("Plans couldn't load. / Check
your connection and try again."), a Retry button, and the same
Restore/Terms/Privacy row underneath. Live-verified via
`?entitlement=error`.

## 18. Card/template reduction

New `src/design-system/components/OptionRow.tsx` — a boxless, large-text,
hairline-separated selection row (no icon, no border, no card) — replaces
`SelectableCard`'s icon+bordered-card template across Goals, Priority
Symptoms, and Treatment Context (brief §4: "retire repeated onboarding
templates... avoid card-per-option where not needed"). Selected state
pairs bold (700) weight + `brandPrimary` color with an explicit checkmark
— never color alone, the same non-color-only convention every other
selection control in this app already follows. `SelectableCard` itself
is untouched (still used by the dev-only showcase route) — not deleted,
just no longer the onboarding-wide default.

## 19. Copy reduction

Classified per the brief's KEEP/SHORTEN/DELETE audit:

- **DELETE**: `onboarding.welcome.eyebrow`, the entire
  `onboarding.privacy.*` block (3-item reassurance list folded into one
  line), `onboarding.prioritySymptoms.title` (redundant with the shared
  chapter title), the entire `onboarding.addAppointment.*` block, the
  entire `onboarding.personalizedSummary.*` block, `paywall.brand`
  (replaced by the real `Wordmark`).
- **SHORTEN**: Body Regions' supporting line ("Skip this if you'd
  like — it's not a diagnosis, it just personalizes your tracking." →
  "Optional — helps personalize your check-in, not a diagnosis.").
- **KEEP**: Goals/Priority Symptoms/Treatment Context/Reminders/Add
  Medication/Add Injection option labels and titles — already concise,
  already non-judgmental, already tested against the brief's banned-
  phrase list in Phase N/Q.
- **REWRITE**: Welcome's title/supporting (generic "see your days more
  clearly" → the concrete rheumatology-visits thesis); Value Reveal's
  title and all outcome copy (replaced with the new
  `presentValueReveal`-driven set); paywall's headline/subheadline/pillar
  copy (generic "we've set up your tracking exactly the way you want it"
  → concrete utility statements matching the brief's own examples).

## 20. EN/TR decisions

Every new/changed string was authored natively in both languages, not
literally translated — e.g. the two/three-symptom Value Reveal rows use a
"Track: X and Y" / "Birlikte takip et: X ve Y" colon-led construction in
both languages specifically to avoid needing Turkish vowel-harmony
possessive suffixes on an interpolated, unpredictable symptom name
(`%{symptomA}`/`%{symptomB}`) — a grammatically unsafe pattern to
hardcode. EN/TR key parity re-verified after every edit (491 → 493 keys,
identical set both languages) via the existing `i18n.test.ts` suite plus
a manual flatten-and-compare check.

## 21. Accessibility

- `OptionRow` built on `AccessibleTouchable` (44pt floor preserved, no
  override), carries `accessibilityRole="button"` and
  `accessibilityState={{ selected }}`; selected state is never
  color-only (weight + color + checkmark).
- `OnboardingProgress` remains a single `accessible` group with one
  VoiceOver label carrying the real step/total numbers — progress is
  never conveyed by dot color/position alone.
- Long Turkish strings (Welcome's title, Goals' framing question, Value
  Reveal's multi-symptom rows) were live-verified to wrap correctly with
  no clipping at 390×844.
- Plan-selector semantics unchanged (`accessibilityState={{ selected }}`
  plus a full descriptive `accessibilityLabel` including price and, when
  applicable, the trial badge).
- Restore/Terms/Privacy reachability verified in both the normal and
  error paywall states.

## 22. Dark mode

Design-B semantic tokens only — no custom hex values introduced anywhere
in this phase's changes. **Native dark-mode live QA was not performed**,
the same pre-existing constraint recorded in every prior design phase:
`useTheme`'s own doc comment forces light mode on web
(`Platform.OS === "web"`) regardless of host OS theme, so the web preview
cannot exercise it. Token usage was code-reviewed instead (every new/
changed color reference uses `colors.*` tokens, never a literal hex).

## 23. Live QA performed

Chrome web preview, 390×844 and 430×932, Turkish (English not completable
— see below), via a temporary, fully reverted `?qaFreshOnboarding=1`
`store.ts` override (confirmed zero net diff via `git diff --stat` after
reverting) plus the existing `?entitlement=`/`?purchase=`/`?restore=`/
`?trial=` mock query params:

- **A. Fresh Welcome** — merged thesis + privacy screen, correct.
- **B/C. Goals empty / selected** — merged Goals+Symptoms chapter
  renders correctly both empty and with real selections; `OptionRow`
  selected-state grammar confirmed (bold + terracotta + checkmark).
- **D. Symptoms selected** — pain + stiffness selection confirmed
  reaching Value Reveal correctly worded (§10 above).
- **E. Body regions** — unchanged Chip grid, correct progress dot.
- **F. Treatment context** — "both" selected, correct branching.
- **G. Optional treatment setup skipped** — both Add Medication and Add
  Injection's Skip buttons exercised, chained correctly
  (medication → injection → reminders), progress dot held at 5
  throughout.
- **H. Personalized value reveal** — all 3 outcome rows verified
  input-derived, not fabricated (§10).
- **I/J. Annual / Monthly selected** — selection, CTA, and billing line
  all update correctly.
- **K. Annual trial eligible** — default mock, "7 gün ücretsiz" badge +
  trial CTA/billing shown.
- **L. Annual not trial eligible** — `?trial=ineligible` mock, badge
  correctly absent, CTA/billing correctly non-trial.
- **M. Restore path** — `/paywall?restore=entitled` → Restore tapped →
  entitlement flips → route gate redirects to Today. (One methodology
  note: reaching the paywall via the root `/` redirect drops query
  params, since Expo Router's `<Redirect>` does not forward them — not a
  Design-C bug, a pre-existing mock-testing quirk; navigating directly to
  `/paywall?...` avoids it.)
- **N. Loading/error state** — `?entitlement=error` mock: calm copy,
  Retry button, Restore/Terms/Privacy still visible.
- **O. Long Turkish copy** — Welcome/Goals/Value Reveal all confirmed
  wrapping correctly with no clipping.
- **P. Successful entitlement → Today** — full onboarding → paywall →
  purchase → Today path walked end-to-end live, landed correctly on a
  real, rendering Today screen.

No overflow/clipping found at either viewport size. No repeated
icon-card template found anywhere in the rebuilt flow. Restore always
visible. Selected plan always visually obvious. No deceptive close
affordance (unchanged `gestureEnabled: false`, no X/Skip anywhere on the
paywall). Felt flow confirmed at 6 onboarding chapters + the paywall.

**English-locale live QA was not completed** — the same pre-existing
web-preview tooling limitation recorded in Design-E/F (the Language
settings screen has no in-app path back to any other screen, and a
URL-bar navigation resets all in-memory mock state including the
language override). All new/changed English strings were reviewed
directly in `en.json` for correctness, not just Turkish.

## 24. Visual self-critique (brief §25)

1. **Does onboarding still look AI-generated?** No — a concrete,
   specific product thesis replaces the old generic "see your days more
   clearly" framing; no "journey"/"personalized support for you" phrasing
   survives anywhere in the changed copy.
2. **Does every step still use the same repeated template?** No — Welcome
   (Wordmark + text), Goals+Symptoms (two `OptionRow` sections), Body
   Regions (`Chip` grid), Treatment Context (`OptionRow`), treatment setup
   (real forms), Reminders (`ToggleRow`s), Value Reveal (plain outcome
   list) — each screen's composition follows its actual content, not a
   fixed icon-heading-paragraph-card-continue mold.
3. **Is Ilium's product thesis clear on Welcome?** Yes — stated once,
   concretely, in the first sentence a user reads.
4. **Does the user see value before the paywall?** Yes — Value Reveal
   shows 1-3 concrete, input-derived capabilities immediately before the
   paywall, which then echoes the same real context.
5. **Is personalization real?** Yes — proven live end-to-end (§10), and
   backed by 13 passing unit tests on the exact derivation logic.
6. **Does the paywall feel like the same product as Today/Timeline/
   Appointment Summary?** Yes — the preview panel is built from the same
   `MetricLine`/`Hairline`/`QuietSurface` components and "Recorded doses"
   copy convention as the real Appointment Summary screen, not a
   separately-designed subscription-screen aesthetic.
7. **Is it premium without dark patterns?** Yes — no checkmark walls, no
   scarcity/countdown language, no fabricated "most popular," accurate
   trial gating verified at both eligible and ineligible states, Restore/
   Terms/Privacy reachable even in the error state.
8. **Does the flow feel materially shorter?** Yes — 6 felt chapters (was
   11), 3 routes deleted outright, one more merged away, net -299 lines
   despite the new component and presenter.
9. **Hide the logo — does the visual language still feel recognizably
   Ilium?** Yes — the Paper & Ink palette, tabular `MetricLine` numerals,
   boxless `Section`/`ListRow` composition, and restrained dot-progress
   are all the same Design-B foundation used throughout Today/Timeline/
   Appointment Summary; removing the Wordmark would not make these
   screens read as a different, generic app.

All 9 answers came back strong on first review — nothing required a
second refinement pass.

## 25. Safety + trust audit

Grepped every changed line of `en.json`/`tr.json` for
diagnose/diagnosis/flare/severity/worsening/progression/improve/treat/
"treatment works"/"personalized plan"/AI/recommend/risk/prevent/"control
your condition" — the one match ("not a diagnosis" in Body Regions'
supporting copy) is a negation stating what the feature is **not**, the
same established pattern used throughout every prior phase, not a
violation. Grepped the same diff for
limited/"today only"/"best value"/"most popular"/save/free/trial/"cancel
anytime" — zero matches in changed copy (the existing, already-real
trial/cancel-anytime strings were left completely untouched, since they
were not part of this phase's edits).

## 26. Files changed

`app/onboarding/welcome.tsx`, `app/onboarding/goals.tsx` (rewritten —
merges Goals + Priority Symptoms), `app/onboarding/body-regions.tsx`,
`app/onboarding/treatment-context.tsx`, `app/onboarding/add-medication.tsx`,
`app/onboarding/add-injection.tsx`, `app/onboarding/reminders.tsx`,
`app/onboarding/value-reveal.tsx` (rewritten — merges Personalized
Summary + Value Reveal), `app/paywall.tsx`,
`src/design-system/components/OptionRow.tsx` (new),
`src/design-system/index.ts`,
`src/features/onboarding/OnboardingProgress.tsx`,
`src/features/onboarding/personalizationIcons.ts`,
`src/features/onboarding/presentValueReveal.ts` (new) +
`__tests__/presentValueReveal.test.ts` (new, 13 tests),
`src/purchases/usePaywallValuePillars.ts` (cap 4→3),
`src/localization/translations/en.json`/`tr.json`. Deleted:
`app/onboarding/privacy.tsx`, `app/onboarding/priority-symptoms.tsx`,
`app/onboarding/personalized-summary.tsx`, `app/onboarding/add-appointment.tsx`.

## 27. Deferred work

- English-locale live QA (tooling limitation, not a Design-C defect —
  see §23).
- Native dark-mode live QA (tooling limitation — see §22).
- `SelectableCard`'s eventual removal, if Design-G or a later phase
  confirms the dev-only showcase route is its last consumer.
- Any future decision to reconcile Preparation's still-untouched
  adherence-percentage copy with Summary's "Recorded doses" language
  (a pre-existing, separately-flagged Design-F item, out of scope here).
