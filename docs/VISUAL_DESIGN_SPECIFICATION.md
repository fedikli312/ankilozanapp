# Visual Design Specification — V1

Status: **Approved.** This is the Visual Design phase: the visual system and screen-level visual direction. It authorizes the technical architecture phase; it does not by itself authorize Expo scaffolding or application code.

Built under Product OS Design Mode from `docs/UX_SPECIFICATION.md` (approved), `docs/PRD.md`, `PROJECT_CONTEXT.md`, `PROJECT_MEMORY.md`, and `02_DESIGN/*`, `11_PRODUCT_CRAFT/*`, `14_DECISION_ENGINE/CRAFT_DECISION_TREES.md`, `02_DESIGN/APPLE_HIG_REVIEW.md`, `02_DESIGN/ACCESSIBILITY_CHECKLIST.md` in `../furkan-ai-product-os`.

No product name is finalized here and no logo/wordmark/app-icon is created — none of these are required at this phase, and finalizing them now would front-load decisions that don't belong to Visual Design.

---

## 1. Brand personality

The product should read as: **calm, personal, warm, trustworthy, premium, modern, quiet, native, human.**

It must never read as: a hospital portal, an enterprise medical dashboard, a generic SaaS dashboard, a fitness gamification app, an AI chatbot, or an Apple Health clone.

Practical translation:
- **Calm/quiet** → generous whitespace, restrained color, no dense grids, no urgent red.
- **Warm/human** → off-white (not stark clinical white) backgrounds, warm ink instead of pure black, plain-language typography doing the work color would otherwise do.
- **Trustworthy/premium** → consistency, native platform conventions, no gimmicks, nothing decorative without function.
- **Modern/native** → system typography and SF Symbols as the default vocabulary, not a custom illustrated visual language layered on top of iOS.
- **Not Apple Health** → no ring/badge iconography, no red heart glyph, no colorful multi-metric dashboard grid; single-focus list-first screens instead.
- **Not a chatbot/AI product** → no gradient orbs, no glow, no "assistant" chrome anywhere in V1 (there is no assistant feature yet).
- **Not fitness/gamified** → no streak counters, no badges, no flame icons, no celebratory bursts for routine actions.

## 2. Color system

A small, deliberately restrained palette: one warm neutral scale, one accent, and quiet semantic colors used only for their specific purpose (never for symptom severity).

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `#FAF7F2` (warm cream, not stark white) | `#1E1B18` (warm near-black, not OLED-pure-black) | App background |
| `surface.highlight` | `#E8F0EE` (soft teal-tinted neutral) | `#24302C` (dark teal-tinted) | The single highlighted container per screen — e.g. Today's check-in card |
| `text.primary` | `#2B2926` (warm ink) | `#F3EEE6` (warm off-white) | Primary text |
| `text.secondary` | `#6B665F` | `#B2A99C` | Supporting/caption text |
| `border.hairline` | `#E4DED3` | `#3A352E` | List dividers, input underlines |
| `accent` | `#3D6B66` (deep muted teal) | `#3D8078` (brightened for fill contexts) | Primary buttons, selected states, links, focus |
| `accent.foreground` | `#FAF7F2` | `#F3EEE6` | Text/icons on an accent-filled surface |
| `accent.onDark` | — | `#7FB5AC` | Accent used as foreground color directly on dark background (tabs, links) |
| `status.success` | `#5C8A72` (muted sage) | `#7FAE8E` | Confirmed/completed actions only |
| `status.warning` | `#B8863A` (muted amber) | `#D3A25E` | Caution copy only (e.g. permission needed) |
| `status.danger` | `#A14B3D` (muted brick) | `#C97362` | Destructive actions only (delete account/data) — never for symptom severity |
| `status.neutral` | `#8A8478` | `#9C9284` | Missed/incomplete states — paired with icon + label, never alone |

Exact values are a proposal to validate against contrast tooling during implementation, not pixel-final.

## 3. Semantic colors

Strict rule, carried directly from the UX spec: **status is never color alone**, and **medical status never relies on red/green, and pain is never color-coded by severity.**

