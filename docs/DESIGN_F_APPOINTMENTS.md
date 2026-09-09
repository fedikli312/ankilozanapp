# Design-F — Appointments + Visit Preparation + Appointment Summary

Phase Design-F, built on Design System 2.0 foundation commit `56ef9be`,
Design-D (`5e1b5a2`), and Design-E (`2ee3aaf`). UX/presentation work only —
no schema, migration, repository, Appointment Summary domain derivation,
HealthSummary domain, `DoctorReportRangeDays` semantics, "Recorded doses"
semantics, Timeline derivation, High-Symptom Day semantics, notification
scheduling, RevenueCat, RouteGate, or `package.json`/`package-lock.json`
change. Status: **implemented, uncommitted**, pending review per the
brief's explicit instruction.

## 1. Core thesis and the Before/Visit/After-Record model

Ilium records what happens between rheumatology visits and helps the user
prepare for the next one. Appointments is no longer a calendar
utility/CRUD list — it's conceptually **Before (Prepare) → Visit
(appointment context) → After-Record (Summary)**, expressed through
consistent visual language across three existing screens
(`app/(tabs)/appointments.tsx`, `app/appointments/[id]/prepare.tsx`,
`app/appointments/[id]/summary.tsx`), never through literal relabeling or
new routes. Every one of the three now opens with the same
`DateBlock` + doctor/institution-name + type/time identity block, so
moving between them reads as one continuous visit, not three unrelated
screens.

## 2. Appointments tab hierarchy

Fixed order (`app/(tabs)/appointments.tsx`):

1. The **next upcoming appointment** dominates — open composition
   (`DateBlock emphasis="strong"` + title-weight name + a context line),
   no surrounding box, no equal-weight card treatment.
2. A conditional **Prepare** `Button`, directly under it, only for
   `type === "rheumatology"` (Preparation's content is
   rheumatology-specific by domain design — unchanged from Phase Z/X).
3. Any **additional upcoming appointments** render as compact `ListRow`s
   after a `Hairline` — deliberately subordinate, never matching the
   primary appointment's visual weight.
4. **Past appointments** read as a boxless document history
   (`Section` + `ListRow`, `DateBlock` as `leading`) — related to, but
   visually distinct from, the Timeline rail (no shape-marker taxonomy
   reused here).
5. A secondary **Add appointment** `Button` at the bottom.

## 3. The "no upcoming appointments" empty state

When `upcoming.length === 0` but `past.length > 0`, a calm, factual line
(`appointments.noUpcoming`, "No upcoming appointments.") replaces the
dominant card — never "Your journey...", "Stay on top...", or "You're all
caught up!" phrasing. Live-verified via a temporary, fully reverted
`?qaNoUpcoming=1` store override (see §15).

## 4. Appointment Detail

`app/appointments/[id]/index.tsx`: the "Details" `GroupedList` became a
boxless `Section` (same `ListRow` children, unchanged fields); the
"Settings" `GroupedList` — which held exactly one action, "Edit" — became
a single `InlineAction`, since one action never needed its own boxed
section. `Cancel` (`variant="destructive"`) follows directly with no box.
No field/field/field/button/button CRUD composition remains.

## 5. Preparation — the personal visit note

`app/appointments/[id]/prepare.tsx` gained the same identity header as
the other two screens, and its Symptoms/Treatments/Labs `GroupedList`s
became boxless `Section`s. Two considered, deliberate decisions:

- **No new note-editing/persistence capability was added**, despite the
  brief's "clear text-entry areas, strong Save/continue action" language.
  Brief §9 explicitly says "preserve all existing preparation
  functionality and persistence" and frames Design-F as primarily IA +
  presentation — "strong continue action" was read as the strong primary
  `Button` now at the bottom, linking into Appointment Summary, not as an
  instruction to add a new writable notes field. A quieter `InlineAction`
  near the top gives the same destination for anyone who wants to skip
  straight there.
