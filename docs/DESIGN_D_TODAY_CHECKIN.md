# Design-D — Today + Check-in Redesign

Phase Design-D, built on Design System 2.0 foundation commit `56ef9be`.
UX/presentation work only — no schema, migration, repository, health
aggregation, notification, purchase, or RouteGate change. Status:
**implemented, uncommitted**, pending review per the brief's explicit
instruction.

## 1. Final Today hierarchy

Fixed, non-personalized order — the same five buckets on every render,
never a menu of every available module:

1. **Date/context** — one small line (`formatHeadingDate`), no greeting, no
   restated question, no subtitle.
2. **The one dominant check-in state** — a `QuietSurface` prompt + Save CTA
   when incomplete; a card-free typographic summary when complete (§4).
3. **Today's treatment** — due medications and the next injection combined
   into one hairline-separated `Section`.
4. **The next meaningful appointment**, if any — one row, not a rebuilt
   Appointments screen.
5. **At most one subordinate support item** — `TodaySupportiveSlot`.

## 2. What was removed from the old Today

- The `"Hello"` greeting, the `"How are you today?"` restated-question
  header, and the `"Check in with yourself and keep track of your
  treatments."` subtitle — all deleted (`today.greeting`, `.headerTitle`,
  `.headerSubtitle`). The check-in module's own prompt already asks the
  real question; repeating it as a page title was redundant, exactly the
  "generic wellness-dashboard greeting" the brief names.
- The 3-up `MetricCard` row (Pain/Fatigue/Stiffness in bordered boxes) for
  the completed check-in state — replaced by a card-free stacked
  `MetricLine` composition (§4).
- The "Last 7 days" 2-metric-card block (`recentSummaryTitle`,
  `recentAveragePain`, `recentCheckInFrequency`, `recentFrequencyUnit`) —
  cut entirely, not relocated. It was a fourth, non-hierarchy module (a
  metric-card grid, explicitly banned) duplicating the Insights tab's own
  job; see §11 for the full reasoning and what stays intact underneath it.
- The Phase R goal-based reordering of `nextInjection` /
  `upcomingAppointment` / `supportiveSlot` / `recentSummary` against each
  other (`getTodayPriorityOrder`'s `tier2Order`/`promotedSection`, and the
  `"For you"` / `personalization.forYou` cue that rode on it) — Today's
  hierarchy is now fixed (treatment always before appointment always
  before support), so racing these sections against each other no longer
  applies. `getTodayPriorityOrder.ts` itself, `goalMapping.ts`, and their
  existing tests are **untouched** — nothing was deleted, this screen
  simply stopped consuming those two fields. `showSymptomHistoryShortcut`
  and `emphasizeAppointmentPrep` (the two goal-driven text links) are still
  fully applicable and kept, now read directly via `hasGoal(profile, ...)`.
- Separate `GroupedList` titles per treatment type (`"Today"` for due
  meds, `"Next up"` for the next injection) — merged into one `"Treatment"`
  / `"Tedavi"` labeled `Section` (§5).
- The decorative `leaf-outline` icon and filled/bordered box on
  `TodaySupportiveSlot` — now a plain text row.

## 3. Final Check-in interaction

One continuous flow inside a single boxless `Section`: Pain → Morning
stiffness → Fatigue → High-Symptom Day, each a hairline-separated member
with its own vertical padding — not four independently boxed modules. The
"More" disclosure (unchanged copy, `checkIn.addMore`) reveals Wellbeing +
Body Map + Note below, exactly as before content-wise. Save is a single
full-width primary `Button` at the bottom.

## 4. Pain / Fatigue selector behavior

New shared component: `src/features/checkIn/NumericScale.tsx`. Both
`PainScale` and `FatigueSelector` are now thin wrappers around it (same
public props, same stored 0-10 integer semantics, unchanged) — the
previous dot-track and ascending-bar-chart widgets are retired in favor of
one shared interaction:

- A live tabular-numeral readout of the current value above the grid.
- Every integer 0-10 as its own direct tap target, laid out with
  `flexWrap` so the row splits naturally (observed as 7+4 at 390pt in live
  QA) rather than eleven cramped cells on one line or a hardcoded split.
- Unselected cells: 44×44pt, outlined, transparent fill. Selected cell:
  50×50pt, filled `brandPrimary`, bold `accentForeground` text — a real
  size/shape change on top of the color change, not color-only.
- No drag — every value is a direct tap.
- Exposed as one `accessibilityRole="adjustable"` element with
  increment/decrement actions (individual cells hidden from the
  accessibility tree), the same pattern already established by
  `StepperField` — reused, not reinvented.
- No severity color spectrum — a single brand color at every value, for
  both Pain and Fatigue.

## 5. Morning Stiffness selector behavior

`StiffnessSelector.tsx` keeps its exact 5-bucket categorical enum and its
individually-accessible-button model (not the numeric family's single
"adjustable" element — a deliberate difference, since VoiceOver users
navigating five named categories is more direct than adjusting a slider
through unclear category labels). Visually it now joins the same cell
language as Pain/Fatigue (rounded cell, filled `brandPrimary` + bold text
when selected, hairline border otherwise) — the previous per-cell
`Ionicons` clock glyph and ordinal fill-bar are retired (no decorative
icon, no risk of reading as a severity gauge). Cells wrap and allow
two-line labels for the longer Turkish bucket names.

## 6. Fatigue selector behavior

Identical treatment to Pain (§4) — same `NumericScale`, same 0-10
semantics, no separate visual language. This is a deliberate reversal of
the earlier Product 2.0 instruction that Fatigue must look different from
Pain; Design-D's brief explicitly asks for the opposite ("Pain / Stiffness
/ Fatigue must feel like members of ONE interaction family... do not
visually redesign each metric independently").

## 7. High-Symptom Day behavior

Unchanged semantics and copy (`checkIn.highSymptomDay.label`/
`.description`), still the same native `ToggleRow`/`Switch`, still always
visible in the primary sequence (now the 4th member of the same `Section`,
never behind "More"). Completed-state presentation on Today: a single
factual line, `"High-symptom day recorded"`/`"Yoğun belirti günü
kaydedildi"`, rendered in `brandPrimary` (the same restrained accent used
for links elsewhere on the page) — never red, never an alert/banner
treatment, never shown unless the user explicitly set it. Live-verified
true→false and false→true edits (see §12).

## 8. Optional-fields behavior

Unchanged: Wellbeing (Chip row), Body Map, and Note stay behind the single
`"More"`/`"Daha fazlası"` disclosure, auto-expanding under the same
`personalization.autoExpandMore` rule as before (untouched). Content and
persistence are byte-identical to pre-Design-D; only the surrounding
container styling (spacing, token names) was lightly touched.

## 9. Body Map status

**Not redesigned**, per the brief's explicit carve-out (§17). Its own
container (a bordered/filled card around the silhouette) is a genuine,
acknowledged exception to "near-total absence of bordered containers" —
deferred to Design-E/I. It already renders with Paper & Ink colors
correctly (its `colors.surface`/`colors.borderHairline`/`colors.accent`
references resolve through Design-B's legacy aliases to the real palette
values), so no visual mismatch, just an un-modernized container shape.
`BodyRegionMap.tsx` was not modified.

## 10. Save/edit behavior

Unchanged persistence path (`useCheckIn`, `checkInDraft.ts`,
`resolveDefaultHighSymptomDay.ts` — none touched). Live-verified this
phase (web preview, `?entitlement=entitled`):
- A fresh entry saves and Today immediately reflects the completed state.
- Re-opening today's entry ("Kaydı görüntüle"/"View entry") loads the
  exact saved Pain/Stiffness/Fatigue/High-Symptom-Day values.
- Editing High-Symptom Day true→false and saving updates the same row
  (upsert, not a duplicate) — Today's marker line correctly disappears.
- "Mark taken" on a due medication updates in place (checkmark + label),
  no page reload needed.