- `status.success` — used only for genuinely completed actions (check-in saved, injection logged, purchase-equivalent confirmations if ever introduced). Not used for "good" symptom readings.
- `status.warning` — used only for system/permission caution copy (e.g. "Reminders are off"), never for health values.
- `status.danger` — reserved exclusively for destructive actions (delete account/data confirmation). Never applied to a high pain score, a missed dose, or a "bad" trend.
- `status.neutral` (`#8A8478`) — the color for **missed** doses/injections and any incomplete state. Deliberately unalarming, always paired with an icon (e.g. a plain circle-outline, never a warning triangle or flame) and a text label.
- The pain and fatigue stepped controls use a **single accent color regardless of value** — there is no red-to-green gradient across the 0–10 scale. Only the numeric label changes; the control's color language stays constant.

## 4. Light-mode foundation

Background `#FAF7F2`, primary text `#2B2926` — warm, soft contrast rather than stark black-on-white. The single `surface.highlight` tint (`#E8F0EE`) is reserved for exactly one purpose per screen (see §13) so it keeps its meaning as "the one thing that matters here" instead of becoming a generic card background.

## 5. Dark-mode strategy

Not an inverted palette — a deliberately warm dark mode. Background `#1E1B18` (soft warm charcoal, not pure black) with warm off-white text `#F3EEE6`. Elevation/emphasis is communicated through the same `surface.highlight` tinting approach (`#24302C`), not drop shadows, which read poorly on dark backgrounds. The accent brightens slightly in fill contexts (`#3D8078`) to maintain contrast against the dark background, while a lighter variant (`#7FB5AC`) is used wherever accent color sits directly on the background as foreground (tab bar selection, links) rather than as a filled surface.

## 6. Typography hierarchy

System typography (SF Pro via iOS Dynamic Type) throughout — no custom typeface. A restrained five-level semantic scale, each mapped to a native Dynamic Type text style so it scales automatically:

| Token | Approx. size / weight | Maps to | Use |
|---|---|---|---|
| Display | 34–40pt, bold | Large Title | Onboarding welcome/value-promise screens only |
| Title | 28pt, semibold | Title 1 | Screen large titles (Today, Track, Appointments, Insights) |
| Headline | 20pt, semibold | Headline | Section headers, the check-in card's question |
| Body | 17pt, regular | Body | Primary content, list rows, form values |
| Caption | 13pt, regular | Footnote | Secondary text, timestamps, descriptive summaries under charts |

Rule: hierarchy comes from this scale plus spacing and grouping — not from color, boxes, or added weight beyond what the scale already defines.

## 7. Spacing system

Adopted directly from `02_DESIGN/VISUAL_FOUNDATIONS.md`: a 4-point base, using 8 / 12 / 16 / 24 / 32 as the standard increments. No arbitrary values without visual justification. Generous spacing is a primary hierarchy tool here — used to separate Today's sections instead of dividing lines or card borders wherever plain grouping is sufficient.

## 8. Corner-radius system

A small, restrained scale — intentionally less rounded than typical fintech/SaaS visual trends, to stay quiet rather than trendy:

- **Pill** (fully rounded, height ÷ 2) — chips, the stepped pain/fatigue scale segments, duration chips.
- **Small (12pt)** — buttons, input fields.
- **Standard (16pt)** — the one highlight card per screen (§13).
- **Large (20pt, top corners only)** — sheet/modal presentations.
- **None** — native list/section rows, which rely on hairline dividers, not boxes.

## 9. Iconography

**SF Symbols only** — native, accessible, scales with Dynamic Type, and automatically matches system type weight. No custom illustrated icon set (illustrated icons read as either "fitness app" playful or "AI product" decorative, both explicitly avoided). Regular weight by default; status icons stay simple (checkmark, circle, circle-outline, chevron) rather than badges. No color-filled icon badges for status — icon + adjacent text label together, per §3.

## 10. Buttons