- **Preparation's per-medication adherence-percentage copy
  (`appointmentPreparation.medicationAdherence`, "taken X% of scheduled
  doses") was deliberately left untouched**, even though it uses
  percentage language Summary's "Recorded doses" section avoids. Brief
  §18's "Recorded doses, never adherence/compliance/percentage"
  instruction is scoped to Summary; changing Preparation's own computed
  copy would be a feature-layer change beyond presentation. This is a
  **known, acknowledged inconsistency** between the two screens, not an
  oversight — flagged here for a future phase to reconcile if desired.

## 6. Appointment Summary — the document

`app/appointments/[id]/summary.tsx` is the phase's largest change. Same
identity header as Detail/Preparation; the `Chip`-row 30/90 picker became
the new `SegmentedControl` (§7); every remaining `GroupedList`
(Symptoms/High-Symptom Days/Treatment/Labs) became a `tone="document"`
`Section` — a quieter, tighter-spaced register (`Section`'s own existing
option, previously unused) meant to read as one continuous report rather
than a screen's worth of everyday sections. Pain/Fatigue render through
`MetricLine` (tabular numerals, label, optional unit, short context) —
Design System 2.0's default health-metric presentation — replacing plain
sentence text. "View timeline" restyled from the legacy `colors.accent`
to `colors.brandPrimary` (`InlineAction`'s default "brand" tone) and
re-verified live to still navigate to `/timeline` (§13).

## 7. The 30/90-day control

A new, generic, reusable `SegmentedControl<T extends string>`
(`src/design-system/components/SegmentedControl.tsx`) replaces the
`Chip`-row picker — the Design-B primitive the brief explicitly invited
this phase to build: one continuous bordered track, segments edge-to-edge
with `flex: 1` (no individual chip outlines — "not pill soup"), selected
segment gets both a filled `brandPrimary` background *and* bold (700)
text weight vs. unselected's regular (400) weight, so the selected state
is never color-only. Built on `AccessibleTouchable` without overriding
its 44pt-floor `minHeight`/`minWidth`. Since the control is generic over
`string` (kept that way deliberately — it's a reusable primitive, not
appointment-specific) but `DoctorReportRangeDays` is `30 | 90`, the
screen converts at the UI boundary only (`String(rangeDays)` in,
`Number(value) as DoctorReportRangeDays` out) — `rangeDays`'s type stays
exactly `DoctorReportRangeDays` everywhere else, and switching ranges
live-reverifies real re-derivation (coverage, averages, labs, chart, and
Things to Review all recompute — verified live, §13).

## 8. Symptoms

Ilium's numeric/tabular language: `MetricLine` for Pain/Fatigue
(`value` = the average formatted to one decimal, `context` = the
existing `sampleCount` sentence), `ListRow` for Stiffness/Body-area
bucket breakdowns. No `MetricCard` grid, no severity colors, no inferred
better/worse/improved/declined language anywhere in the presenter or the
screen. `presentAppointmentSummary.ts`'s existing `sufficientData` gating
is unchanged — "recorded, but not enough entries yet for an average" still
renders instead of a misleading placeholder average.

## 9. High-Symptom Days

Unchanged semantics: a plain factual count + up to 5 dates, in a
`tone="document"` `Section`. Never called "flare"/"bad"/"severe days,"
never a red warning treatment — same restrained styling as every other
row on the screen.

## 10. Treatments

"Recorded doses" terminology preserved exactly
(`appointmentSummary.medicationDoses`, "%{taken} taken, %{missed}
missed") — never adherence/compliance/percentage, per the presenter's own
existing doc comment explaining why (the administration-generation
schedule is forward-only, so a percentage would carry a false
denominator claim). Not touched beyond the `GroupedList` → `Section`
conversion.

## 11. Labs and the one chart

Tabular values/units/dates via `ListRow`, unchanged
`presentLabs`/`LabLine` shape. The one allowed chart (brief §20) is
implemented as `presentAppointmentSummary.ts`'s new `presentLabChart`,
gated strictly on the existing, already-approved
`LabHistory.sufficientData` flag (`INSIGHTS_THRESHOLDS.minLabValuesForTrend`)
— not a new threshold invented for this screen. It picks the first
qualifying marker in `labs.markers`' own existing order; if both CRP and
ESR qualify, only the first is charted (unit-tested explicitly). Rendered
via the pre-existing, unmodified `TrendChart` component, which already
satisfied every brief §20 requirement verbatim: no dependency, a single
restrained line (`colors.dataPrimary`, never a severity/status color), a
required `accessibilityLabel`, no reference-range band, no smoothing,
real recorded points only. It is composed as a direct child of the Labs
`Section` (after the lab `ListRow`s) rather than a separate `View` after
the section, so it inherits the same automatic hairline-before-each-row
separation every other row gets — no manual spacing adjustment needed.
With this session's seed data, the chart is correctly absent at 30 days
(fewer than the threshold's minimum CRP/ESR points in range) and
correctly present at 90 days (live-verified, §13) — confirming the gate
is data-driven, not hardcoded to always/never show.

## 12. Things to Review

Unchanged `buildThingsToReview` logic (deterministic, capped at 4,
hidden when empty). Given real visual prominence via the phase's one
deliberate `QuietSurface` use on this screen — the brief's own named
exception for "a genuine emphasis moment that helps the actual
conversation." Still never recommendations, never AI-generated, never
implying what the doctor should do — every line is a template over an
already-computed count/date/region field.

## 13. Live QA performed

Chrome web preview, 390×844 and 430×932, Turkish locale (see §14 for the
English-locale limitation), `?entitlement=entitled`:

- Appointments tab: dominant upcoming appointment, Prepare button,
  compact past history with hairlines — all correct.
- "No upcoming appointments" empty state via a temporary, fully reverted
  `?qaNoUpcoming=1` `store.ts` override (confirmed zero net diff via
  `git diff --stat` after reverting) — calm copy, secondary Add button.
- Appointment Detail (past, non-rheumatology): quiet `DateBlock`, boxless
  Section, no Prepare/Edit/Cancel controls shown (correct for a completed
  appointment) — no bug found.
- Preparation: identity header, range pill, quick-access link, all three
  data sections, Notes, and the bottom strong "Appointment Summary"
  button — all correct after the hairline fix (§16).
- Appointment Summary: identity header; `SegmentedControl` 30/90 with
  correct selected-state styling and real re-derivation on switch (date
  range, coverage line, symptom averages, lab values, chart presence, and
  Things to Review all changed correctly between 30 and 90 days); Symptoms
  section with tabular Pain/Fatigue via `MetricLine`; High-Symptom Days;
  Treatments; Labs with the CRP trend chart appearing only at 90 days (not
  30, matching this seed data's actual point count); Things to Review in
  a `QuietSurface`; "View timeline" (now `brandPrimary`) confirmed to
  navigate to a correctly-rendering `/timeline`.
- Both viewport sizes: no overflow/clipping observed on Summary (the
  screen with the most content).

## 14. Localization

Turkish read naturally throughout everything reachable in this pass (see
above). **English-locale live verification was not completable in this
session**, for the same reason already recorded in the Design-E doc and
`PROJECT_MEMORY.md`: the app's Language settings screen has no in-app
navigation path back to any other screen in the web preview, and a
URL-bar navigation triggers a full reload that resets in-memory state
(including the language override) via `buildInitialStore()` — this is a
pre-existing web-preview-only limitation, not a Design-F regression. All
new/changed English strings were reviewed for correctness in `en.json`
directly (not just Turkish), and EN/TR key-parity was re-verified via the
same flatten-and-compare check used in Design-D/E after every edit.

## 15. Accessibility

- `SegmentedControl` built on `AccessibleTouchable` without overriding
  its 44pt-floor `minHeight`/`minWidth`; carries
  `accessibilityRole="button"` and `accessibilityState={{ selected }}`
  per segment, plus a screen-level `accessibilityLabel`
  ("Recording window" / "Kayıt penceresi") on the control itself.
- `TrendChart`'s `accessibilityLabel` is required (not optional) and is
  built from the new `appointmentSummary.labChartAccessibilityLabel` key
  with the real marker name and point count — a genuine text-equivalent,
  not a generic "chart" label.
- No color-alone meaning was introduced: the segmented control's selected
  state pairs a fill change with a font-weight change; the chart uses one
  neutral data color, never a severity color.
- All rows remain `ListRow`'s existing 44pt-minimum native list pattern;
  no new custom touch targets were added below that floor.

## 16. A real bug found and fixed during live QA

Live QA on Appointment Summary surfaced a genuine defect: the Symptoms
and Treatment `Section`s wrapped their multiple conditional rows in a
`<>...</>` fragment inside a ternary. `Section` inserts a hairline
between **direct** JSX children via `React.Children.toArray(children)`,
which treats a fragment as a single opaque child — so all of Pain,
Fatigue, Stiffness, and Body-area rows (and, separately, all medication
and injection rows) rendered with **no hairlines between them**,
contradicting the phase's own "hairline-separated rows" design language.
The same anti-pattern, introduced in this same phase's rewrite of
`prepare.tsx`, also silently swallowed hairlines between multiple
medication/injection rows and between the CRP/ESR lab rows there.

Fixed in both files by passing each possible row as its own direct child
expression of `Section` (`{cond ? <Row /> : null}` siblings, or a bare
`{list.map(...)}` — both of which `Children.toArray` correctly flattens)
instead of ever wrapping multiple rows in one shared fragment. Re-verified
live after the fix (§13) and confirmed correct. This is the one specific,
concrete UI bug this phase's self-critique (§17) was written to surface
rather than gloss over.

## 17. Visual self-critique (brief §33)

1. **Does Appointment Summary feel like a document, not a dashboard?**
   Yes — no cards, no metric grids, no colored status chips; tabular
   values, hairlines, and section labels throughout, consistent with
   Timeline's "document rhythm" without copying its rail.
2. **Is the 30/90 control legible as one control, not two buttons?**
   Yes — single bordered track, no gap between segments, selected state
   uses fill + weight together.
3. **Does the lab chart look "restrained," not "analytics-SaaS"?** Yes —
   one thin line, one neutral color, no axis grid, no shaded band, no
   legend.
4. **Would a card-reduction audit find anything left to flatten?** No new
   `GroupedList`/card patterns were introduced by this phase; `QuietSurface`
   is used exactly once (Things to Review), matching its own
   single-use-per-screen documented rule.
5. **Does the Before/Visit/After-Record model come through without new
   labels?** Yes, via the shared identity-header language across all
   three screens — no screen literally says "Before" or "After."
6. **Is there any place High-Symptom Days or Treatments reads as a
   judgment rather than a fact?** No — reviewed copy is count/date
   language only; no severity or improvement claims.
7. **Any icon used decoratively rather than functionally?** No new icons
   were added in this phase; the only visual affordances are the existing
   chevron (navigational) and the segmented control's own text.
8. **Does Preparation's untouched adherence-percentage copy read as an
   inconsistency a reviewer would immediately notice next to Summary's
   "Recorded doses"?** Yes, honestly — flagged explicitly in §5 rather
   than hidden, since fixing it would require a feature-layer change
   outside this phase's presentation-only scope.
9. **Was anything shipped without being visually verified?** The 30-day
   Sedimentasyon/CRP display point count for this session's exact seed
   data was verified together with the chart's presence/absence at both
   ranges (§13) — the one Design-F visual claim (§11's "at most one
   chart") that most needed live proof, not just a passing unit test.

## 18. Deferred: share/export

No share/export implementation, placeholder button, or "coming soon"
affordance was added anywhere in this phase, per the brief's explicit
instruction.

## 19. Files changed

`app/(tabs)/appointments.tsx`, `app/appointments/[id]/index.tsx`,
`app/appointments/[id]/prepare.tsx`, `app/appointments/[id]/summary.tsx`,
`src/design-system/components/SegmentedControl.tsx` (new),
`src/design-system/index.ts`,
`src/features/appointmentSummary/presentAppointmentSummary.ts` (added
`labChart` and `MetricLine.value`),
`src/features/appointmentSummary/__tests__/presentAppointmentSummary.test.ts`
(4 new lab-chart tests + 2 existing tests updated for the new `value`
field), `src/localization/translations/en.json` /
`tr.json`. `src/repositories/web/store.ts` was temporarily modified for
one QA scenario and fully reverted (confirmed via `git diff --stat`,
zero output).

## 20. Validation

`npx tsc --noEmit` clean. `npm run lint` clean. `npm test -- --runInBand`
— 55/55 suites, 327/327 tests. `npx expo install --check` — only the
known pre-existing Phase L dependency drift, no new drift. Deny-list
`git diff --stat` against schema/migrations/repositories/HealthSummary
domain/Timeline domain/purchases/RouteGate/`package.json`/
`package-lock.json` — zero output. Safety-audit grep across all changed
copy (diagnosis/flare/severity/worsening/progression/improved/declined/
normal/abnormal/effective/ineffective/adherence/compliance/recommend/
should/risk/caused-by) — zero matches in translation files; the two
matches in code comments are negations describing what the code
deliberately avoids, not violations.
