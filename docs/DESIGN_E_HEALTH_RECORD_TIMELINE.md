# Design-E — Health Record + Timeline Redesign

Phase Design-E, built on Design System 2.0 foundation commit `56ef9be` and
Design-D (`5e1b5a2`). UX/presentation work only — no schema, migration,
repository, Timeline-derivation, HealthSummary, purchases, or RouteGate
change. Status: **implemented, uncommitted**, pending review per the
brief's explicit instruction.

## 1. Final Health Record hierarchy

Fixed order on the landing screen (`app/(tabs)/track.tsx`):

1. **Heading/context** — one small subtitle line, no duplicate in-content
   title (the tab's native header already renders "Health Record").
2. **Timeline anchor** — a compact "Recent history" preview (up to 3
   events, the same rail/marker language the full Timeline uses) plus a
   "View full timeline" link.
3+4. **Recording categories + Trends**, one continuous list — Symptoms,
   Treatment (Medications + Injections, visually grouped under one inline
   label), Labs, Trends — never six feature cards, matching the brief's
   own worked example structure exactly.
5. **Supporting record utilities** — Nutrition and Breathing, clearly
   subordinate, last. Knowledge is not here (§16 below).

## 2. What was removed from old Track

- The `GroupedList`-boxed "Health tracking" section — replaced by one
  boxless `Section` (Symptoms/Treatment/Labs/Trends together).
- The Timeline `ListRow` (a single line, "My AS Timeline · Your recorded
  history over time") — replaced by the compact rail preview, which is a
  materially richer anchor than a single navigation row.
- The Knowledge row and its `track.knowledge`/`track.knowledgeCaption`
  translation keys — deleted (see §16).
- `track.healthGroupTitle` — no longer needed; the record-categories list
  has no header now, directly continuing from the Timeline preview above
  it (matching the brief's own example, which shows no header between
  "View full timeline" and "Symptoms").

## 3. Timeline visual structure

`app/timeline/index.tsx` groups events by month (existing, untouched
`groupTimelineEventsByMonth`), then renders, per month:

- A **month heading** in natural case, bold, real size/weight contrast —
  deliberately *not* the uppercase `SectionLabel` treatment used for
  settings-style grouped lists elsewhere, so this screen doesn't read as
  another settings menu.
- One **continuous rail line** (`TimelineRailLine`) spanning that month's
  entire day/event block, absolutely positioned behind everything.
- A **day marker** per day group: the day-of-month as a bold tabular
  numeral inside a small circular "punch-through" backdrop sitting
  directly on the rail, with the weekday name beside it — compact, not a
  repeated full-sentence header.
- One **event row** (`TimelineEventRow`) per event: a shape marker on the
  rail (see §5), a bold label, a quieter caption, a chevron only when the
  row is genuinely navigable.

The rail is scoped **per month**, not one line spanning the whole scroll —
each month's rail is fully continuous within itself (verified live: an
unbroken line runs behind every day/event marker from a month's first
entry to its last), and deliberately does not run behind the month heading
itself, which sits outside that relative-positioned block.

## 4. Why Timeline is no longer a generic vertical list

A "line + normal list rows" implementation was explicitly rejected. What
makes this a considered composition instead:

- **A genuine shape taxonomy**, not icons — six distinct geometric
  markers (§5), silhouette-distinguishable with zero reliance on color.
- **The rail itself carries content** — day markers are numerals sitting
  directly on the line, not a separate typographic layer above it.
- **A real date hierarchy** — month (large, editorial, natural case) vs.
  day (compact, tabular, on-rail) vs. event (small, indented) are three
  clearly different visual registers, not one repeated header style.
- **Structural, not decorative, hierarchy** — "anchor" events (lab,
  appointment, High-Symptom Day) get a larger marker and slightly bolder
  ink than "routine" events (check-in, medication, injection); this is
  frequency-based information architecture, never a severity signal (§9).
- **No card anywhere in Timeline** — confirmed in the implementation: zero
  `GroupedList`/`MetricCard`/bordered-container usage in `app/timeline/index.tsx`
  or its supporting components.

## 5. Event marker taxonomy

`src/features/timeline/timelineMarkers.ts` (pure data, unit-tested):

| Event type | Shape | Tier | Ink color |
|---|---|---|---|
| `check_in` | Circle (filled) | routine | `textSecondary` |
| `medication` | Square (filled) | routine | `textSecondary` |
| `injection` | Diamond (rotated square, filled) | routine | `textSecondary` |
| `lab` | Ring (open circle) | anchor | `textPrimary` |
| `appointment` | Double ring (ring + filled center dot) | anchor | `textPrimary` |
| `high_symptom_day` | Short vertical bar | anchor | `brandPrimary` |

All six shapes are real `View`-based geometric primitives (no SVG, no
icon dependency). Every shape is silhouette-distinct from every other —
verified both by a unit test (`timelineMarkers.test.ts`, asserting no two
event types share a shape) and by live visual inspection of every type
in the seeded web preview (check-in, medication, injection, lab,
appointment, and a temporarily-flagged High-Symptom Day all screenshotted
and visually distinguishable).

**Only `high_symptom_day` gets the brand accent color** — every other
marker, including the other two "anchor" types, stays neutral ink. This
matches `docs/DESIGN_DIRECTION_VALIDATION_2_0.md`'s own approved Timeline
research ("Warm accent for High-Symptom Day only; everything else
neutral") rather than the broader per-tier coloring an earlier draft of
this phase considered — refined specifically so lab/appointment markers
never read as more "important" than each other by hue, and so the one
color accent in the whole Timeline is reserved for the one genuinely
user-declared, explicit marker.

## 6. Event-copy approach

New Timeline-specific translation keys (both `en.json`/`tr.json`, parity
verified):

- `timeline.checkInEvent`: "Pain %{pain}, fatigue %{fatigue} recorded" /
  "Ağrı %{pain}, yorgunluk %{fatigue} kaydedildi" — replaces the shared
  `symptoms.rowLabel` key Timeline previously borrowed from the Symptoms
  History screen, so that screen's own copy (out of this phase's scope)
  stays completely untouched while Timeline gets its own natural phrasing.
- `timeline.labEvent`: "%{marker} added" / "%{marker} eklendi" — wraps the
  existing `labs.marker.*` vocabulary (`CRP`/`ESR`) rather than
  duplicating it.
- `timeline.highSymptomDay` (existing key, value changed): "High-symptom
  day" → "Marked as a high-symptom day" / "Yoğun belirti günü" → "Yoğun
  belirti günü olarak işaretlendi" — matches the brief's own literal
  example.

Medication, injection, and appointment labels were deliberately **not**
forced into the brief's generic illustrative phrasing ("Injection
recorded", "Appointment added"). They already show the specific
medication/treatment/doctor name as the label with the status/type as the
caption — genuinely more useful than a generic phrase, still fully
factual and non-interpretive, and not in conflict with any explicit rule
in the brief. The generic examples are read as tone guidance, not a
literal mandate to discard already-specific information.

## 7. Date hierarchy

System typography only (no bundled font), three registers:

- **Month**: `typography.headline` at weight 700, natural case (e.g.
  "Eylül 2026", "September 2026") — real size/weight contrast, the
  clearest expression of this screen's own editorial identity.
- **Day**: `typography.callout` at weight 700, tabular numerals, inside a
  small on-rail circular backdrop, weekday name in `caption` beside it
  (e.g. "07 Pazartesi").
- **Event time**: not shown — the domain's `TimelineEvent` types carry
  only a date, no time-of-day field, and adding one would mean touching
  the protected `src/domain/timeline` layer. Nothing was fabricated.

## 8. Dense-week behavior

Live-verified against a genuinely dense real seed-data day (August 29:
a check-in, a medication dose, and two lab results, all on one day) — the
day stays compact: one day marker, four short event rows, no giant
vertical spacing, no repeated headers, no oversized markers. Routine
events (check-in, medication) use the smaller marker tier so a busy day
doesn't visually overwhelm the rarer anchor events around it.

## 9. Empty-state behavior

`timeline.emptyTitle` + a new `timeline.emptySubtitle`, calm and
functional: "No recorded events yet." + "Your check-ins, treatments, labs
and visits will appear here." (TR: "Henüz kayıtlı bir olay yok." +
"Kontrollerin, tedavilerin, tahlillerin ve randevuların burada
görünecek.") — no "journey"/"story" language. Live-verified via a
temporary, reverted store override (§QA below).

## 10. Symptoms presentation

Unchanged data/route (`/symptoms` untouched) — only its Health Record
landing row changed presentation container (now inside the boxless record
list instead of a `GroupedList`). Caption still shows "last recorded"
factually (today's date, or the most recent entry's date, or "Nothing
yet") — no new analytics, no severity color.

## 11. Treatment (Medications) presentation

Visually grouped under one inline "Treatment"/"Tedavi" label (reusing
Design-D's `today.treatmentTitle` key rather than duplicating it) directly
above the Medications and Injections rows — but their routes
(`/medications`, `/injections`) and underlying data stay completely
separate, as required. Caption shows active-count/next-scheduled
information, unchanged from the prior landing's own logic — no
adherence percentage, no compliance judgment.

## 12. Injection presentation

Same treatment as Medications (§11) — grouped under the same "Treatment"
label, separate route, factual caption only ("Next: in N days" / "Next:
today" / active count). On the Timeline itself, injection events use the
diamond marker, confirmed visually distinct from the medication square.

## 13. Labs presentation

Unchanged route (`/labs`); landing caption shows the latest result's date
factually. On Timeline, lab events use the ring marker with tabular
numeral values ("6.8 mg/L", "15 mm/hr") — no reference ranges, no
normal/abnormal/high/low language anywhere in the new copy (verified by
the safety audit, §32 in the final report).

## 14. Insights placement

Folded into the same record-categories list as its 4th row, reusing the
existing `insights.title` ("Insights"/"Analiz") as the label — not a new
"Trends" term that would diverge from the destination screen's own name —
with a new short caption (`track.trendsCaption`). Route (`/insights`)
completely unchanged. Insights' own internal screen was **not**
redesigned this phase, per the brief's explicit deferral to Design-G.

## 15. Knowledge placement

Removed from Health Record's primary hierarchy entirely, per the brief's
explicit §16 instruction. `/knowledge`'s route and content are untouched
— simply no longer linked from this screen. `track.knowledge`/
`track.knowledgeCaption` translation keys were deleted (verified unused
anywhere else in the codebase before deletion). **Knowledge's eventual
home is not decided in this phase** — most likely a Profile/support
entry, explicitly flagged here as a **Design-H task**, not invented or
guessed at now.

## 16. High-Symptom Day Timeline behavior

Semantics completely unchanged (explicit, user-declared, never inferred —
`src/domain/timeline`/`resolveDefaultHighSymptomDay` untouched). On
Timeline: the bar marker (§5) plus the one brand-accent color in the
entire screen — never red, never "flare"/"bad day"/"worsening" language.
Live-verified via a temporary, reverted store override flagging one
seeded check-in (§QA below): renders as "Marked as a high-symptom day" /
"Yoğun belirti günü olarak işaretlendi", caption "Pain 3/10 · None",
calm and factual.

## 17. Appointment Timeline behavior

Appointment events use the double-ring marker, always navigable
(`/appointments/[id]`, unchanged route) — confirmed live. No
appointment-management actions (reschedule, cancel, prepare) were added
to Timeline; it stays a historical read lens, matching the brief's
explicit "Timeline provides historical context... do not duplicate
appointment-management actions" rule.

## 18. Appointment Summary → Timeline verification

Live-verified end-to-end: Appointment Summary's existing "View timeline"
link (`router.push("/timeline")`, unchanged) correctly lands on the
redesigned Timeline screen, which renders normally. No route deletion, no
deep-link breakage.

## 19. Card/container and icon reduction

Zero `GroupedList`/`MetricCard`/bordered-container usage anywhere in
`app/timeline/index.tsx`, `app/(tabs)/track.tsx`, or the new
`src/features/timeline/Timeline*.tsx` components — the record-categories
list uses one boxless `Section`; the Timeline uses hairlines and the rail
itself as its only structural devices. Icons: the landing's record rows
(Symptoms/Treatment/Medications/Injections/Labs/Trends) are icon-free
(label + caption + chevron only) — deliberately, addressing Design-D's own
flagged "not enough character without noise" self-critique by relying on
composition/typography rather than decoration. Timeline itself uses zero
`Ionicons` — the shape-marker system replaces every per-event-type icon
that existed before.

## 20. EN/TR decisions

Full key parity maintained (verified via the existing `i18n.test.ts`).
10 `track.*` keys deleted or renamed reflect the removed/restructured
sections; every new value was written natively in both languages, not
mechanically translated. Turkish remained the harder case throughout live
QA (longer stiffness-bucket phrases, longer institution names like "Dr.
Aylin Demir — City Hospital Rheumatology") and rendered cleanly with no
overflow or clipping at both tested widths.

## 21. Accessibility decisions

- Every marker/day-node backdrop is sized for visual clarity, not
  necessarily 44pt itself — per the brief's own §24 allowance ("the
  Timeline itself does not need every visual marker to be independently
  touchable unless there is an actual action"), only rows with a real
  `route` (today's own check-in/High-Symptom-Day, appointments) are
  wrapped in a touchable, and those touchables use `AccessibleTouchable`'s
  existing 44pt floor.
- Marker meaning is never color-only — shape is the primary signal for
  all six types; color (the routine/anchor ink difference, and the one
  High-Symptom Day accent) is a secondary reinforcement only, confirmed
  independent of hue by the shape-uniqueness unit test.
- `accessibilityLabel` on every navigable row combines label + caption
  (unchanged, existing `presentTimelineEvent` behavior).
- Dynamic Type: no `allowFontScaling={false}` introduced; long Turkish
  strings (institution names, stiffness captions) wrap without breaking
  the row/rail alignment — confirmed live, text never collides with the
  rail gutter because content always sits in its own flexed column to the
  right of a fixed-width marker slot.
- Reduced Motion: no new animation was introduced (Timeline is fully
  static — no scroll-triggered reveal, no marker transition).

## 22. QA scenarios tested

Web dev preview (`?entitlement=entitled`), 390×844 and 430×932 (the web
preview shell caps content width at 430pt regardless of window size, so
both resize checks render identical content width — no divergence
observed), Turkish (default):

- **A. Health Record — populated** — verified (rail preview, grouped
  record list, supporting utilities all render correctly).
- **B. Health Record — sparse** — verified via a temporary, reverted
  store override (`?qaEmptyTimeline=1`, following the same
  established-and-reverted technique used in Phase X/Z) — "No recent
  activity." shown in place of the rail preview, record rows correctly
  fall back to "Nothing yet" captions, active-medication/injection counts
  (unaffected by the override) still show correctly.
- **C. Timeline — empty** — verified via the same override.
- **D. Timeline — normal mixed data** — verified (the real 90-day seeded
  history: check-ins, medications, injections, labs, one past
  appointment, spanning September/August/July/June 2026).
- **E. Timeline — dense week** — verified (August 29, four events in one
  day, stayed compact).
- **F. Timeline — High-Symptom Day** — verified via a second temporary,
  reverted override (`?qaHighSymptomDay=1`, flagging the most recent
  seeded check-in) — both on the full Timeline and the Health Record
  landing's compact preview.
- **G. Timeline — lab event** — verified (CRP/ESR rows, ring marker,
  "eklendi" copy, tabular values).
- **H. Timeline — appointment event** — verified (double-ring marker,
  long institution name wrapping correctly, chevron, successful
  navigation to `/appointments/[id]`).
- **I. Timeline — medication + injection** — verified (square vs. diamond
  markers directly compared in the same screenshot region — see the
  Sulfasalazine/Etanercept rows on 2026-09-07 through 09-01).
- **J. Timeline — long Turkish strings** — verified (institution name
  wrap, stiffness-bucket captions).
- **K. Appointment Summary → Timeline** — verified (§18).

**Not independently re-verified in English** this phase: the Health
Record landing and Timeline screens specifically. This is a genuine,
pre-existing web-preview tooling constraint, not a shortcut — the
`profile/language.tsx` screen (unchanged, out of scope) has no in-app
link back to any other screen (native apps rely entirely on an OS/gesture
back that this Chrome-automation tooling cannot reliably trigger without
causing a full page reload), and this project's web mock resets **all**
in-memory state — including the just-selected language — on any full
page reload. English *was* confirmed rendering correctly on the Language
screen itself (title, options, labels all in English), confirming the
locale-switching mechanism works; Turkish — the structurally harder case
due to longer strings — was thoroughly verified with zero overflow across
both redesigned screens. This is flagged explicitly rather than silently
assumed, matching this project's established practice (e.g. Design-D's
own scenario-G note).

Only the existing, documented, non-real `?entitlement=entitled` web-mock
flag was used as a standing parameter; the two temporary QA-only overrides
(`?qaEmptyTimeline=1`, `?qaHighSymptomDay=1`) were added to
`src/repositories/web/store.ts`, used for screenshots, then fully
reverted — confirmed via `git diff --stat -- src/repositories/web/store.ts`
returning no output before this phase's validation/final report.

## 23. Dark mode

Only Design-B's existing semantic tokens were used throughout (`colors.hairline`,
`colors.textPrimary`/`.textSecondary`, `colors.brandPrimary`,
`colors.background`) — no new screen-specific hex value was introduced
anywhere in this phase's code. **Live native/device dark-mode visual QA
was not performed** — `useTheme`'s own doc comment documents that the web
preview forces light mode regardless of host OS theme
(`Platform.OS === "web"`), a pre-existing constraint of this workflow that
Design-B, Design-D, and now Design-E have all been unable to work around
within it. A code-level review confirms every rail/marker/hairline/text
color reference resolves through the theme's dark-mode token table (no
hardcoded light-only value), so the same distinction the light-mode
screenshots show should hold in dark mode — but this is a code-review
conclusion, not a claimed visual verification.

## 24. Visual self-critique

1. **Does Health Record still look like a feature menu?** Mostly no — one
   continuous hairline-separated list replaces the previous boxed
   "Health tracking" GroupedList, Knowledge is gone, and the Timeline
   preview now visually anchors the whole screen. The rows still
   *function* as navigation (they must — Symptoms/Medications/etc. are
   genuinely separate screens), but the screen no longer *reads* as a
   grid of feature tiles.
2. **Is Timeline clearly the conceptual center?** Yes — it's the first
   substantial content block after the context line, gets its own live
   rail-preview treatment (not just a text link), and received by far the
   most design investment of this phase (the marker taxonomy, rail
   geometry, and date hierarchy all exist for Timeline specifically).
3. **Is the Timeline rail genuinely continuous?** Yes, within each
   month — confirmed live across multiple months and a genuinely dense
   day, with an unbroken line behind every marker. It intentionally
   restarts at month boundaries (a documented choice, not an accident).
4. **Are event classes distinguishable without color?** Yes — all six
   shapes (circle, square, diamond, ring, double-ring, bar) were directly
   screenshotted and are silhouette-distinct; the diamond/injection
   marker specifically was verified in this same session (Etanercept
   rows), not left as a code-only claim.
5. **Does a dense week remain readable?** Yes — verified against real
   seed data (August 29's four-event day) staying compact, no giant
   spacing, no repeated headers.
6. **Does Timeline feel like a health record rather than a social feed?**
   Yes — no avatars, no bubbles, no shadows; factual "recorded"/"added"
   language throughout; sober, restrained typography.
7. **Does it feel premium without boxes/shadows everywhere?** Yes — zero
   boxed containers in either redesigned screen; the record-categories
   list, the Timeline, and the compact preview are all boxless.
8. **Hide the logo/app name: is this screen more recognizable than the
   product was after Design-D?** Yes, genuinely — Design-D's own
   self-critique named "not enough character without noise" as its
   weakest point, explicitly because the Timeline-rail signature was
   reserved for this phase. Design-E delivers exactly that reserved
   signature: the continuous rail, the shape-marker taxonomy, and the
   on-rail day-numeral treatment together form a specific, ownable device
   with no equivalent in Today/Check-in and no resemblance to a generic
   list-based timeline. This is the strongest visual-identity claim made
   in this project's design-system rollout so far.

No answer required rework this pass.

## 25. Tests added

- `src/features/timeline/__tests__/timelineMarkers.test.ts` (4 tests) —
  every event type has a marker, all six shapes are unique, tier
  assignment matches the routine/anchor rule, High-Symptom Day gets the
  bar (distinct from check-in's circle).
- `src/localization/__tests__/format.test.ts` — 1 new test for the new
  `formatWeekday` helper (EN/TR divergence).
- `src/features/timeline/__tests__/presentTimelineEvent.test.ts` — 3
  existing tests updated (not added) to match the new `timeline.checkInEvent`/
  `timeline.labEvent` copy keys; every other existing assertion (route
  logic, high-symptom-day snapshot completeness, medication/injection/
  appointment presentation) is unchanged and still passes.

`groupTimelineEventsByMonth`, `buildTimelineEvents`, and `getTimelineEvents`
— the actual chronological-ordering/grouping/domain logic — were **not**
modified, so their existing test suites (`timeline.test.ts`,
`groupTimelineEvents.test.ts`, `useTimeline.test.ts`) continue to cover
ordering correctness, no-event-lost guarantees, and the High-Symptom-Day/
check-in split without any change. No domain logic was moved into the UI
layer for test convenience.

## 26. Deferred work (explicit, not scope creep)

- **Knowledge's final home** (likely a Profile/support entry) — flagged
  as a Design-H task (§16).
- **Full Insights/trends redesign** — explicitly Design-G's scope (§14).
- **Symptoms/Medications/Injections/Labs screens themselves** — only their
  Health Record landing entry points changed this phase; the destination
  screens are untouched, matching the brief's scope (redesign the
  landing + Timeline, not every downstream screen).
- **English-locale live visual QA for these two screens specifically** —
  blocked by a pre-existing web-preview tooling constraint (§22), not
  performed, explicitly flagged rather than assumed.
- **Native dark-mode visual QA** — same pre-existing constraint carried
  from Design-B/D (§23).
