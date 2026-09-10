# Visual Art Direction 3.0 — Warm Precision + Human Health Visuality

Status: research + proof-of-concept phase **plus a first careful propagation pass** (still uncommitted, HEAD `fa2d815`). The three proof screens (Knowledge landing, Knowledge article detail, Value Reveal) are implemented and live-QA'd. Propagation across the rest of the app — the mandatory three-level visual-intensity model, per-screen decisions, and the six additive code changes it produced — is specified and recorded in the companion document **`VISUAL_ART_DIRECTION_3_0_PROPAGATION.md`**, which supersedes the forward-looking §16–24 and §20–21 notes below.

## 1. Reference breakdown

**Reference A — "Wellnia" (Dribbble, Nurul Fitriani / Orenji Studio).** Viewed live (not text-scraped — Dribbble is a JS-rendered image gallery, so this was inspected visually via screenshot). Three onboarding/dashboard/booking screens on a warm tan-beige backdrop (~`#E8E0D5`), white cards, a saturated coral-orange accent (~`#F97B3D`, noticeably more saturated than Ilium's muted terracotta), near-black bold headline type, fully-pill-shaped buttons and calendar-day chips, a flat two-tone illustration of a doctor-and-patient pair surrounded by scattered organic shapes (leaves, small medical-object silhouettes) on the login screen, a bar chart with one highlighted bar carrying a small delta tooltip, and compact side-by-side stat cards pairing an icon + sparkline/line-graph + a large number (Heart Rate/Steps).

**Reference B — "Health Tracking Mobile App Design" (Dribbble, Gm Shamim Hossain).** Also inspected visually. Light warm-gray canvas, white raised cards with soft shadow (no hairline borders), one consistent lime-green accent used for every metric (not a good/bad severity signal — just the app's single brand color, applied uniformly), a large semicircular gauge ("40/47 Wellness Results") with a delta badge, a 2×2 grid of compact icon+number+label metric tiles, a "battery"-style segmented horizontal bar meter for a calorie range, a soft two-line sine-wave graphic used purely as ambient decoration behind a weight number (not a real data plot), and a glossy gradient sphere avatar for an AI-chat entry point (a feature Ilium explicitly does not have — noted only for its gradient-sphere *technique*, not adopted as functionality).

## 2. What makes Wellnia feel premium

Not the orange itself — it's the **restraint around it**: the accent appears on exactly one button/one highlighted chart element per screen, everything else is near-black text on warm neutral. Premium perception comes from (a) one confident illustration used exactly once, at real size, not repeated as a decorative motif everywhere, (b) generous, consistent corner rounding read as a single design decision rather than mixed shapes, (c) numbers given real visual weight (bold, large) while their labels stay small and quiet, (d) a warm off-white/tan canvas instead of stark white, which is close to Ilium's own "Paper" instinct already.

## 3. What makes the Health Tracking reference feel premium

Composition discipline: every screen has exactly one dominant visual (the gauge, or the wave graphic) and then a quiet, evenly-spaced grid of small facts underneath — never two competing focal points. The single-accent-color discipline (one green, everywhere, meaning only "this app's brand," never "good vs. bad") is close to Ilium's own existing rule and is worth reinforcing, not importing a new multi-color system. The ambient wave graphic behind the weight number is doing something Ilium currently never does: using a soft, non-literal decorative graphic to add visual interest to a plain number without adding a card or a border.

## 4. What Ilium should borrow conceptually

- One confident hero illustration per screen that needs one (Knowledge landing, Value Reveal, select onboarding/paywall moments) — never a repeated icon motif.
- Real visual weight on numbers/headlines, quiet weight on everything supporting.
- A single ambient decorative graphic (a soft gradient wash, or a restrained wave/line motif) to give a plain content area atmosphere without adding a card.
- Confident, consistent corner-radius language, applied deliberately rather than left at the current small/uniform scale everywhere.
- Compact icon+number+label metric-tile grids as an occasional alternative to a plain list row, where a screen genuinely has several small related facts (not proposed for the health-record surfaces bound by the "no severity/dashboard" rule — see §33/34).

## 5. What Ilium must NOT copy

- The saturated, high-frequency orange of Wellnia — Ilium's muted terracotta stays the one accent; frequency stays low (one accent moment per screen, not one per card).
- Multi-color per-metric coding (red heart / green steps) — Ilium already bans health-value color-coding and this pass does not relax that.
- The AI-chat gradient orb as a *feature* — no AI, no chat, this is out of scope entirely; only the soft-gradient-sphere *rendering technique* is noted as a gradient recipe candidate for a non-AI use (e.g. an ambient hero backdrop).
- Fully-pill buttons everywhere — Ilium's `Button`/`radius.small` language stays; pill shape is reserved for the specific places it already means something (Chip, StiffnessSelector markers).
- Card-grid dashboards — neither reference's composition gets copied wholesale onto Health Record, Labs, or any clinical/report surface. Those stay document-like, per the brief's own explicit instruction.
- Literal screen layouts, copy, iconography, or illustration content from either shot — nothing here is a template to fill in with Ilium's words.

## 6. Revised color system

No existing token was renamed or removed. Ilium's palette already contains two under-used warm accents perfectly suited to an illustration/gradient role — reusing them (rather than inventing new hex values) keeps the system disciplined per the brief's own "premium ≠ more stuff" warning:

| Role | Token | Source |
|---|---|---|
| Canvas | `colors.background` | existing |
| Raised warm surface | `colors.surfaceElevated` | existing |
| Primary ink | `colors.textPrimary` | existing |
| Secondary ink | `colors.textSecondary` | existing |
| Brand accent | `colors.brandPrimary` (terracotta) | existing |
| Brand accent soft | `hexToRgba(colors.brandPrimary, 0.10–0.22)` | derived at render time, same pattern `BodyRegionMap.tsx` already uses |
| Illustration accent A | `colors.brandPrimary` at low alpha | existing token, new *use* |
| Illustration accent B | `colors.accentRare` (dusty gold) at low alpha | existing token, previously reserved for "genuine milestone moments" — an illustration's secondary shape is exactly that kind of rare, deliberate moment, not routine UI |
| Illustration accent C | `colors.positive` (muted sage) at low alpha | existing token — a warm, desaturated green already in the palette, used here as an organic/plant-adjacent illustration tone only, never as a "good" health signal |
| Chart primary/secondary/tertiary | `colors.dataPrimary/Secondary/Tertiary` | existing, unused until now — built for exactly this |

No `symptomSeverity`/good-bad token was added or considered. Pain 10 and Pain 2 remain visually identical, everywhere, unchanged.

## 7. Gradient policy

Exactly three approved recipes, all implemented via `react-native-svg`'s `<LinearGradient>`/`<RadialGradient>` (already a dependency — no new package):

1. **Ambient hero wash** — a very soft radial gradient behind a hero illustration, `brandPrimary` at ~8% alpha fading to transparent. Used on Knowledge's landing hero and Value Reveal's composed-preview backdrop.
2. **Illustration atmosphere fill** — a soft 2-stop linear gradient (`brandPrimary` 12% → `accentRare` 6%) used only *inside* an illustration's own background shape, never behind plain text or a button.
3. **Chart depth** — a very subtle vertical fade under a line-chart's fill area (`dataPrimary` 14% → transparent), reserved for `TrendChart` if a future pass wants it; not applied in this proof pass (Labs/Insights untouched).

Explicitly rejected: gradient buttons, a "health score" gradient, any gradient implying severity, neon/glow effects, generic purple-blue SaaS gradients, gradients on more than one element per screen.

## 8. Illustration system

New, original, hand-authored SVG illustrations (`src/design-system/illustrations/`) — nothing traced, stocked, or downloaded. Style: soft organic geometry (overlapping rounded shapes, gentle curves), a restrained 3-tone palette (paper background + brandPrimary + accentRare, occasionally + positive), no faces, no literal clinical detail, no outlines mimicking a textbook diagram.

- **`HeroBloom`** — an abstract layered-petal/leaf composition used as a hero backdrop motif (Knowledge landing, Value Reveal). Purely decorative, no claimed anatomical meaning.
- **`SpineConcept`** — a simplified, deliberately non-diagnostic silhouette suggesting the spine/pelvis region with the sacroiliac area highlighted as a soft shape, used inline in the "what is AS" article specifically because that article's own content already names that anatomy. Captioned as a simplified concept illustration, not a medical diagram, directly under the visual — see §31.

No other illustrations were built this pass (see §33/34 — everything else stays illustration-free until/unless this direction is approved to propagate).

## 9. Image sourcing / licensing policy

**No external/internet images were sourced, downloaded, or hotlinked this pass.** Every visual shipped is original SVG authored directly in this codebase, so there is no license, attribution, or provenance question to document. This was a deliberate choice, not an oversight: the brief's own instruction is unambiguous — "if licensing is uncertain, do not ship the asset; instead document what original illustration should be created" — and verifying a genuinely reputable, redistributable-in-app medical illustration source (public-domain anatomy diagrams, an open-license medical-illustration library with clear commercial-app terms, etc.) was not something this pass could responsibly complete and verify end-to-end. Original SVG sidesteps the entire risk category while still delivering the requested visual storytelling. If a future pass wants photographic or traditionally-illustrated imagery, that requires its own dedicated sourcing/licensing task before any asset ships.

## 10. Typography evolution

No existing tier renamed. `typography.display` (34pt/700) already exists and now gets real use as the Knowledge/Value-Reveal hero headline tier (previously mostly unused). No new size tier was added — the existing scale, applied with more editorial confidence (larger hero moments, tighter standfirst line-height, more generous paragraph spacing in article bodies) achieves the "distinctive" goal without a token proliferation.

## 11. Surface/depth system

Depth is created through **composition**, not new card containers, matching the brief's explicit "do not regress" instruction:
- One soft ambient gradient wash behind a hero illustration (never behind text or a list).
- The illustration itself sits directly on the canvas, unmasked by any card edge.
- `QuietSurface` is reused, not duplicated, for the one place this pass needed a genuinely contained block (Value Reveal's composed-preview panel — matching its existing "single truthful product preview" precedent from the Paywall).
- No new bordered container component was created.

## 12. Chart language

Not touched this pass (Labs/Insights are out of scope for the three proof screens) — `colors.dataPrimary/Secondary/Tertiary` and the "chart depth" gradient recipe (§7) are reserved and documented for a future pass, not applied yet.

## 13. Icon language

Unchanged from the Design-I icon audit's standing rule: icons carry function or navigation meaning only. No new decorative icon was added anywhere in this pass — the illustration system replaces the role a decorative icon might otherwise have tried to fill.

## 14. Motion system

Five new named roles added to `src/design-system/tokens/motion.ts` (additive — nothing removed): `micro` (100–140ms), `selection` (140–200ms), `contentEnter` (220–320ms), `surfaceTransition` (180–320ms, alias of the existing `tier2Transition` range), `heroEnter` (300–600ms, alias of the existing `tier3Moment` range). Same philosophy as the existing tiers: quick, functional, never celebratory; every use collapses to an instant state change under Reduce Motion (verified in the three proof screens — see §20/§21).

## 15. Image treatment

All illustrations render at a fixed aspect ratio appropriate to their placement (Knowledge hero: wide, ~16:10; inline article visual: square-ish ~4:3), left-aligned to the screen's existing horizontal padding (no full-bleed), no drop shadow, no card frame around the illustration itself, a small italic caption directly beneath any illustration that could be mistaken for a literal diagram (`SpineConcept` only). Dark mode: illustrations use theme-token colors exclusively (no hardcoded hex), so they repaint automatically — not live-verified (web preview forces light mode; same standing limitation as every prior phase).

## 16–19, 22–24 — Knowledge / third-screen / onboarding / paywall / profile visual strategy

**Superseded by `VISUAL_ART_DIRECTION_3_0_PROPAGATION.md`.** Summary of what the propagation pass decided:
- **Paywall** (Level 1) — gained one decorative `HeroBloom variant="dawn"` strip; every commercial element unchanged (PROPAGATION §3).
- **Knowledge article** — hero composition now varies by category via three `HeroBloom` variants (PROPAGATION §7).
- **Onboarding** — `welcome` deliberately keeps its Wordmark-only treatment; `value-reveal` remains the one onboarding screen carrying the atmosphere motif (PROPAGATION §7). Other onboarding steps stay data-entry-first.
- **Profile** — explicitly untouched: no HeroBloom, no illustration, stays quiet (PROPAGATION §1 Level 3, §16).
- **Nutrition / Breathing** (Level 1.5) — one decorative `HeroBloom` strip each (PROPAGATION §8).

## 20–21 — Today / Check-in / Health Record / Appointment visual strategy

**Superseded by `VISUAL_ART_DIRECTION_3_0_PROPAGATION.md` §6.** All four assessed as already at the correct intensity and kept restrained with **no code change**: Today and Health Record landing are Level 2 utility (no hero, no entrance animation — a fade would be a tax on every open); Timeline and Appointments are Level 3 document surfaces (rail and date typography are already their identity). Check-in's three selector files remain frozen; the visual-finish items (soft thumb shadow, faint silhouette atmosphere, more tactile categorical-list transition) are specified in PROPAGATION §6 and flagged as needing the freeze explicitly lifted first.

## 25. Accessibility

Every new illustration is `accessibilityElementsHidden`/decorative-only where it adds no information beyond the adjacent text (Knowledge hero, Value Reveal backdrop) — screen readers skip straight to the real heading. `SpineConcept` (the one illustration carrying genuine supplementary meaning) has a real `accessibilityLabel` describing what it shows in words. All new interactive elements (featured-article card, topic chips) verified at 44pt minimum. Text contrast unchanged — no new color was used for a text/background pairing that hadn't already been WCAG-verified as an existing token.

## 26. Dark mode

Token-level only — every new illustration and gradient reads from theme colors, so it repaints correctly in principle. **Not live-verified** (web preview forces light mode).

## 27. Asset inventory

| Surface | Classification |
|---|---|
| Knowledge landing hero | NEEDS ORIGINAL ILLUSTRATION → `HeroBloom` (built) |
| Knowledge featured-article card | NO IMAGE NEEDED (typography/composition only) |
| Knowledge topic chips | NO IMAGE NEEDED |
| "What is AS" article inline visual | NEEDS ORIGINAL ILLUSTRATION → `SpineConcept` (built) |
| Other 11 Knowledge articles | NO IMAGE NEEDED this pass (only the one proof article was touched) |
| Value Reveal composed preview | NEEDS ORIGINAL ILLUSTRATION → `HeroBloom` (reused) + DATA VISUALIZATION (existing `MetricLine`-family presentation of real user answers) |
| Today | BRAND MOTIF, not built this pass (see §20–21) |
| Check-in | NO IMAGE NEEDED (functionally frozen) |
| Health Record / Labs / Insights | DATA VISUALIZATION only, not touched this pass |
| Appointments | NO IMAGE NEEDED (document-like, unchanged) |
| Onboarding / Paywall / Profile | NOT EVALUATED this pass — deferred |