- **Primary** — filled, `accent` background, `accent.foreground` label, `Small` radius. One clear primary action per screen wherever possible (Save, Continue, Log now).
- **Secondary** — text-only or lightly tinted, `accent` foreground color, no fill. Used for "Skip", "Cancel", secondary navigation.
- **Destructive** — text-only, `status.danger` foreground, reserved strictly for delete-account/data confirmation. Never used for "mark missed" or any routine negative-sounding action.
- **Disabled** — reduced opacity (~40%), no accent fill.
- No gradients, no drop-shadow "lift," no bounce on press — a single Tier 1 opacity/scale response (§28) is the only feedback.

## 11. Inputs

Quiet, filled style — not heavy bordered boxes that read as enterprise forms: a soft `border.hairline`-tinted fill, no visible border at rest. Persistent labels above the field (never placeholder-only, per accessibility requirements). Focus state: a subtle `accent`-colored underline plus the label shifting to `accent` — both a color and a non-color cue, so focus is never communicated by color alone.

## 12. Selection controls

- **Chips** (multi-select — body area, "what to remember", stiffness duration) — Pill radius, outline by default, `surface.highlight`-filled + `accent` border when selected, always paired with a checkmark glyph on selection, never color alone.
- **Segmented control** (time range, Upcoming/Past) — native iOS segmented control styling.
- **Stepped/adjustable scale** (pain, fatigue) — a horizontal row of Pill-radius segments, current value filled `accent`, others outlined in `border.hairline`; the numeric value is always shown as text above the control, and the control is exposed as an accessibility-adjustable element (§27). No color gradient across the scale regardless of value (§3).

## 13. Cards/containers

**Restraint is explicit product direction.** Two container patterns only:

1. **Native inset-grouped list/section style** (like iOS Settings) — the default for structured data: Track landing, Profile, Medications/Injections/Labs lists, Appointments list. No visible card chrome — section headers, hairline dividers, generous row padding.
2. **The single highlight card** — reserved for exactly one purpose per screen: Today's check-in card while incomplete, and equivalent one-per-screen focal moments (e.g. the central content of an onboarding step). `surface.highlight` fill, `Standard` radius, no shadow (or at most a barely-visible 1–2pt soft shadow — flat is preferred).

Everything else lives as a plain row on the background. No nested cards, no card-inside-card, and information is not automatically wrapped in a rounded rectangle just because it's a "section."

## 14. Lists and rows

Native iOS list-row pattern throughout: optional leading icon (SF Symbol, status or category), primary label (Body), optional secondary caption (Caption, `text.secondary`), optional trailing value/chevron. Row height respects the 44pt minimum touch target. Dividers are 1px hairlines (`border.hairline`), not heavy borders. Swipe actions (e.g. mark medication taken) follow standard iOS swipe-action styling.

## 15. Bottom navigation

Standard iOS tab bar, four items — **Today · Track · Appointments · Insights** — SF Symbol icon + visible text label per tab (never icon-only, for clarity and accessibility). Selected tab uses `accent` (or `accent.onDark` in dark mode) for both icon and label; unselected uses `text.secondary`. No badge dots for "things to do" — that would start to feel like a to-do/gamification signal, which is explicitly out of scope.

## 16. Navigation bars

Standard large-title, collapsing-on-scroll navigation bars per tab (native, calm, no custom nav chrome). The Profile/Settings entry point is a persistent icon in the trailing position of the navigation bar, present consistently across all four tabs — not just on Today.

## 17. Sheets/modals

Native iOS sheet presentation for check-in and all add/edit flows: `Large` (20pt) top-corner radius, standard grabber, leading **Cancel**, trailing primary action (**Save**) in the sheet's own nav bar — trailing position for the primary action, per iOS convention. Short single-value entries (e.g. a quick lab result) use a compact/partial-height sheet; longer forms (add medication) use a full-height sheet.

## 18. Charts

