# Design System 2.0 — Implementation Record

Phase Design-B. Records what was actually built, with real verified values,
as distinct from `docs/DESIGN_DIRECTION_2_0.md` (the proposal) and
`docs/DESIGN_DIRECTION_VALIDATION_2_0.md` (the stress-test that approved
it). Where an implemented value differs from what either of those docs
originally proposed, this document — and the verification method below —
is the one that's authoritative; see `DESIGN_DIRECTION_2_0.md`'s own
Design-B addendum for the specific deltas.

Status: implemented, **uncommitted**, pending review (per the Design-B
brief's explicit instruction). Design System 2.0 as shipped here is the
**token and shared-component foundation plus the 3-tab navigation shell
only** — no product screen (Today, Check-in, Health Record content,
Timeline content, Appointment screens, Appointment Summary, Insights,
Profile, Knowledge, onboarding, paywall) was redesigned. See "Intentionally
deferred" at the end of this document.

## 1. Color tokens (`src/design-system/tokens/colors.ts`)

"Paper & Ink" — the approved palette direction
(`docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §5/§11). New semantic roles,
plus legacy aliases kept so ~70 existing, not-yet-migrated screens keep
rendering (with the palette's new colors, since the aliases now point at
the new values — the same brand reset applies everywhere automatically,
not just in new code).

| Token | Light | Dark | Role |
|---|---|---|---|
| `background` | `#FAF7F2` | `#1A1714` | Screen canvas ("paper") |
| `surfaceSecondary` | `#F5F1EB` | `#211D19` | One step off background — segmented-control track, input fill |
| `surfaceElevated` | `#FFFFFF` | `#28231E` | True elevated content — rare, deliberate use only |
| `textPrimary` | `#1C1917` | `#EDE6DC` | |
| `textSecondary` | `#6B6560` | `#A89E92` | |
| `textTertiary` | `#786F66` | `#8B8175` | Metadata (dates, counts) — real AA body text, not decoration |
| `hairline` | `#E8E2D8` | `#332D26` | Divider lines |
| `borderStrong` | `#93887A` | `#736958` | Inputs, selected-state outlines — WCAG 1.4.11 3:1 verified |
| `brandPrimary` | `#AD5335` | `#D97B5C` | The one reserved action/emphasis color (muted terracotta) |
| `brandSecondary` | `#6B4A3A` | `#B08567` | Quieter secondary-emphasis tone |
| `accentRare` | `#8C6A1F` | `#D4AF5D` | Rare dusty-gold milestone accent — genuine milestones only |
| `positive` | `#557259` | `#7FA382` | |
| `attention` | `#8F6222` | `#C99A4A` | |
| `critical` | `#C0392B` | `#D9695C` | Real safety alerts only — never symptom-value color-coding |
| `dataPrimary/Secondary/Tertiary` | `#AD5335`/`#557259`/`#8C6A1F` | `#D97B5C`/`#7FA382`/`#D4AF5D` | Chart series — never a per-variable rainbow |
| `selected` | `#F3E4DC` | `#3D2A22` | Interactive selected-state fill |
| `pressed` | `#EFE8DE` | `#2C2620` | |
| `disabled` | `#948A7C` | `#736958` | |
| `accentForeground` | `#FFFFFF` | `#1A1714` | Text/icon on a `brandPrimary` fill |

Legacy aliases (`accent → brandPrimary`, `backgroundWarm → background`,
`surface → surfaceElevated`'s value, `surfaceHighlight`,
`borderHairline → hairline`, `statusSuccess/Warning/Danger/Neutral`) are
kept, mapped onto the new values.

**A naming collision was caught and fixed twice during implementation, not
after the fact:**

1. `accent` — a draft used the bare name `accent` for the new gold
   milestone token. ~70 files already read `colors.accent` expecting the
   old one-reserved-action-color meaning. Fixed by naming the new token
   `accentRare` and keeping `accent` as an explicit legacy alias for
   `brandPrimary`.
2. `surface` — a draft reused the bare name `surface` for the new "one
   step off background" role (value `#F5F1EB`). Under the **committed,
   pre-Design-B** palette (`git show HEAD:src/design-system/tokens/colors.ts`),
   `surface` meant "true/near-white elevated container" (`#FFFFFF`) —
   exactly what this system now calls `surfaceElevated`. Seven files not
   touched by this phase (`BodyRegionMap`, `StiffnessSelector`,
   `PainScale`, `paywall`, `SelectableCard`, `breathing/index`,
   `MetricCard`) still read `colors.surface` expecting that old value —
   reusing the key would have silently swapped their background to the
   wrong color with no type error, discovered only by grepping every
   `colors.surface` consumer against the committed file before shipping.
   Fixed the same way: the new "one step off background" role was
   renamed to `surfaceSecondary` (which already existed with almost the
   same value/role), and `surface` was restored as a legacy alias equal to
   `surfaceElevated`'s value.

**Rule going forward**: never reuse a bare existing token key for a new
meaning — check the committed file's history, not just the current
in-progress draft, before naming a new token.

### WCAG verification

Every text/background and non-text-UI/background pairing was verified
against the real W3C relative-luminance contrast formula (implemented as a
standalone Node.js script, not eyeballed), against 4.5:1 (normal text) and
3:1 (large text / non-text UI per WCAG 1.4.11), in both light and dark
mode. Several of `docs/DESIGN_DIRECTION_2_0.md`'s originally-proposed hex
values failed on the first pass and were darkened/adjusted until they
passed — most notably the dusty-gold accent, which the original proposal
measured at **2.72:1** as text (a serious failure) and which the
implemented `accentRare` value now clears at **4.68:1**. `textTertiary`,
`brandPrimary`-as-text, and `attention` also needed adjustment from their
first-pass proposed values. The implemented, verified values in the table
above are authoritative; treat any hex in the earlier research/direction
docs as a starting point that did not always survive verification
unchanged.

## 2. Typography (`src/design-system/tokens/typography.ts`)

System font only (SF Pro via Dynamic Type) — no bundled/custom font, per
the Design-A2 "serif rule": an editorial character comes from weight,
spacing, and layout, never a bundled serif. Every pre-existing tier
(`display`, `metricLarge`, `title`, `headline`, `body`, `caption`,
`micro`) is kept at its original key; new roles were added rather than
inserted as replacements, so ~70 existing screens are unaffected.

| Role | Size/Line | Weight | Notes |
|---|---|---|---|
| `display` | 34/41 | 700 | |
| `title` | 28/34 | 600 | Screen title |
| `sectionTitle` | 13/18 | 600 | Uppercase, 0.4 letter-spacing — `SectionLabel`'s treatment, now a real token |
| `headline` | 18/23 | 600 | |
| `body` | 17/22 | 400 | |
| `callout` | 15/20 | 600 | Secondary emphasis, between body and caption |
| `caption` | 13/18 | 400 | |
| `metadata` | 12/16 | 400 | Tertiary text — dates, counts |
| `micro` | 12/16 | 400 | Kept for existing consumers; `metadata` is the named role for new code |
| `button` | 17/22 | 600 | |
| `tabLabel` | 10/13 | 600 | |
| `metricLarge` | 32/38 | 700 | `tabular: true` — the one hero-numeral tier, at most once per screen (`HeroMetric`) |
| `metricMedium` | 24/29 | 700 | `tabular: true` — secondary numerals (`MetricLine`) |
| `metricSmall` | 17/22 | 600 | `tabular: true` — inline numerals |

`tabular: true` marks the tiers that must render with
`fontVariant: ["tabular-nums"]` wherever a real logged health value is
shown — this is the "oversized tabular numerals, minimal chrome" visual
signature. `HeroMetric`, `MetricLine`, `MetricCard`, `DateBlock`, and
`StepperField`'s numeral all apply it directly on their `Text` (the token
only marks intent; components are responsible for the `fontVariant`).

## 3. Spacing / layout (`src/design-system/tokens/spacing.ts`, `layout.ts`)

Spacing is unchanged (4-point base: `xxs 4, xs 8, sm 12, md 16,
lgTight 20, lg 24, xl 32`). `layout.ts` adds named composition rules built
from those same values — not new raw numbers:

`pageMargin` (`lg`, 24) · `sectionSpacing` (`xl`, 32) ·
`rowSpacing` (`sm`, 12) · `metricSpacing` (`xs`, 8) ·
`contentRhythm` (`xxs`, 4) · `bottomClearance` (`xl`, 32) ·
`minTouchTarget` (44, unchanged).

`ScreenContainer` uses `pageMargin` for horizontal padding and adds
`bottomClearance` on top of `SafeAreaView`'s own inset in scroll mode, so
content never sits flush against the tab bar/home indicator.

## 4. Radius / borders / hairlines

`radius.ts` is unchanged (`small 12, standard 16, large 20`, plus
`pillRadius(height)` for a control-height-derived pill). What changed is
default *usage*: cards are no longer the default container. `Hairline`
(new, `colors.hairline`, 1px) is the new default divider; `Section` (new)
composes label + hairline-separated rows with **no** outer box, replacing
`GroupedList`'s border+fill+radius "triple-framing" as the default for new
screens. A genuine boxed/elevated treatment is still available
(`GroupedList` itself, or `QuietSurface`) for the rare case content
actually needs that prominence.

## 5. Motion (`src/design-system/tokens/motion.ts`)

Named roles added over the existing tiers (values unchanged, same ranges):
`quickFeedback` (80-180ms, tap/selection), `standardTransition`
(180-320ms, tab/range change), `contentReveal` (300-600ms, content
settling into view — never celebratory/bouncy). Reduced Motion handling is
unchanged (`useReducedMotion`); no screen-specific decorative animation is
defined here — that's a later phase's decision.

## 6. Component primitives

New: `Hairline`, `Section` (`title?`, `tone: "default"|"document"`),
`MetricLine`, `HeroMetric`, `InlineAction` (`tone: "brand"|"quiet"`),
`QuietSurface`, `MarginMark`, `Wordmark`.

Updated in place (same API, same rendered structure, token vocabulary and
a few correctness fixes only — see §9):
`GroupedList`, `MetricCard`, `ScreenContainer`, `SectionLabel`, `Button`,
`Chip`, `SelectableCard`, `DateBlock`, `TrendChart`, `ToggleRow`,
`TextField`, `StepperField`.

### Deprecation stance (not a removal)

`GroupedList` and `MetricCard` are documented in their own file-level doc
comments as **no longer the default** for new screens — `Section` and
`MetricLine`/`HeroMetric` are the replacements — but neither is removed,
broken, or rewritten to look different. Every existing screen using them
renders exactly as before (`docs/DESIGN_REDESIGN_PLAN_2_0.md` §26's
explicit "backward-compatible transition" instruction). `GroupedList`
remains the right choice for content that genuinely needs a boxed/elevated
treatment; `MetricCard` remains available for a genuine multi-card grid
layout. Neither has any real callers yet to migrate — `MetricCard` was
never wired into a screen, and `GroupedList`'s many callers are
intentionally left alone this phase (see §11).

### Selection-control role differentiation (brief §12 audit)

`Chip` (filter/multi-select pill, compact, horizontal-flowing, label-only)
and `SelectableCard` (form-selection, full-width row, icon+caption) share
one selected-state grammar — border + fill + explicit checkmark, never
color alone — but are not interchangeable; see `SelectableCard.tsx`'s own
doc comment for the full role breakdown. Neither is a "segmented control"
(a single mutually-exclusive range picker) — that role has no shared
component yet.

Both were checked against: 44pt touch target (via `AccessibleTouchable`'s
`minHeight`/`minWidth: 44` base style), non-color-only selection (checkmark
glyph, not fill color alone), and long-TR/Dynamic-Type robustness.
`SelectableCard` already passed all three with no layout change needed.
`Chip` did not — see §9.

## 7. Icon system (`src/design-system/icons.ts`)

`Ionicons` remains the technical source (no new icon dependency). Every
icon must be one of `FUNCTIONAL | STATUS | NAVIGATION | BRAND |
DECORATIVE` (full rules in the file's own doc comment). `DOMAIN_ICONS`
gives one outline/filled icon pair per core domain (symptoms, medication,
injection, labs, appointments, timeline, profile) — no icon reused across
unrelated meanings, the specific anti-pattern
`docs/DESIGN_RESEARCH_2_0.md` §3 found (`flask-outline` labeling both CRP
and ESR). Applied to the new navigation shell now; retrofitting existing
screens' own icon choices is deferred to each screen's own redesign phase.
`BRAND` is reserved for `MarginMark` only — no Ionicons glyph (e.g. the
retired `leaf-outline`) stands in for the logo anywhere new.

## 8. The Margin Mark & wordmark

`MarginMark.tsx` — a corner bracket (`M7 5 L7 17 L17 17`) plus a separate
tick (`M10.5 9.5 L15.5 9.5`) in a 24×24 viewBox, built with
`react-native-svg` (already a project dependency via `BodyRegionMap.tsx` —
no new dependency added). Single-color by default (`brandPrimary`); an
`accented` two-tone mode (bracket in `brandPrimary`, tick in `accentRare`)
is reserved for larger marketing-scale contexts. `size`/`color` props for
standalone/inline/at-icon-scale use. Checked against every failure mode
Design-A2 named (does not close into a ring, does not read as a
checkmark/swoosh/smile/plus at reduced size).

`Wordmark.tsx` — mark + "Ilium" in system type (no custom font logo, no
embedded tagline), `variant: "full"|"markOnly"`, `size: "large"|"medium"`.
Both render correctly at all tested sizes in live QA (light mode; see §10
for the dark-mode testing limitation).

**Ilium** is the brand's approved working consumer name
(`docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §1-3) — visible UI only. It has
not been trademark/App-Store-cleared, and this phase touches **no**
technical identifier: `app.json`'s `expo.name` field (currently still
`"Ankilozanapp"`) was deliberately left unchanged. That field sits outside
the brief's explicit deny-list (bundle identifiers, package identifiers,
RevenueCat identifiers, App Store Connect metadata, store listing
configuration) but is genuinely ambiguous — it's the on-device display
name, not strictly a "technical identifier" — and given how emphatic the
brief was about never touching identifiers, the conservative call was to
leave it untouched and flag it explicitly here rather than guess. Confirm
explicitly before changing it.

## 9. App-icon foundation

`assets/brand/app-icon-source.svg` (new) — a 1024×1024 vector: solid
`brandPrimary` (`#AD5335`) field, the Margin Mark in paper cream
(`#FAF7F2`), coordinates a direct proportional scale of
`MarginMark.tsx`'s own path data (not a redrawn shape). Replaces the
previous `assets/icon.png` **conceptually** — that file (and
`android-icon-*.png`) are the unfinished blue/Figma-construction-guide
placeholder (a 3D glossy chevron still sitting inside its Figma icon
template, complete with safe-area guide circles and a crosshair, never
actually exported) and were **not touched**: this environment has no SVG
rasterizer available (no rsvg-convert/inkscape/imagemagick, no `sharp` in
`node_modules`), and installing one solely to export a handful of PNGs is
outside this phase's scope. Per the brief's own instruction, the source
vector is finished and documented rather than faking a placeholder raster.

**Remaining work (mechanical, no further design decisions blocking it)**,
detailed in the SVG file's own header comment:
1. Export the SVG at 1024×1024 → replaces `assets/icon.png` and
   `assets/favicon.png`.
2. Android adaptive icon needs 2 more exports at the same mark
   scale/position: `android-icon-background.png` (the flat-color rect
   alone) and `android-icon-foreground.png` (the mark strokes only, on
   transparent, tightened ~15% further to survive Android's independent
   crop) — plus `android-icon-monochrome.png` (same silhouette, alpha-only,
   for Android 13+ themed icons).
3. `assets/splash-icon.png` is a separate design decision not addressed
   here (Design-C+ scope).

## 10. Navigation shell (`app/(tabs)/_layout.tsx`)

Three visible tabs — Today / Health Record / Appointments
(`docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §8/§12's approved decision).
"Health Record" is a **relabel** of the existing `track` route — the
route file, its path (`/track`), and its internal content are unchanged;
only this layout's `title`/`tabBarLabel` changed. Insights is no longer a
visible tab but its route is **not deleted**: `href: null` hides it from
the tab bar while keeping `/insights` fully navigable — a compensating
"View insights" `InlineAction` was added to the bottom of the Health
Record screen so it stays reachable (see §9 in the next section for the
scroll fix this required). Selected tab state is never color-only — the
icon itself switches from outline to filled glyph (a shape change), color
is the secondary/reinforcing signal. Profile stays a persistent header
icon on every tab, not a 4th tab (unchanged decision from Product 2.0).
Tab bar styling: `surfaceElevated` background, `hairline` top border, no
floating pill, no glassmorphism — restrained native-iOS-style, matching
Warm Precision.

## 11. Live visual QA — findings and fixes

QA was run against the web dev-mock (`?entitlement=entitled` — the
existing, documented, non-real dev-only query param; see
`src/purchases/purchaseClient.web.ts`), light mode, ~390-430px width,
both EN and TR content including deliberately long TR strings, via a new
dev-only showcase route (§12) plus the real Today/Health Record/
Appointments/Insights screens. Three real issues were found and fixed —
recorded here because they're exactly the kind of thing a design-system
pass exists to catch:

1. **`Chip` overflowed the screen edge instead of wrapping** with a long
   TR label. Removing the old fixed `height: 36` (done for the 44pt fix)
   was believed to let the label wrap, but in a `flexWrap: "wrap"` row a
   single item has nothing to shrink against until `flexShrink` is set
   explicitly — an unwrapped `Text` just grew the pill arbitrarily wide.
   Fixed with `flexShrink: 1` on both the pill and the label `Text`, plus
   `flexWrap: "wrap"` on the label. Verified in the browser after the fix.
2. **`ToggleRow`'s "on" thumb rendered teal, not terracotta**, in the web
   preview only. Root cause (confirmed by reading `react-native-web`'s own
   `Switch` source): `react-native-web` reads a separate, untyped
   `activeThumbColor` prop for the on-state thumb — not part of real RN's
   `Switch` API, absent from `@types/react-native` — defaulting to
   Material teal `#009688` when not supplied. Real native `Switch`
   (iOS/Android) has one `thumbColor` for both states, so setting
   `thumbColor` explicitly (done, for a controlled value in every
   environment) is the complete, correct native fix; the web-only teal
   thumb is a rendering artifact of the polyfill with zero effect on the
   real app, left as-is rather than passing an untyped web-only prop.
3. **The Health Record ("Track") screen's new "View insights" link was
   completely unreachable** — confirmed via the accessibility tree, not
   assumed. `ScreenContainer` without `scroll` renders a plain
   non-scrolling `View`; `track.tsx` was the **only** tab screen not
   passing `scroll` (`index.tsx` and `appointments.tsx` both already do).
   The screen's existing content (2 groups, up to 8 rows) already nearly
   filled a typical viewport before this phase; the one line this phase
   added tipped it into a confirmed, provable defect. Fixed by adding
   `scroll` to `track.tsx`'s `<ScreenContainer>` — a one-word, purely
   mechanical prop flip, no layout/content change. Re-verified after the
   fix: the link is reachable by scrolling and correctly navigates to
   `/insights`, preserving the deep link as required.

## 12. Dev-only showcase route

`app/dev/showcase.tsx` (new) — not Storybook, no new dependency: a single
screen rendering the full token set and every shared primitive
(palette swatches, type scale, Margin Mark/Wordmark, buttons, selection
controls, metrics, rows, hairline, quiet surface) against representative
long EN/TR copy. Guarded by `if (!__DEV__) return null;` so a production
build renders nothing even if reached. **Not part of production
navigation** — no tab, button, or link anywhere points to it; reachable
only by navigating to `/dev/showcase` directly in a dev build. It still
passes through the root `RouteGate` like every other route (this file
does not touch entitlement/onboarding gating), so it requires an
onboarded+entitled device/session to render, same as every other screen.

## 13. Accessibility foundation

44pt touch targets: enforced centrally in `AccessibleTouchable`
(`minHeight`/`minWidth: layout.minTouchTarget`, applied as a base style
components' own styles compose on top of — verified this actually clamps
correctly even when a component's own style sets a smaller explicit
`height`, since Yoga treats `minHeight` as a floor). Non-color-only state:
every selected/status control pairs a shape or icon change with color
(tab icons switch outline→filled, `Chip`/`SelectableCard` add a checkmark
glyph, `Switch` uses the thumb's position). Dynamic Type: no
`allowFontScaling={false}` introduced anywhere; `Chip` was specifically
fixed (§11) so a long, at-scale label wraps instead of clipping. VoiceOver
labels: unchanged existing pattern (`accessibilityLabel`/
`accessibilityRole` on every interactive primitive) preserved throughout.
Reduced Motion: unchanged (`useReducedMotion`), no new decorative motion
was introduced this phase.

## 14. Migration / deprecation plan for legacy components

No component was deleted or had its public API changed this phase.
`GroupedList` and `MetricCard` are marked deprecated-as-default (§6) but
fully functional — existing screens do not need to change. The legacy
color-token aliases (§1) exist purely for the transition; they should be
removed once every screen has migrated to the new names, tracked
screen-by-screen as each is actually redesigned (Design-C onward per
`docs/DESIGN_REDESIGN_PLAN_2_0.md` §3's phase plan), not in one mass pass.

### Intentionally deferred (not started this phase)

- **Chip/SelectableCard full unification** into one shared selection
  primitive — deferred to the Check-in/Onboarding redesign phases
  (Design-C/D), reasoned as lower-risk than forcing a cross-cutting
  selection-control rewrite in a phase explicitly scoped to the
  foundation only. Both were audited and lightly fixed (token repointing,
  `Chip`'s wrap fix) but not unified.
- **A segmented-control primitive** (single mutually-exclusive range
  picker, e.g. Appointment Summary's 30/90-day toggle) — no shared
  component exists for this role yet; each screen currently hand-rolls
  its own. Not addressed this phase.
- **Full screen redesigns** of Today, Check-in, Health Record content,
  Timeline content, Appointment screens, Appointment Summary, Insights,
  Profile, Knowledge, onboarding, and the paywall — explicitly out of
  scope for Design-B per the brief. These screens may look partially
  "old" (still using `GroupedList`, `MetricCard`, legacy-named token
  values) — expected and acceptable; the new system was never contorted
  to preserve their old appearance, only their functionality.
- **App-icon raster export** and **splash-icon design** — see §9.
- **Dark-mode live visual QA** — see below.

### Dark mode — verification limitation

Dark-mode *values* are implemented and WCAG-verified (§1). Dark-mode live
*visual* QA in a real device/simulator was **not performed** this phase:
`useTheme`'s own doc comment documents that the web dev preview used for
all this phase's live QA always resolves to light mode regardless of the
host OS's theme (`Platform.OS === "web"` forces `"light"`), so the browser
tooling available in this environment cannot exercise dark mode at all.
This is a pre-existing, documented constraint of the web-preview
workflow, not something this phase introduced or could work around within
it. Dark-mode visual QA on a real iOS/Android build remains an open item.