## 11. Today completed-state behavior

`src/features/today/presentTodayCheckIn.ts` (new, pure) resolves Today's
check-in module to exactly one of two states — `"incomplete"` (carrying
yesterday's pain for the context line, or `null`) or `"complete"`
(carrying pain/fatigue/stiffness bucket/high-symptom flag verbatim). The
screen renders the complete state as: a `"TODAY"`/`"BUGÜN"` eyebrow, three
stacked `MetricLine`s (Pain, Fatigue, Morning stiffness — no card, no
grid, tabular numerals), the high-symptom marker line only when true, then
the edit link. This is a literal match to the brief's own worked example
in §4.

## 12. Today treatment presentation

One `Section` titled `"Treatment"`/`"Tedavi"`, combining: every due-today
medication administration (label/dose+time/status-or-action row, a small
`DOMAIN_ICONS.medication` leading icon) — or, when none are due, the next
scheduled medication as an informational row — followed by the next
pending injection (`DOMAIN_ICONS.injection` icon, due-date caption). No
per-medication card, no decorative icon circle; hairline-separated rows
inside one section, exactly the brief's "label / row / status / action"
spec.

## 13. Today appointment presentation

Unchanged data (`useTodayData`'s existing 14-day-window
`upcomingAppointment`, already scoped to exactly one) — presentation moved
from a `GroupedList` to a `Section` (boxless) containing one `ListRow`
(date block, doctor/institution, type+time, chevron) plus the existing
`"Prepare for this appointment"` link when the appointment-prep
personalization goal applies. No re-creation of the Appointments screen.

## 14. Secondary-support behavior

`TodaySupportiveSlot` — still exactly one candidate (Breathing or one
Knowledge article, chosen by the existing deterministic
`getKnowledgeRecommendation` logic, untouched). Rendering changed from a
filled/bordered row with a decorative icon to a plain two-line text row
(eyebrow + title), matching §22/§23's card/icon reduction rules. Always
the last item, never competing visually with treatment/appointment above
it.

## 15. Card/container reduction

Removed from Today entirely: `MetricCard` (3-up grid and the 7-day
2-card row), `GroupedList` (3 separate boxed sections). Today now uses
exactly one filled surface on the whole screen — `QuietSurface`, only in
the incomplete-check-in state — plus two boxless `Section`s (Treatment,
Appointment) and one plain text row (support). Check-in uses zero boxed
containers for its primary sequence (one `Section`); the Body Map's own
card is the one acknowledged, out-of-scope exception (§9).

## 16. Icon reduction

Retired: `leaf-outline` (TodaySupportiveSlot), the per-bucket
`time-outline`/`checkmark-circle-outline` clock glyphs and per-metric
priority-indicator decoration (StiffnessSelector). Kept, as functional
recognition aids only: `DOMAIN_ICONS.medication`/`.injection` on treatment
rows (now genuinely useful since medications and injections share one
list), the existing `checkmark-circle` status icon on a taken dose, and
the unchanged `DateBlock`/chevron affordances.

## 17. Copy-reduction summary

**Deleted** (removed from both `en.json`/`tr.json`, key parity
maintained): `today.greeting`, `.headerTitle`, `.headerSubtitle`,
`.dueToday`, `.nextMedication`, `.nextInjection`, `.recentSummaryTitle`,
`.recentAveragePain`, `.recentCheckInFrequency`, `.recentFrequencyUnit` —
10 keys.

**Shortened** (same key, new value): `today.checkInSectionTitle` —
`"Daily check-in"`/`"Günlük kontrol"` → `"Today"`/`"Bugün"`, now doing
double duty as the eyebrow for both the incomplete and complete states,
literally matching the brief's own `"TODAY"` example.

**Added**: `today.treatmentTitle` — `"Treatment"`/`"Tedavi"`.

**Kept unchanged** (already short/functional, not decorative):
`emptyPrompt`, `emptyAction`, `checkInPrompt`, `checkInYesterdayContext`,
`checkInCta`, `highSymptomDayCta`, `highSymptomDayRecorded`, `metricPain`,
`metricFatigue` (also reused by Appointment Summary/Prepare — out of
scope, left alone), `viewOrEditCheckIn`, `viewSymptomHistory`,
`markTakenShort`, `injectionDaysLeft`/`.DueToday`, `upcomingAppointment`,
`prepareAppointment`, every `emptyAction*` key, `supportiveTitle`/
`.Breathing`/`.Knowledge`, and every `checkIn.*` field-level string (pain/
fatigue/stiffness/wellbeing/body-area/note copy) — none of these were
flagged by the brief's banned-phrase list and changing established,
already-tested field copy without a clear directive risked meaning drift
for no benefit.

No instance of `"For you"`, `"Based on your journey"`, `"Personalized
insight"`, or similar was introduced; the one existing occurrence
(`personalization.forYou`) is simply no longer rendered on this screen
(its key is untouched — still used by Track/Health Record, out of scope).

## 18. EN/TR decisions

Full key parity maintained throughout (28 keys in `today.*` before and
after; verified via the existing `i18n.test.ts` parity test, which still
passes). Turkish stiffness-bucket labels (`"15 dakikadan az"`, `"60
dakikadan fazla"`) were the driving constraint for `StiffnessSelector`'s
cell sizing (`minWidth: 64`, 2-line wrap) — verified live in the browser
at both viewport widths, no truncation or overflow observed. No new
placeholder/mechanically-translated string was introduced; every new/
changed value (`treatmentTitle`, the shortened `checkInSectionTitle`) was
written natively in both languages, not machine-translated from one.

## 19. Accessibility decisions

- 44pt minimum touch targets: `NumericScale`'s unselected cells are
  exactly 44×44pt (selected cells grow to 50pt); `StiffnessSelector`'s
  cells are `minWidth: 64, minHeight: 48`; `AccessibleTouchable`'s
  existing 44pt floor is unchanged everywhere else.
- No drag gesture anywhere in the redesigned controls — every value is a
  direct tap, deliberately safe for reduced hand precision/grip.
- Non-color-only selection: every selector pairs its fill-color change
  with a real shape/weight/size change (cell grows + bold text for
  numerals; bold text + fill for stiffness buckets) — never color alone.
- VoiceOver: `NumericScale` keeps the established single-`adjustable`-
  element pattern with `accessibilityValue`/increment/decrement actions;
  `StiffnessSelector` keeps five individually-labeled
  `accessibilityRole="button"` elements with `accessibilityState.selected`
  — the more correct model for a named-category picker.
- Dynamic Type: no `allowFontScaling={false}` introduced; stiffness cells
  wrap to two lines rather than clip.
- One-handed Save reach: unchanged bottom-of-form placement, full-width
  primary button.
- Keyboard behavior for Note: unchanged (`TextField`, untouched).
- No clipped controls observed in live QA at either tested width.

## 20. QA scenarios tested

Web dev preview (`?entitlement=entitled`), 390×844 and 430×932 (the web
preview shell caps content width at 430pt regardless of window size, so
both resize checks render the same content width — no divergence
observed), Turkish (default) and English (via Profile → Language, an
in-app setting, not a temporary override — nothing to revert):

- **A. Today, no check-in** — verified (QuietSurface prompt, treatment,
  appointment, support all render correctly).
- **B/C. Today, completed check-in, with and without High-Symptom Day** —
  verified end-to-end via a real save through the redesigned Check-in
  form; the marker line correctly appears/disappears on toggle.
- **D. Today, treatment due** — verified ("Mark taken" interaction
  confirmed working, status updates in place).
- **E. Today, upcoming appointment** — verified (present in every
  scenario screenshot; date block, doctor/institution, chevron navigation
  target correct).
- **F. Check-in, new/blank** — verified.
- **H. Check-in, edit existing** — verified (values load correctly,
  true→false High-Symptom Day edit persists).
- **I. Check-in, optional fields expanded** — verified (Wellbeing, Body
  Map, Note all render and remain functional).
- **J. Long Turkish labels** — verified (stiffness buckets wrap cleanly,
  no clipping).
- **English locale equivalents of A/F** — verified.

**G. Check-in, explicit High-Symptom Day entry (`?highSymptomDay=1`)** —
**not independently re-verified visually this pass.** The precedence
logic itself (`resolveDefaultHighSymptomDay`) is untouched and has its own
passing unit tests proving the seed-true behavior; only the toggle's
*visual* container changed (still the same `ToggleRow`). Not re-screenshot
because the web mock's in-memory store only holds one check-in per day and
today's entry was already saved during scenario B/C/H testing, leaving no
clean "fresh entry" state to re-trigger the explicit path without a full
page reload (which resets the whole mock store, including the language
setting and every other in-progress QA state). Low risk given the
component itself (`ToggleRow`) and the precedence function are both
unmodified, but flagged here rather than silently claimed as verified.

No temporary dev-only query-param overrides were added for this QA pass —
`?entitlement=entitled` is the existing, documented, pre-existing web-mock
flag (`src/purchases/purchaseClient.web.ts`), not something introduced or
requiring reversion.

## 21. Visual self-critique

1. **Does Today still look like a dashboard?** No. One `QuietSurface`
   highlight (the only filled/colored area on the screen), two boxless
   hairline-structured `Section`s, one plain support row — reads as one
   continuous page, not a tile grid.
2. **Is the first action obvious within one second?** Yes — the
   `QuietSurface` block is the only colored region on the incomplete-state
   screen, containing a bold prompt directly above a large filled primary
   button; nothing else on the page competes with it.
3. **Did we actually remove the card-stack feeling?** Mostly. `GroupedList`
   and `MetricCard` are gone from Today entirely. The one honest exception
   is the Body Map's own card inside Check-in's optional section — an
   explicit, brief-approved carve-out (§9), not an oversight.
4. **Does Check-in have a recognizable interaction language?** Yes —
   confirmed in live screenshots: Pain, Stiffness, and Fatigue all use the
   same rounded-cell, fill+bold selected-state grammar, visually reading
   as one control family rather than three unrelated widgets.
5. **Does it still look like a default Expo/React Native form?** No bare
   unstyled controls remain in the primary sequence — the numeral/bucket
   selectors are fully custom. The native `Switch` (High-Symptom Day) and
   native multiline `TextInput` (Note) are the only stock RN primitives
   left, both already styled by Design-B's `ToggleRow`/`TextField`, not
   naked defaults.
6. **Is there enough visual character without decorative noise?** This is
   the weakest of the seven answers, honestly: with icons and boxes
   deliberately stripped out, Check-in in particular now leans on
   typography/spacing/the numeral-cell language alone for character. That
   reads as calm and premium rather than sparse in the live screenshots,
   but the brief's own third visual signature (a continuous Timeline rail
   with shape-based event taxonomy) — the signature most likely to add
   distinctive character beyond "Ilium's tokens applied cleanly" — is
   explicitly reserved for Design-E and could not be used here. Today/
   Check-in's distinctiveness at this phase rests entirely on the numeral
   treatment and restraint itself, not yet a second, more ownable device.
7. **Does removing the logo still leave a recognizable Ilium design
   language?** Yes — neither screen displays `MarginMark`/`Wordmark`
   anywhere (correct per §24), and the oversized tabular numerals +
   hairline structure + Paper & Ink selection language are distinctive
   enough on their own in the live screenshots to read as a considered,
   specific system rather than generic Expo defaults.

No answer triggered a rework — #6 is flagged as a real, honest limitation
rather than resolved, but it stems from an explicit phase boundary (the
Timeline signature reserved for Design-E), not a shortcut taken here.

## 22. Divergence from Design-A2

None in substance. `docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §6/§7's Today
and Check-in screen-level concepts (oversized numerals, minimal chrome,
one dominant action) are what this phase implements; no new visual
direction, palette, or navigation decision was made or revisited here —
those remain Design-B's, unchanged.