Restrained, single-metric, single-line — never an analytics dashboard. One continuous, rounded-cap stroke per chart (the "thread" motif, §31), minimal axis chrome (a few labeled points, not dense tick marks), no heavy gridlines, no legends (each chart already shows exactly one metric). List-view sparklines render in a quiet neutral/`text.secondary` tone; the full detail view renders its single line in `accent` to signal focus. Every chart carries a plain-language text summary alongside it (never a chart-only presentation), per the accessibility requirement.

## 19. Status presentation

Every state — taken / missed / upcoming / completed — pairs an icon with a text label; color is never the sole signal (§3, §9). "Missed" uses `status.neutral` with a plain circle-outline icon and the word "Missed," never a warning triangle, exclamation mark, flame, or `status.danger` red.

## 20. Empty states

Centered, calm, single line of plain-language copy (e.g. *"Keep checking in to see how your symptoms change over time"*), one primary action where relevant, and — if any glyph is used at all — a single small quiet line-icon (SF Symbol), never a decorative illustration or mascot. No empty state ever implies failure or asks the user to feel behind.

## 21. Success feedback

Quiet and compact — inline confirmation (a checkmark and brief label, e.g. the check-in card settling into its completed row) rather than a modal, banner takeover, or celebratory animation. No confetti, no full-screen success screens for routine actions. A single, restrained Tier 3 moment (§28) is reserved for first reaching Today after onboarding — understated, not celebratory.

## 22. Reminder presentation

In-app reminder rows (Today's action items, Profile's reminder settings) use the same neutral status system as §19 — no urgency color, no bell-shake animation. Local notification banners use the approved generic, privacy-preserving copy from the UX spec (e.g. *"You have a health reminder"*) with standard system notification styling — no custom notification UI.

## 23. Today visual hierarchy

Exactly one highlighted element: the check-in card (§13, pattern 2), only while incomplete. Everything beneath it — action-today items, next injection, upcoming appointment, relevant future reminder — renders as plain, equally-quiet list rows under simple section labels, per the approved priority order in the UX spec. No section renders when empty. Once check-in is complete, it collapses into a plain row matching the visual weight of everything else — Today never keeps two things visually dominant at once.

## 24. Check-in visual interaction

Presented as a sheet (§17). Large, friendly stepped pain/fatigue controls (§12) with a light Tier-1 tap response and an optional light "Selection" haptic per `HAPTIC_LANGUAGE.md`. Stiffness duration as a horizontal row of pill chips. The "+ Add more" disclosure expands smoothly (Tier 2, §28) to reveal wellbeing and body-area chips. **Save** is a full-width primary button pinned to the bottom of the sheet, always reachable without scrolling past it.

## 25. Insights visual language

List-first (§18): each row = metric label + quiet neutral-tone sparkline + one-line descriptive text + chevron. The detail view = one `accent`-colored line chart + a segmented time-range control + the same descriptive text, placed below the chart (text explains what you're looking at after you've seen it, not instead of looking at it). No composite score, no multi-metric overlay, no dashboard grid.

## 26. Appointment Preparation visual composition

Optimized for **rapid scanning during a live appointment**: a single scrollable page, large legible type (leaning toward Body/Headline sizes rather than Caption-heavy density), the resolved date range shown prominently as a pill/chip at the top (not buried in a sentence), each section (Symptom trends / Medications / Injections / Labs / Notes) as a plain labeled native section — not individual boxed cards — with short summary lines rather than small dense multi-column tables. A subtle "thread" connector (§31) at the top visually reinforces the date range being summarized, functionally, not decoratively.

## 27. Accessibility constraints

- **Contrast** — all text/control colors target WCAG-equivalent AA (body text ≥ 4.5:1, large text/icons ≥ 3:1) in both light and dark mode; exact values validated with contrast tooling during implementation.
- **Color independence** — every status (§3, §19) pairs icon + text; never color alone.
- **Dynamic Type** — the five-level type scale (§6) maps to native text styles so the whole system scales; layouts (Today rows, chips, Insight rows) reflow rather than clip at the largest accessibility sizes.
- **VoiceOver** — every control carries a purpose-describing label; the pain/fatigue scale is an accessibility-adjustable element with value announced on change (§12).
- **Touch targets** — ≥ 44×44pt for all interactive elements, including chips and stepped-scale segments.
- **Reduce Motion** — respected everywhere motion appears (§29).

