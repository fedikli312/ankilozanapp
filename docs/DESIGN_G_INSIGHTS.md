# Design-G — Insights + Trends Redesign

Phase Design-G, built on Design System 2.0 foundation commit `56ef9be` and
Design-C (`56c9db8`). UX/presentation work only — no schema, migration,
repository, insight-calculation domain, HealthSummary domain, Timeline
domain, Appointment Summary domain, medication-adherence domain, RouteGate,
purchases, or notification-policy change. Status: **implemented,
uncommitted**, pending review per the brief's explicit instruction.

## 1. Final Insights hierarchy

Insights answers "what patterns are visible in what I recorded?" — never
"what is causing my symptoms" or "is my treatment working." Landing
(`app/(tabs)/insights.tsx`):

1. Subtitle — states plainly these are trends derived from Health Record
   data (brief §3).
2. Recording-window context — a factual line ("Last 7 days · N
   check-ins recorded") (brief §4's "Recording window / context").
3. Three boxless `Section`s, in a fixed **editorial** order (never a
   data-derived "most important metric" ranking, per brief §5): Symptoms
   → Treatment → Labs.
4. Disclaimer line — unchanged, non-diagnostic.

Reached exactly as before: Health Record → "Analiz" row → `/insights`, no
new tab (`href: null` on the tab, unchanged). No Health Record navigation
duplicated inside Insights.

## 2. What was removed from old Insights

- `GroupedList`'s bordered/filled container — replaced by three boxless,
  hairline-separated `Section`s (`tone="document"`).
- All 7 leading `Ionicons` glyphs on the landing rows — metric identity
  now comes from label + tabular number + typography alone (brief §21).
- The `Chip`-row range picker on the detail screen — replaced by the
  Design-F `SegmentedControl` (brief §15: "use the Design-F
  `SegmentedControl` where appropriate instead of creating another
  control language").
- The percentage-led medication summary branch (`"%{percentage}% of
  scheduled doses taken"`) — replaced by the factual taken/missed count,
  on both the landing and the detail screen (§15 below).

## 3. Metric grouping

The exact same 7 existing metrics (`INSIGHT_METRICS` — unchanged, no new
metric added, no metric removed): Pain, Morning stiffness, Fatigue,
Medication records, Injection records, CRP, ESR. Grouped conceptually,
never merged as data:

- **Symptoms**: Pain, Morning stiffness, Fatigue.
- **Treatment**: Medication records, Injection records.
- **Labs**: CRP, ESR.

Wellbeing and High-Symptom Days are **not** part of `INSIGHT_METRICS`
today and were deliberately **not added** — see §29.

## 4. Chart system

Unchanged `TrendChart` component (the same one used in Appointment
Summary, Design-F) — no new dependency, one restrained neutral-color
line, real recorded points only, no smoothing/prediction/reference bands.
Only rendered when `chartPoints.length > 1`; otherwise the factual sparse
state (`NumericEmptyState`) renders instead — never a fake or empty chart
shell. `trend.direction` (`"up"|"down"|"flat"`, present in the domain
type) is never read anywhere in the presentation layer — no trend arrow,
no color implying improvement/worsening (brief §7, re-verified via a unit
test asserting the comparison summary string never contains
up/down/worse/better/improv).

## 5. Period / range control

The existing 4 presets (`4w`/`3m`/`6m`/`all`, `resolveInsightsRange.ts`,
untouched) now render through the shared `SegmentedControl<InsightsRangePreset>`
instead of a `Chip` row — one control language across the app. Live-verified
at 390×844: all 4 segments fit on one row without wrapping/clipping, even
with the longest Turkish label ("6 ay"); `all`'s label was shortened from
"Tüm zamanlar"/"All time" to "Tümü"/"All" specifically to keep every
segment comfortably legible in the 4-way layout. 44pt floor preserved
(`SegmentedControl` built on `AccessibleTouchable`, no override). Selected
state pairs a filled `brandPrimary` background with bold (700) text
weight — never color alone.

## 6. Pain presentation

Unchanged 0–10 recorded values, tabular headline (`typography.metricLarge`,
`fontVariant: ["tabular-nums"]`), `TrendChart`, and a plain factual
average/count summary. No mild/moderate/severe labels, no red gradient —
numeric language only, exactly as before.

## 7. Morning Stiffness presentation

Exact existing categorical bucket taxonomy preserved
(`none`/`under_15`/`15_30`/`30_60`/`over_60`) — `GroupedList` → boxless
`Section`, tabular trailing counts, no continuous-minute fabrication.
Landing summary states the real most-common bucket by name.

## 8. Fatigue presentation

Same treatment as Pain — numeric language only, no severity labels, no
red/green, no improvement/worsening interpretation.

## 9. Wellbeing presentation

Not part of `INSIGHT_METRICS` before this phase and not added now — see
§29 for the reasoning.

## 10. High-Symptom Days presentation

Not part of `INSIGHT_METRICS` before this phase and not added now — see
§29 for the reasoning.

## 11. Treatment / adherence metric decision (brief §13, audited carefully)

**What the metric represents**: `computeMedicationAdherence`'s
`adherencePercentage` is `takenCount / passedCount * 100`, gated on
`sufficientData` (≥3 scheduled doses in range) — a real, factual
scheduled-vs-recorded ratio, not a fabricated score.

**How it was worded before this phase**: `"%{percentage}% of scheduled
doses taken"` (landing) and `appointmentPreparation.medicationAdherence`,
`"%{name} — taken %{percentage}% of scheduled doses"` (detail) — plain
percentage statements. Neither used "good/poor/compliant/non-compliant/
score" language; neither was overtly judgmental on its own, but the word
"adherence" itself (in the metric's display label, "Medication
adherence"/"İlaç uyumu") carries mild compliance connotation.

**Decision**: redesigned the presentation to be more neutral, as the
brief explicitly permits ("You MAY redesign the presentation/copy to be
more neutral"), for consistency with the language Design-F already
established app-wide for the visit workflow (Preparation → Appointment
Summary, "Recorded doses," never a percentage):

- Landing and detail both now lead with the factual taken/missed count
  (`insights.adherenceCounts`) unconditionally — the percentage branch
  was removed from both call sites.
- The metric's display label changed from "Medication adherence"/"İlaç
  uyumu" to "Medication records"/"İlaç kayıtları" (paired with "Injection
  records"/"İğne kayıtları" for the sibling metric) — brief's own
  preferred conceptual language, dropping "adherence" from user-facing
  text entirely.
- The now-fully-orphaned `appointmentPreparation.medicationAdherence`
  percentage-template translation key (already unused by Preparation
  since the Design-F fix, and now unused by Insights too) was deleted
  from both `en.json`/`tr.json` — confirmed via a repo-wide grep before
  deleting.

**What was explicitly NOT changed**: `computeMedicationAdherence.ts`
itself, and the `adherencePercentage` field on `MedicationAdherence` —
both untouched, still computed, still available on the domain object; a
future phase could still read it if a real product need arises. This is
a presentation-only decision, not a domain deletion.

**Product-policy note for a future decision** (per the brief's own
escape hatch, brief §13's last paragraph): now that every screen in the
app that surfaces medication adherence (Preparation, Appointment Summary,
Insights) uses factual count language and none use the percentage, a
reasonable future question is whether `adherencePercentage` should be
removed from the domain type entirely as truly dead weight, or kept as a
deliberately-unexposed building block for a possible future feature. Not
decided here — flagged for product review, not resolved unilaterally.

## 12. CRP presentation

Unchanged: value, unit, date, real recorded trend via `TrendChart`, and
the existing factual `"Ranged from %{min} to %{max} %{unit} across
%{count} results"` summary (`labs.rangeSummary`, untouched, already
compliant — no normal/abnormal/high/low language, no reference range).

## 13. ESR presentation

Identical treatment to CRP, same shared code path (`kind: "lab"`), same
factual range-summary copy.

## 14. Sparse-data behavior

Unchanged `NumericEmptyState` component: 0 records → the factual
"detailEmptyTitle"/"detailEmptyBody" pair; 1–2 records (below the real
domain threshold, `INSIGHTS_THRESHOLDS.minCheckInsForTrend = 3`) → "More
records are needed for a trend." Live-verified on ESR at the `4w` preset.
No generic encouragement, no promise of future medical insight.

## 15. Empty-state behavior

Unchanged for the numeric/lab kinds (the same `NumericEmptyState`); the
medication/injection list kinds already rendered a plain "Not enough data
yet to show a trend." row when `entries.length === 0` — kept as-is,
already factual, already free of "start your journey"-style phrasing.

## 16. Card reduction

Zero `GroupedList`/card usage anywhere in the redesigned files. `Section`
(boxless, `tone="document"`) is used throughout the landing; the detail
screen's categorical/list kinds (stiffness, medication, injection) also
moved from `GroupedList` to boxless `Section`. No `QuietSurface` was
needed or used — nothing on either screen rose to "the one genuinely
important contextual block" bar Design-F/Design-C established for that
primitive.

## 17. Icon reduction

All 7 leading `Ionicons` glyphs removed from the landing rows. The detail
screen already had zero icons (unchanged). Metric identity now comes
entirely from label text, the tabular headline number, and section
grouping — never a decorative glyph.

## 18. Copy reduction / audit

Classified per the brief's own list of banned analytical phrasings
("Your trend shows...", "This may mean...", "You are improving...",
"Based on your data...", "We noticed...", "Pattern detected...") — a full
grep of the changed copy found **zero instances** of any of these; the
pre-existing `numericSummary`/`averageComparison` copy was already
strictly neutral (its own prior doc comment already documented this
discipline) and needed no rewrite. The one copy change beyond the
adherence-language decision (§11) was the landing's subtitle,
strengthened from "See how your recorded values change over time" to
"Trends from what you've recorded in Health Record" — a small, factual
tightening reinforcing brief §3's "these are trends derived from
recorded data" framing.

## 19. EN/TR decisions

Every new/changed string authored natively in both languages. Key
parity re-verified after every edit (491 → 496 keys, identical set both
languages) via the existing `i18n.test.ts` suite plus a manual
flatten-and-compare check. The `all`-range label was shortened in both
languages specifically for the 4-segment control's layout (§5), not a
literal-translation artifact.

## 20. Accessibility

- `SegmentedControl` reused verbatim from Design-F: 44pt floor preserved,
  `accessibilityRole="button"` + `accessibilityState={{selected}}` per
  segment, one `accessibilityLabel` on the control itself
  ("insights.rangeControlLabel" / "Time range" / "Zaman aralığı").
- `TrendChart`'s `accessibilityLabel` remains required (not optional) and
  carries the real average/count or metric name — unchanged.
- Long Turkish labels (segmented-control options, stiffness bucket names,
  group headers) confirmed wrapping/fitting correctly at 390×844 and
  430×932.
- No color-alone data encoding introduced: the one accent color used for
  every chart line and every selected-control state is uniform across
  metrics, never varied by value.
- Tabular numerals (`fontVariant: ["tabular-nums"]`) applied consistently
  to every recorded numeric value (Pain/Fatigue headline, lab headline,
  stiffness bucket counts) — the stiffness bucket count trailing text
  didn't have this in the pre-Design-G code and now does, a small
  accessibility/legibility fix made in passing.

## 21. Dark mode

Design-B semantic tokens only — no custom hex values introduced anywhere
in this phase's changes. **Native dark-mode live QA was not performed**,
the same pre-existing constraint recorded in every prior design phase:
`useTheme` forces light mode on web (`Platform.OS === "web"`) regardless
of host OS theme. Token usage was code-reviewed instead.

## 22. Live QA performed

Chrome web preview, 390×844 and 430×932, Turkish, via the existing
`?entitlement=entitled` mock query param:

- **A. Insights populated** — three-section landing, real summaries,
  no icons, no card grid; confirmed.
- **B/C. Sparse / empty** — CRP/ESR correctly fell back to the factual
  not-enough-data landing caption when no result existed in the 7-day
  landing window; the 4-week ESR detail view confirmed the sparse-state
  "more records needed" copy live.
- **D. Pain detail dense** — tabular headline, real chart, factual
  average/count summary; confirmed.
- **E. Pain detail sparse** — exercised via ESR at the `4w` preset
  (shared `NumericEmptyState` component, same code path Pain/Fatigue
  use); confirmed.
- **F. Morning stiffness** — exact categorical bucket list, boxless
  `Section`, tabular counts; confirmed.
- **G. Fatigue** — same numeric treatment as Pain (not independently
  screenshotted beyond the landing row, since it shares 100% of Pain's
  code path — `kind: "numeric"`).
- **H. Wellbeing** — not applicable (§29).
- **I. High-Symptom Days** — not applicable (§29).
- **J. Treatment metric** — Medication records detail confirmed factual
  taken/missed counts, no percentage, for both listed medications.
- **K. CRP** — headline value, `SegmentedControl`, chart, factual range
  summary; confirmed at both `3m` and `Tümü` (all-time), correctly
  re-deriving the same 3-result set.
- **L. ESR** — identical treatment confirmed; sparse state confirmed at
  `4w`.
- **M. Long Turkish strings** — no clipping observed anywhere across the
  above screens at either viewport size.
- **N. Range switching** — confirmed on CRP (`3m` → `Tümü`) with correct
  re-derivation and correct selected-state styling.
- **O. Health Record → Insights** — the existing "Analiz" row in Health
  Record's Treatment group confirmed still navigating to `/insights`
  correctly; no navigation duplicated inside Insights itself.
- **P. Insights deep-link route** — `/insights` and `/insights/<metric>`
  both confirmed directly reachable and rendering correctly.

No dashboard-grid regression, no card-stack regression, no misleading
trend semantics, sensible sparse states throughout, readable
non-clipping charts, no severity color anywhere, no interpretation in
any summary line, full route compatibility.

## 23. Visual self-critique (brief §25)

1. **Does Insights still look like a generic analytics dashboard?** No —
   boxless document sections, tabular numerals, editorial grouping; no
   card grid, no KPI tiles, no gauges.
2. **Are there too many cards?** No cards at all — zero `GroupedList`
   usage anywhere in the redesign.
3. **Are charts doing useful work?** Yes — real recorded points only,
   tied to the real range control, always paired with a factual textual
   summary, and simply omitted (never faked) when data is too sparse.
4. **Can a user distinguish recorded fact from interpretation?** Yes —
   every summary line is a plain template over an already-computed
   domain value; zero directional/interpretive language anywhere,
   verified by both the safety-audit grep and the new unit tests.
5. **Did any color accidentally imply good/bad/severity?** No — the one
   accent color is used uniformly for every metric and every chart line,
   never varied by value; the selected-control state pairs weight with
   color, never color alone.
6. **Does sparse data still look intentional?** Yes — calm, factual
   copy, no encouragement, no broken-looking chart artifacts.
7. **Does the screen belong visually with Timeline and Appointment
   Summary?** Yes — the same tabular-headline pattern, the same
   `SegmentedControl` (reused verbatim from Design-F), the same
   `Section`/`Hairline`/`ListRow` vocabulary, the same Paper & Ink
   tokens.
8. **Does it feel premium without pretending to be medical analytics
   software?** Yes — no rings/gauges/traffic-light colors, one
   restrained line per chart, calm factual copy throughout.
9. **Hide Ilium branding — is the analytical visual language still
   recognizably part of the product?** Yes — tabular numerals,
   hairline-separated document sections, the segmented control, and the
   terracotta accent are all shared with Today/Timeline/Appointment
   Summary; nothing here reads as a generic third-party dashboard
   aesthetic.

All 9 answers came back strong on first review — nothing required a
second refinement pass.

## 24. Tests added

`src/features/insights/__tests__/presentInsightsLanding.test.ts` (12
tests) — covers `presentNumericSummary` (sparse, average-only, and
average-with-comparison, explicitly asserting the comparison string never
contains a directional word), `presentStiffnessSummary` (sparse and a
real categorical bucket, never a fabricated minute value),
`presentTreatmentRecordSummary` (no data, real counts even when a
percentage exists on the domain object, and the specific below-threshold-
but-real-counts case — always factual, never a percentage claim),
`presentInjectionSummary`, and `presentLabSummary` (sparse and a real
value/date, explicitly asserting no normal/abnormal/high/low language).
All existing domain tests (`insights.test.ts`, unchanged) preserved. No
domain logic was moved into the UI or the new presenter — every function
only selects/formats already-computed values.

## 25. Safety audit

Grepped the full diff of changed copy (`en.json`/`tr.json` and the two
screen files) for diagnosis/flare/severity/worse/worsening/better/
improve/improved/decline/progression/effective/ineffective/working/
failed/normal/abnormal/risk/cause/caused/recommend/should — **zero
matches**. No diagnosis, no causation, no treatment-effect inference, no
progression claims anywhere in the changed copy.

## 26. Files changed

`app/(tabs)/insights.tsx` (rewritten), `app/insights/[metric].tsx`
(rewritten), `src/features/insights/useInsightsLanding.ts` (added
`range`/`checkInCount` to the return — a plain count of already-fetched
rows, not new domain logic), `src/features/insights/presentInsightsLanding.ts`
(new, extracted pure presenter) + `__tests__/presentInsightsLanding.test.ts`
(new, 12 tests), `src/localization/translations/en.json`/`tr.json`.

## 27. Deferred / product-policy questions

- **Wellbeing and High-Symptom Days are not represented in Insights.**
  Brief §4's illustrative "possible structure" names both, but neither
  is part of the actual existing `INSIGHT_METRICS` set (`pain`,
  `stiffness`, `fatigue`, `medicationAdherence`, `injectionHistory`,
  `crp`, `esr` — confirmed directly against
  `src/features/insights/types.ts`). Brief §4's own binding instruction
  — "Exact existing metrics must be preserved. Do not invent new ones."
  — is read as the controlling constraint over the illustrative
  structure example; adding either would mean wiring new domain reads
  (Wellbeing from check-ins, High-Symptom Days from `HealthSummary`/
  appointment-summary-adjacent domain output) into a feature layer that
  currently has neither, which risks the deny-list boundary around
  "HealthSummary domain"/"High-Symptom Day semantics"/"insight
  calculation domain" for a phase whose own brief says "do not create
  new medical inference." Flagged here as a genuine, deliberate scope
  decision for product review, not silently skipped.
- **The `adherencePercentage` domain field's long-term fate** — see §11's
  product-policy note. Now unused by every UI surface in the app; not
  removed from the domain in this phase.