## 28. Motion principles

Directly from `11_PRODUCT_CRAFT/MOTION_SYSTEM.md`:

- **Tier 1 (Feedback, 80–180ms)** — chip/segment selection, checkbox/mark-taken response, button press.
- **Tier 2 (Transition, 180–320ms)** — sheet presentation, the "+ Add more" disclosure expanding, Today's check-in card collapsing into its completed row.
- **Tier 3 (Moment, 300–600ms, used rarely)** — reserved for exactly one place in V1: the first time a user reaches Today after completing onboarding. Understated (a soft fade/settle as the screen's content appears), never a burst, confetti, or bounce.

No combination of fade + slide + scale + blur on any single element. Charts, if animated on first appearance, draw in once, simply, with an instant fallback under Reduce Motion.

## 29. Reduced-motion behavior

Large spatial transitions (sheet slide-up, card collapse, chart line draw-in) become instant crossfades or immediate state changes when Reduce Motion is enabled. No decorative or looping motion exists anywhere in this system to begin with, so nothing needs a special decorative-motion fallback — Reduce Motion simply removes the transition tier, never removes information (progress/status/completion is always also expressed in text/icon, per §19).

## 30. Localization visual constraints

All buttons, chips, and labels use intrinsic content sizing with a minimum (not fixed) width — Turkish strings, typically 20–35% longer than their English equivalents, must never truncate a critical label (e.g. "Mark as taken"). Rows support two-line labels where a single line can't be guaranteed rather than clipping. Numbers and dates follow locale formatting (decimal comma vs. period, `DD.MM.YYYY` vs. `MM/DD/YYYY`) — a functional requirement the visual system must leave room for, even though the formatting logic itself belongs to engineering. Every screen in this specification should be sanity-checked against both English and Turkish string lengths before visual sign-off in implementation.

## 31. Visual differentiation — "The Thread"

A single, subtle, functional motif rather than a decorative brand flourish: **a continuous, gentle line representing continuity between appointments** — the app remembering across time.

Where it appears, always functionally:
- **Chart line style** (§18, §25) — every trend line in Insights and Labs is a soft, continuous, rounded-cap stroke, not a bar chart or dotted/segmented line — reinforcing "an unbroken record over time" every time a chart is read.
- **Appointment Preparation header** (§26) — a subtle thread element visually connects the "since" date to "today," reinforcing what period is being summarized, functionally tied to the date-range chip rather than sitting beside it as decoration.
- **Today, first-arrival moment only** (§28, Tier 3) — a restrained one-time appearance as the screen's content settles in, never a persistent decorative background element.

The motif is deliberately monochrome (rendered in `text.secondary` or `accent`, never a separate brand color) and never appears purely decoratively — if a screen has no continuity-over-time concept to express, the thread does not appear on it. This is the extent of "visual differentiation" for V1: no illustration set, no mascot, no custom iconography beyond SF Symbols, no logo.

---

## Remaining visual decisions (deferred, not blocking)

- Exact contrast-validated hex values (this document's palette is a proposal; final values need a contrast-checking pass during implementation).
- Whether the check-in stepped-scale control uses 11 discrete segments (0–10) or a more compact visual treatment at very small screen widths — a small-screen layout test is needed once real components exist.
- App icon and any future logo/wordmark — explicitly out of scope for this phase, tied to the (not yet finalized) product name.
- Whether Insights list-row sparklines are visually distinct enough at `text.secondary` opacity — needs a real-device check once implemented.

---

## Next Product OS phase

Recommend: a **technical architecture phase** (Engineering Mode) — translating this approved visual system and the UX specification into an actual Expo/React Native project structure, design-token implementation, and data model, per `03_ENGINEERING/ARCHITECTURE.md` and `09_CHECKLISTS/NEW_PROJECT.md`'s Engineering section — still ahead of any Expo scaffolding until that phase itself is planned and approved.
