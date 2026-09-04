# Design Research 2.0 — Full Product Design + Brand Reset

Status: **Research only. Nothing in this document has been implemented.** Produced per Furkan's Phase DESIGN-A brief. Companion documents: `docs/BRAND_NAMING_STRATEGY_2_0.md`, `docs/DESIGN_DIRECTION_2_0.md`, `docs/DESIGN_REDESIGN_PLAN_2_0.md`.

This document has two halves, deliberately kept separate:

- **Part A — Current App Audit** (§1-§4): a screen-by-screen, evidence-based audit of the app as it exists today, and a concrete diagnosis of exactly which patterns produce the "template/AI-generated" feeling. Written directly from the current codebase (every claim below is grounded in a real file, not a general impression).
- **Part B — External Reference Research** (§5-§11): findings from three parallel research passes into competitor products, brand/naming strategy, and icon/accessibility/interaction patterns, synthesized here with source attribution.

---

## PART A — CURRENT APP AUDIT

## 1. Current visual system, as built

Read directly from `src/design-system/tokens/*.ts`, the single source of truth for the app's entire visual language today.

**Color** (`tokens/colors.ts`): `backgroundWarm #FBFAF8`, `surface #FFFFFF`, `surfaceSecondary #F5F4F1`, `surfaceHighlight #E8F5EF` (pale mint, reserved for one highlight per screen), `textPrimary #1C1C1E`, `textSecondary #6E6E73`, `borderHairline #E5E3DF`, `accent #0A8F68` (a mid-saturation forest/emerald green), plus status success/warning/danger/neutral. Dark mode mirrors the same roles. This is a coherent, disciplined token system — the *problem* is not internal inconsistency, it's that the palette itself (warm off-white + white cards + emerald-green accent) is the single most common visual signature in the consumer wellness category (see §5-§7): it reads as "a health app," not as *this* health app.

**Typography** (`tokens/typography.ts`): pure system font (SF Pro via Dynamic Type), seven tiers (`display 34/700`, `metricLarge 32/700`, `title 28/600`, `headline 18/600`, `body 17/400`, `caption 13/400`, `micro 12/400`). No custom or distinctive typographic voice anywhere — every number, every heading, every label uses the same font family a thousand other Expo/React-Native apps use unmodified.

**Radius** (`tokens/radius.ts`): 12/16/20pt, "intentionally small/restrained." In practice, every single grouped section in the app (see §2) uses `radius.standard` (16) with a 1px `borderHairline` border AND a `surface` background fill — three simultaneous framing devices, applied identically, on nearly every screen.

**Spacing** (`tokens/spacing.ts`): a clean 4pt-based scale (4/8/12/16/20/24/32). Well-formed, unremarkable.

**Components** (`src/design-system/components/`): `Button`, `Chip`, `SelectableCard`, `ListRow`, `GroupedList`, `MetricCard`, `StepperField`, `TextField`, `ToggleRow`, `DateBlock`, `SectionLabel`, `TrendChart`, `ScreenContainer`, `AccessibleTouchable`. Notably: **`Chip` and `SelectableCard` are visually identical selection languages** (border color + fill + explicit checkmark glyph on selection) at two different sizes — the app effectively has one selection pattern, reused everywhere from onboarding goal-picking to check-in body areas to Appointment Summary's range selector. There is no illustration system, no custom iconography, no photography, no motion system beyond token *definitions* (`tokens/motion.ts` defines duration tiers but almost nothing in the app visibly animates beyond default navigation transitions) — the entire visual vocabulary is: system type, one accent green, white rounded-bordered containers, and Ionicons glyphs.

**Iconography**: every icon in the app (confirmed across Today, Track, Timeline, Check-in, Appointments, Insights, Profile, onboarding) is a stock `Ionicons` `*-outline`/filled glyph. None are custom. Several are reused across unrelated meanings — `flask-outline` labels *both* CRP and ESR lab rows on Insights (`app/(tabs)/insights.tsx`) with no way to visually tell the two apart except reading the text; `leaf-outline` appears as the onboarding-welcome "brand" icon (`app/onboarding/welcome.tsx`), as the Paywall's own brand mark (`app/paywall.tsx`), *and* as the Track tab's "Breathing" row icon (`app/(tabs)/track.tsx`) — three unrelated uses of the same generic wellness-leaf glyph, one of which is standing in for an actual logo.

**App icon** (`assets/icon.png`): a blue gradient chevron/"Λ" shape inside a rounded square, on a pale-blue background, still showing Figma-style construction guides (concentric circles, crosshairs, dashed alignment lines) baked into the exported PNG — i.e. the shipped icon asset is an unfinished design-tool export, not a resolved mark. It is also **blue**, while the entire rest of the app's identity is green — the app icon does not even match the in-app accent color. `app.json` sets `name: "Ankilozanapp"`, `slug: "ankilozanapp"`, no `ios.bundleIdentifier`/`android.package` configured yet (confirms no App Store/EAS work has happened, consistent with every prior phase's "do not run EAS" instruction).

## 2. Screen-by-screen audit

Legend: **KEEP** (structure/content stays, cosmetic-only pass) · **CHANGE** (keep function, meaningfully restyle) · **REMOVE** (delete as a distinct destination) · **MERGE** (fold into another screen) · **REDESIGN** (rethink from the interaction up, function may stay, presentation does not).

### Welcome / Onboarding

| Screen | Verdict | Why |
|---|---|---|
| Welcome | **REDESIGN** | `app/onboarding/welcome.tsx`: a 56×56 rounded circle holding a generic `leaf-outline` icon, an accent-colored "eyebrow" label, a centered `display`-size headline, one supporting sentence, one button — inside a `justifyContent:"center"` flex column. This is the single most generic "hero onboarding screen" template shape that exists; it is the app's very first impression and currently carries zero brand identity beyond a stock icon-font glyph. |
| Privacy | **CHANGE** | Same skeletal pattern family (title/body/continue) by construction — a trust moment deserves more specific, less templated treatment, but the *content* (a local-first data explanation) is right and should not disappear. |
| Goals | **CHANGE** | `app/onboarding/goals.tsx`: title + supporting sentence + a vertical stack of `SelectableCard`s + Continue. Functionally sound (max-3 multi-select, nothing pre-checked); visually indistinguishable from every other onboarding multi-select screen that follows it. |
| Priority Symptoms | **MERGE candidate** | Same `SelectableCard`-list template as Goals, one step later, asking a conceptually adjacent question ("what matters to you" twice in a row, once framed as goals and once as symptoms). Strong candidate to fold into one combined "what should we focus on" moment. |
| Body Regions | **REDESIGN** | `app/onboarding/body-regions.tsx` uses a **flat wrapping `Chip` list of 7 text labels** — explicitly documented in its own code comment as a deliberate placeholder ("if implementing the illustration would force architecture/assets beyond Phase N, use a polished simplified selector and report the limitation"). The *real* check-in already has an actual illustrated SVG body silhouette (`BodyRegionMap.tsx`, §4 below). Onboarding never got it. This is a concrete, already-flagged gap: the redesign should almost certainly reuse the real body map here instead of a text-chip stand-in. |
| Treatment Context | **MERGE candidate** | A single branching question; a good candidate to fold into the same combined step as Goals/Priority Symptoms rather than its own full screen. |
| Medication setup / Injection setup | **CHANGE** | Real, necessary functional forms (only shown when relevant per Treatment Context). Keep the forms; consider progressive disclosure/inline setup rather than dedicated full-screen detours. |
| Reminders | **MERGE candidate** | A standalone step for something that could plausibly live inline with medication/injection setup instead of its own screen. |
| Appointment setup | **KEEP/CHANGE** | Optional, low-friction, appropriately placed. Cosmetic pass only. |
| Personalized Summary | **MERGE** | `app/onboarding/personalized-summary.tsx` (step 10): title + `ListRow`s of "what we set up." |
| Value Reveal | **MERGE** | `app/onboarding/value-reveal.tsx` (step 11): title + `ListRow`s of "outcomes," same shape, same purpose ("here's what we understood about you"), immediately after Personalized Summary. **These two screens are functionally near-duplicates** — same title+list+button template, same "reflect back what the user told us" job, one step apart. Strong, well-evidenced case to merge into a single moment before Paywall. |
| Paywall | **REDESIGN presentation only** | See §3 for the specific critique. Hard-paywall/RevenueCat architecture, annual-primary-with-trial + monthly-secondary business model are **not** in scope to change (per brief §18) — only how it looks and reads. |

11 onboarding steps + Paywall today (`OnboardingProgress` goes up to `step={11}`). The Personalized-Summary/Value-Reveal merge alone removes one; Priority-Symptoms/Treatment-Context folding into Goals is a second, larger consolidation opportunity; Reminders folding into treatment setup is a third. A realistic redesigned sequence could plausibly run 6-8 steps instead of 11, without losing any data currently collected.

### Core

| Screen | Verdict | Why |
|---|---|---|
| Today | **REDESIGN** | Currently: greeting line, headline question, subheadline, date, a highlighted check-in card (or a 3-up `MetricCard` row once completed), then a sequence of independently-personalization-ordered `GroupedList` sections (due medications, next injection, upcoming appointment, supportive content, recent 7-day summary) — a vertically stacked feature list, not a designed hierarchy. See §10 of the Design Direction doc for the proposed rethink. |
| Check-in | **REDESIGN** | Pain/Fatigue as discrete-step scales, Stiffness as a 5-option grid of bordered cards, an always-visible High-Symptom-Day `ToggleRow`, an optional-disclosure section (Wellbeing chips, Body Map, Note). Functionally excellent and already carries real safety discipline (§4 below); visually it is five different control types stacked in sequence with no single tactile "this is one interaction" feeling. |
| High-Symptom Day | **KEEP semantics, CHANGE presentation** | The explicit-only, never-inferred toggle semantics (Phase Y) are exactly right and must not change. Only its visual presentation is part of the Check-in redesign. |

### Track

| Screen | Verdict | Why |
|---|---|---|
| Track (landing) | **REDESIGN** | `app/(tabs)/track.tsx`: one `GroupedList` of five equal-weight `ListRow`s (Symptoms, Medications, Injections, Labs, **Timeline**) followed by a second "subordinate" `GroupedList` (Knowledge, Nutrition, Breathing). Timeline — the app's most distinctive, most recently built, most narratively rich surface — is rendered as *one more list row with a generic `time-outline` icon*, exactly the same visual weight as "Labs." This is the clearest single example in the whole app of a "feature directory" screen the brief explicitly warns against. |
| Symptoms (history list) | **REMOVE/MERGE into Timeline** | `app/symptoms/index.tsx` is a flat chronological list of check-ins — functionally superseded by Timeline, which already shows the same check-ins (plus every other event type) in a richer, better-considered presentation. Phase Y's own decision record already noted "Timeline already exists as the purpose-built historical presentation" when declining to add a High-Symptom-Day marker here. Recommend retiring this as a separate destination once Timeline is promoted to Track's anchor. |
| Medications / Injections / Labs (list + detail) | **CHANGE** | Straightforward, functional list/detail screens (`app/medications/index.tsx` et al. — title, `GroupedList` of active items, subordinate archived group, secondary Add button). Keep the structure; restyle to the new system. |
| Knowledge / Nutrition / Breathing | **CHANGE** | Already correctly kept visually subordinate (`emphasis="subordinate"` on their `GroupedList`) — the *instinct* is right, the execution (plain list rows) is generic. |

### Product 2.1

| Screen | Verdict | Why |
|---|---|---|
| My AS Timeline | **REDESIGN (evolve further)** | Phase X already deliberately avoided a dense-card treatment (month/day grouping, `ListRow`s inside a plain `GroupedList` per day) — a real improvement over the rest of the app, but still container-bound: every day is its own bordered white box. The brief's ambition (§14: "continuous vertical chronology... typography-driven hierarchy... not a database event log") asks for something further — fewer containers, more editorial rhythm. This should become the product's signature surface, not just its best-behaved one. |

### Appointments

| Screen | Verdict | Why |
|---|---|---|
| Appointments (list) | **CHANGE** | Standard upcoming/past grouped lists. Restyle only. |
| Appointment Detail | **CHANGE** | Standard detail rows + conditional Prepare button. Restyle only. |
| Appointment Preparation (`/prepare`) | **MERGE candidate with Appointment Summary** | This screen predates Phase W/Z and computes its own separate appointment-relative lookback window (`resolveAppointmentPreparationLookback`) with its own separate symptom/treatment/lab aggregation calls — a genuinely parallel, older implementation of almost the same idea Appointment Summary (Phase Z) now does properly on the deterministic Phase W foundation, plus it's the only place in the app that surfaces free-text notes back to the user. Two screens, two lookback philosophies, reached from the same appointment, one step apart — this is real architectural and UX duplication, not just a visual inconsistency. The Before/During/After model (brief §15) is a natural home to resolve this: fold Prepare's unique value (notes surfacing, the "since your last visit" framing) into a single, redesigned "Before" experience built on Appointment Summary's already-correct data foundation, rather than maintaining two parallel screens. |
| Appointment Summary | **REDESIGN** | Already deterministic and safety-disciplined (Phase Z); presentation is currently the same `GroupedList`/`ListRow`/`Chip` vocabulary as everything else. This is exactly the screen the brief wants to feel like "a genuinely useful editorial report," and currently it doesn't read as meaningfully different from the Medications list. |

### Insights

| Screen | Verdict | Why |
|---|---|---|
| Insights (landing) | **REDESIGN** | `app/(tabs)/insights.tsx` is a single flat `GroupedList` of 7 `ListRow`s (Pain, Stiffness, Fatigue, Medication adherence, Injection history, CRP, ESR), each just a label + one-line text summary + chevron, with **no data visualization on the landing screen at all** — for a tab literally named "Insights." `TrendChart` exists in the design system but is only reachable one tap deeper, on the per-metric detail screen. This is a settings-menu wearing an Insights label. |

### Account

| Screen | Verdict | Why |
|---|---|---|
| Profile / Settings sub-screens | **KEEP structure, CHANGE cosmetics** | `app/profile/index.tsx` and its children are a correctly plain, native iOS-style settings list — this is the *one* place in the app where the "flat list of rows" pattern is actually the right pattern, not a symptom of genericness. Only the icon/type/color pass needs to change here, not the structure. |

## 3. Why the app feels AI-generated / template-like — concrete diagnosis

Every item below is observed directly in the current implementation, not inferred generically.

1. **Endless rounded white cards.** `GroupedList` (`src/design-system/components/GroupedList.tsx`) applies `backgroundColor: surface` + `borderWidth: 1` + `borderColor: borderHairline` + `borderRadius: 16` to every grouped section, and it is used on nearly every screen in the app (Track, Medications, Injections, Labs, Insights, Profile, Timeline's per-day groups, Appointment Summary's every section, onboarding's setup lists). The exact same triple-framed container repeats dozens of times per user session.
2. **Icon + heading + paragraph, repeated everywhere.** Welcome's icon-circle-eyebrow-title-body block is the same shape as half of onboarding.
3. **Excessive helper copy.** Nearly every screen carries a `textSecondary` caption-size subtitle directly beneath its title that restates the obvious ("Your health history" under Track's own title, "See how your recorded values change over time" under Insights) — text doing a job layout/typography should be doing.
4. **Generic green accent.** `#0A8F68` is a textbook "wellness app green," visually indistinguishable from dozens of category peers (§5-§7).
5. **No generic wellness gradients** are currently used, but the icon (§1) *is* a generic blue gradient shape — the one place a gradient exists in the whole product, it's on the single most important brand asset, and it's unresolved.
6. **Excessive pill/chip controls.** `Chip` is the range selector on both Insights and Appointment Summary, the multi-select control across four onboarding screens, and the body-area picker in check-in — visually correct and accessible, but it is the *only* selection language the whole app has, so it appears constantly.
7. **Centered onboarding copy.** Welcome and Value Reveal both center their content vertically inside a plain flex column — the most default possible "hero screen" composition.
8. **No sparkle/star/emoji imagery currently exists** — worth noting as its own finding: the app has **zero illustration, imagery, or custom graphic content anywhere**. There is nothing to look at except type, icons, and boxes, which itself compounds every other pattern below.
9. **Excessive whitespace** is not really the problem here — density is closer to correct — but **identical screen compositions** are: title → subtitle → GroupedList → GroupedList → (button) is the shape of Track, Medications, Injections, Labs, Insights, Profile, and most of onboarding, in that order, every time.
10. **Generic metric cards.** `MetricCard` (Today's Pain/Stiffness/Fatigue 3-up row) is a small bordered box with a caption label, a big number, and an optional unit — structurally identical to any fitness-tracker or analytics-app stat tile.
11. **Dashboard-like grids** appear specifically in Today's 3-up metric row and would appear more if Insights ever added visualization without care.
12. **Repetitive CTAs.** "Continue" is the button label on essentially every onboarding screen with zero differentiation screen to screen.
13. **Repeated "personalized for you" language.** The literal string key `personalization.forYou` ("For you"/"Senin için") is reused verbatim as a small accent-colored eyebrow both on Today's promoted section and on Track's Knowledge row — a very characteristic AI-product tic (telling the user something is "for them" instead of the design simply making it obviously, contextually relevant).
14. **Too many borders/containers**, restated precisely: `GroupedList` alone accounts for the large majority of every screen's visual framing, applied with zero variation in weight or treatment regardless of whether the content inside is a single critical fact or a list of six interchangeable settings rows.
15. **Default-looking Ionicons usage**, restated precisely: literally every icon in the product is an unmodified stock Ionicons glyph, several reused across meanings that have nothing to do with each other (`flask-outline` for two different lab markers; `leaf-outline` as onboarding's brand mark, the paywall's brand mark, *and* the Breathing row icon).
16. **Default-looking navigation chrome.** `app/(tabs)/_layout.tsx` uses the stock Expo Router `<Tabs>` component with default header/tab-bar styling (a settings-gear header-right button, standard `tabBarActiveTintColor`/`tabBarInactiveTintColor`) — nothing about the navigation shell signals a considered, branded product.
17. **Feature-directory screens.** Track and Insights — two of the app's four primary tabs — are both, structurally, "a list of links to sub-features." A screenshot of either, with the app's name blurred out, would be indistinguishable from a settings menu.
18. **Lack of visual signature.** There is no single shape, motif, typographic treatment, or color combination anywhere in the product that a user would recognize as *this app* out of context. Every screen could be re-skinned into a different Expo-template health app by swapping the token file alone — nothing structural would need to change.

## 4. Chronic-illness-specific findings (from the current codebase)

- **The safety discipline is genuinely strong and must be preserved exactly.** No screen anywhere infers a "flare," no numeric average is ever displayed without a real sample-size check (`sufficientData` gating throughout `domain/insights`/`domain/healthSummary`), body-area/stiffness data is presented as honest counts/distributions rather than fabricated severity, and High-Symptom Day is explicit-only by construction (Phase Y). This is a real competitive asset the redesign must not weaken while chasing visual ambition.
- **The Body Map** (`BodyRegionMap.tsx`) is already a real, licensed anatomical silhouette (Wikimedia Commons, sourced in `docs/ASSET_SOURCES.md`) with SVG ellipse region-highlights rather than sticker-like rectangles — a genuinely above-average execution already. It is a strong candidate to *refine* (line weight, color, proportions matched to a new brand) rather than replace wholesale, and to *reuse* in onboarding's Body Regions step where it is currently absent.
- **Daily-use, low-energy context.** Every core interaction (Check-in especially) is designed to be reachable and completable one-handed, with discrete/steppable controls rather than free-drag sliders (`StepperField`'s explicit accessibility rationale), which is directly appropriate for a user with morning stiffness or reduced dexterity — this instinct should carry forward, not be lost to a "bolder" visual redesign that reintroduces fussier controls.

---

## PART B — EXTERNAL REFERENCE RESEARCH

*(Synthesized from three parallel research passes — competitor/reference design research, naming/ASO research, and icon/accessibility/interaction-pattern research. Full findings live in `docs/BRAND_NAMING_STRATEGY_2_0.md` for naming/ASO; the design-facing findings are synthesized below and carried forward into `docs/DESIGN_DIRECTION_2_0.md`.)*

## 5. Reference products studied, with sources

**Sources actually consulted** (named so claims below are traceable, not generic design-blog paraphrase): ouraring.com's own "Introducing the New Oura App Design" post; liveworksleep.com's third-party detail on Oura's 5→3 tab consolidation; Instrument.com and museaward.com on Oura's brand identity; Apple Developer's official "Behind the Design: Headspace" case study; itsnicethat.com's Italic Studio rebrand writeup; Kimp.io on Headspace's color family; Studio Output/Transform Magazine on Calm's rebrand; 1000logos.net and mobbin.com for Calm; Flo Health's own Medium "Flo design system: Part 1" plus raw.studio/readymag coverage; makevisible.com (Visible's own site) plus Wikipedia/TechCrunch/MIT Technology Review coverage; bearable.app's own site and App Store listing plus choosingtherapy.com's review; flaredown.com's own site; careclinic.io; the App Store listings for **AS Log: Ankylosing Spondylitis** (id6756754942) and **Hurtl: Pain & Symptom Tracker** (id6769785685) — the two AS/axSpA-specific apps found; welltheory.com and Forbes coverage; the JMIR mHealth 2021 study and healthify.nz listing for Manage My Pain; Apple Newsroom's 2024/2025 Apple Design Award announcements; sketch.com's "How Gentler Streak brings kindness to fitness" and screensdesign.com's UI breakdown; the Hopelab "Mood Meter" case study, Yale Medicine, and Grokipedia for How We Feel; Apple's own Human Interface Guidelines (Color, and Accessibility sections); JMIR Human Factors 2022 on mHealth dexterity-impairment design; WHOOP's own public Brand & Design Guidelines PDF and 925studios' WHOOP design breakdown; Brandfetch for Flo/Oura/WHOOP assets; and Apple Developer's "Behind the Design: Gentler Streak" feature with 9to5mac coverage. Where a claim below rests on a secondary/aggregator source rather than a primary one, or is original synthesis rather than a sourced fact, it is flagged inline.

### Apple Health
Utility-first, deliberately unbranded — it borrows systemwide iOS conventions rather than asserting its own personality, which *is* its design statement (restraint reads as trustworthy for a data-of-record product). Each health category gets its own accent color as a **wayfinding/category key, never a severity judgment** — the single most directly transferable color-discipline lesson for this project. Data presentation is dense, plain, numeric; no gamification, no illustration.

### Oura
Premium, quiet, earthy — explicitly built to differentiate from cheaper wearables (a stated, publicized brand rationale, not just aesthetic preference). Typography described as "quiet and reductive." Second-gen palette drawn from natural/earthy tones and "the calmness of sleep," not a stock wellness green. **Directly relevant precedent**: Oura consolidated its navigation from **5 tabs down to 3** (Today/Vitals/My Health) because feature growth had made the app "confusingly laid out" — a real, recent (2024), documented case of a mature health app *simplifying* its IA as it matured, not adding tabs. Its Today tab surfaces one dynamic "Big Thing" rather than a grid of equal-weight metric cards. Backgrounds use atmospheric natural-landscape imagery behind data, breaking up card-on-white monotony without literal illustration clutter.

### Visible (long-COVID/chronic-fatigue pacing app)
The closest category analog found. Deliberately *not* fitness-app coded ("designed to support rest and pacing, not workouts"). Core mechanic: a single **Pace Score** (1-10, banded into push/steady/rest guidance zones) replacing a multi-metric dashboard with one plain-language actionable signal — framed as *guidance*, never a diagnostic or severity score, which is directly compatible with this product's own no-severity-score constraint. Structured around verbs (Plan/Pace/Prioritize/Progress) rather than nouns (Data/Charts/Log) — invented its own vocabulary ("pacing") rather than reusing fitness-app language, a deliberate category-ownership move.

### Bearable
A useful **negative** reference: broad chronic-illness/symptom-tracking feature set (900,000+ users claimed), explicitly markets 200% text scaling, dark mode, and reduced motion as product features — but recent user sentiment is split, with some reviewers calling it "clean and minimalist" and others "feels kinda bland." This is the clearest evidence in this research that **feature completeness alone does not produce a premium feel** — the gap is specifically typographic/illustrative distinctiveness and color restraint, exactly the audit finding in Part A of this document.

### Flo
Deliberately monochromatic (black/white/grayscale) base "to create a sophisticated, unobtrusive canvas," with **one** mint-green accent doing all the emotional work ("energy and movement"). System fonts only (SF Pro/Roboto — the same starting point this product already uses) across a disciplined, documented 14-style type scale, with build-time verification tooling to guarantee design-to-code fidelity. Proves a system-font-only approach can read as premium *if the token discipline is rigorous* — directly relevant since a bespoke typeface is not being recommended for this project (see §9).

### Headspace
The orange smiley has a real symbolic origin (Buddhist saffron-robe color) and evolved into a full expressive range (stress/sadness/contentment), not a single static mascot. Commissioned a **custom typeface** (Colophon Foundry, based on Aperçu) whose letterforms were engineered to echo the mark's smile-curve and to "flex from playful to clinical" as the company expanded into serious healthcare partnerships — the strongest example found of type-as-brand-device, but justified by a specific, expensive strategic need (credibility range for enterprise healthcare deals) disproportionate to this project's current stage (see §9's recommendation against a full bespoke commission right now).

### Calm
Brand character described via three words — "irreverent, bullish, empathetic" — an unusually assertive self-description for a meditation brand, deliberately avoiding purely saccharine calm-app tropes. Blue-dominant palette used flexibly (bold for marketing, muted in-product). Wordmark carries brand personality through soft, rounded, handwriting-adjacent lettering, kept separate from in-product body type.

### Gentler Streak (Apple Design Award, Social Impact, 2024)
The single most transferable tone precedent found for this product. An explicit reaction against competitive fitness-app norms: "individual progression rather than comparison against others," with a **stated, named copy policy** — never say "underperforming"; a bad/rest day is labeled factually ("Below Typical Thursday"), and a true rest day, a light stretch, or a slow walk all keep a streak alive rather than breaking it. Built around an illustrated character ("Yorhart") commissioned specifically as narrator, not decoration. Soft blues/greens, calming rather than saturated fitness-app energy. This maps directly onto AS: a high-pain, high-stiffness morning is a fact about the body that day, never a "failure" the product should imply through red color, broken streaks, or judgmental copy.

### How We Feel (Yale Center for Emotional Intelligence / Hopelab)
Its signature interaction — a four-quadrant, color-coded "Mood Meter" grid with 100+ nuanced emotion labels, color deepening with intensity — is the strongest evidence found that **a daily check-in interaction can itself be an ownable, memorable visual signature**, rather than a generic slider repeated for every field. Directly suggests a spatial/grid-based check-in interaction (e.g., mapping two real dimensions such as pain intensity × body location, or a symptom-and-duration grid) as a genuinely differentiated alternative to a stack of sliders.

### CareClinic, Flaredown, WellTheory, Manage My Pain (general chronic-illness/pain trackers)
CareClinic's "Body Symptom Mapper" (tap-on-anatomical-diagram entry) directly parallels this product's existing body-region picker and leads with cross-variable *correlation* as its core value, not raw logging. Flaredown is patient-built and frames tracking as agency/insight ("Decode your chronic illness") rather than surveillance. WellTheory's autoimmune-specific (not generic-wellness) positioning, and Manage My Pain's prepopulated-option-plus-custom-value entry pattern, are both useful precedents. **Collectively, none of these were found to have a distinctive visual identity** in available sources — they read as function-forward, form-neutral, reinforcing the same "features without craft" gap Bearable demonstrates.

### AS/axSpA-specific apps found — AS Log and Hurtl
Both are small/solo-developer clinical utilities (BASDAI/RAPID3/DAPSA/WOMAC score automation, PDF appointment reports, JSON export). **Neither shows evidence of a distinctive visual brand.** This is itself the most important competitive finding in this whole research pass: **the AS/axSpA category is real but visually undifferentiated — a genuine white-space opportunity.** No AS-specific product currently does for this category what Oura does for sleep/recovery or what Gentler Streak does for fitness: build an identity a patient would feel good being seen using, with a tone that treats them as a person. A well-designed AS-specific brand would very likely have **no direct aesthetic competitor** in its own category today.

### Apple Design Award pattern, 2024-2025 (health/wellness)
Winners and finalists in this window (Gentler Streak, Speechify, How We Feel, Ahead, Opal) were rewarded specifically for **tone and inclusivity discipline** — non-comparative framing, accessibility shipped as a real feature — over pure visual maximalism. Award-caliber health design in this period is judged on how the product treats the user, not just how it looks.

## 6. Cross-cutting design principles (recurring, mechanical — what a template app typically skips)

1. **One accent color with a named emotional job**, never a decorative palette. Flo's mint = "energy and movement" against monochrome; Headspace's orange has a real symbolic origin. A template picks "a nice green" with no stated reason.
2. **Category color, never severity color.** Apple Health colors by health *domain* as a wayfinding key, never as a red/yellow/green judgment on a value — directly enforceable as a rule for this product.
3. **One dominant daily signal, not a grid of equal-weight stat tiles.** Oura's "One Big Thing" and Visible's single Pace Score both replace a wall of metric cards with an editorial choice about what matters *today*.
4. **Type doing structural work.** Flo's documented, build-verified 14-style scale; Headspace's letterforms literally referencing the brand mark.
5. **IA that gets simplified as features grow**, not expanded — Oura's 5→3 tab consolidation is the direct, recent precedent.
6. **A stated, named copy policy**, not generic warm tone — Gentler Streak's "never say underperforming" rule is an actual documented decision, not a vibe.
7. **Vocabulary invention.** "Pace Score"/"pacing" (Visible) signals a product with its own point of view rather than inherited fitness/medical language.
8. **A signature interaction**, not a slider reused for every input — How We Feel's spatial grid.
9. **Atmosphere behind data**, not white-card-on-white-background everywhere — Oura's natural-landscape backdrops.
10. **Accessibility marketed as a feature**, not a silent default — Bearable explicitly lists 200% text scaling, dark mode, reduced motion in its own App Store description.
11. **Decisions justified against a real business/trust problem, stated publicly** — Headspace's type commission justified by needing to "flex from playful to clinical" for healthcare partnerships; Oura's brand explicitly justified by needing differentiation from cheaper wearables.

### Anti-pattern table: how strong references specifically avoid what this app currently does

| Anti-pattern present in this app today | How a strong reference avoids it |
|---|---|
| Endless white rounded cards (`GroupedList` everywhere) | Oura backs data with atmospheric imagery instead of repeating one card module; Visible varies section rhythm rather than one container shape |
| Icon+heading+paragraph onboarding template | How We Feel replaces icon+label input with a spatial grid; Manage My Pain leads with a slider-first interaction, not icon tiles |
| Generic wellness green accent (`#0A8F68`) | Flo deliberately uses mint (not leaf-green) restricted to one job; Oura's palette is earthy/sleep-derived, not a stock wellness hue |
| Generic `leaf-outline` as a pseudo-logo | Gentler Streak's "Yorhart" is a purpose-built, named illustrated character; Headspace's mark has a real symbolic origin story |
| Repeated "personalized for you" copy | Visible's copy is concrete and outcome-stated ("Stop guessing, start measuring") rather than a generic personalization claim |
| Chip/SelectableCard as the only selection language | Apple Health and Flo build hierarchy through type/color, not one repeated bordered-pill shape |
| Feature-directory screens (Track, Insights) | Oura's tabs are structurally different from each other (dynamic feed vs. carousel vs. trend view), not three copies of the same list template |
| Every icon a stock Ionicons glyph | Gentler Streak and Headspace both commission illustration/mascot systems rather than an icon-font |
| Default `<Tabs>` chrome | Oura treats its own IA restructuring as a publicized brand event, not an afterthought |

## 7. Three brand territories, fully specified

*(Grounded directly in the research above — not generic mood-board language. Each territory is a real, describable system.)*

### Territory A — Editorial Health Journal

- **Core idea**: the app is a personal record — a quiet, well-composed diary of one person's health story over years, not a dashboard.
- **Emotional tone / personality**: composed, literary, unhurried, dignified, honest.
- **Logo direction**: a wordmark-led identity (letterform personality carries the brand, no pictorial mark required) — in the spirit of Calm's soft handwriting-adjacent logotype, but drier/quieter.
- **App icon direction**: a minimal abstract mark built from a recurring editorial motif (a rule line, a date-stamp device) — never a body-part pictogram.
- **Typography**: a refined serif/slab-serif for headlines, dates, and numerals, paired with clean system sans for body/UI — echoing the "Headspace lets letterforms carry brand meaning" lesson, applied to numerals/dates instead of a smile-curve.
- **Primary color family**: warm neutral paper tones (off-white, warm gray, ink) — "paper and ink," a step past Oura's earthy-tone instinct.
- **Secondary palette**: one muted accent (dusty terracotta or muted plum), one job only, per screen.
- **Background/surface philosophy**: warm paper background; separation via spacing and rule lines like a printed page, minimal card borders.
- **Illustration language**: none, or extremely restrained line marks — distinctiveness comes from type/composition, not illustration.
- **Icon style**: thin-line, editorial, closer to a magazine's custom iconography than a UI icon font.
- **Data visualization**: small inline sparkline-scale graphics embedded in text/timeline entries — data as annotation to the story.
- **Motion**: slow, settling, page-turn-like; nothing bouncy.
- **Today**: reads like opening to today's page — a short entry prompt, not a dashboard. **Timeline**: literally a journal being paged through, dated and typeset. **Appointment Summary**: a printed dossier prepared for the doctor — composed, quiet, worth handing someone.
- **Strengths for AS/chronic-illness audience**: dignifies a long illness as a story, not a spreadsheet; low visual noise suits fatigue/low-energy days; the timeline-first structure matches patients' real need to show a doctor "how this has gone."
- **Risks**: can read as slow/under-featured if executed too minimally; a serif/editorial register risks feeling precious unless paired with genuinely fast input mechanics; risks feeling passive rather than actionable.

### Territory B — Modern Clinical Companion

- **Core idea**: precise, structured, medically credible without hospital aesthetics — a competent, calm second brain for a lifelong condition.
- **Emotional tone / personality**: competent, exact, steady, unpretentious, quietly confident.
- **Logo direction**: a simple geometric wordmark or monogram with tight, exact letterspacing — precision communicated through typesetting discipline, not a symbol.
- **App icon direction**: a flat geometric abstraction built from a grid/measurement motif in one confident color field — no literal medical pictogram.
- **Typography**: disciplined system-font usage (proving-out Flo's model) with **tabular/monospaced numerals for every logged value** (pain scores, CRP/ESR, dates) as the one deliberate typographic signature — the exact "custom typeface used only for numbers" example already named in the brief.
- **Primary color family**: a single confident, slightly desaturated primary (deep teal, ink-blue, or deep plum) — explicitly not hospital blue, explicitly not generic wellness green.
- **Secondary palette**: true warm-to-cool neutrals doing most of the work; primary reserved for actions/emphasis only, following Flo's monochrome-plus-one-accent discipline.
- **Background/surface philosophy**: light, evenly lit neutral surfaces; separation via subtle elevation/whitespace, not heavy borders — closer to Apple Health's restrained "OS layer" feel.
- **Illustration language**: none — data and typography carry the whole system.
- **Icon style**: precise outline icons, consistent stroke weight, custom-drawn to match the type's precision (not an icon font).
- **Data visualization**: real, clearly labeled charts with tabular numerals — closer to a well-designed lab report than a fitness app.
- **Motion**: fast, purposeful, minimal flourish — efficient, professional-tool feeling.
- **Today**: a tight, efficient check-in — log precisely, done. **Timeline**: a structured, filterable, clearly scannable log, closer to a lab-chart history than a diary. **Appointment Summary**: the flagship screen in this territory — document-grade, exportable, clinician-legible, executed with real typographic craft (not a generic utility-app PDF like Hurtl's).
- **Strengths for AS/chronic-illness audience**: matches the seriousness patients feel about a lifelong diagnosis; strongest territory specifically for Appointment Summary; low risk of feeling infantilizing.
- **Risks**: can tip cold/"hospital-adjacent" if the single accent is chosen poorly (the exact "hospital blue" trap the brief warns against); needs real craft to avoid reading as a generic B2B dashboard.

### Territory C — Living Body / Movement

- **Core idea**: mobility, rhythm, continuity through time — framed around what the body is still doing, not what's wrong with it; progress measured as continuity, not scores.
- **Emotional tone / personality**: grounded, gently energetic, embodied, unrushed, physical.
- **Logo direction**: an abstract mark built from a continuous, unbroken line or gentle curve suggesting ongoing movement/flexibility — never a spine, never a skeleton.
- **App icon direction**: a soft geometric form suggesting motion/continuity in one grounded color — closer to Gentler Streak's soft-illustrated warmth than a fitness badge.
- **Typography**: a rounded, humanist sans (e.g., SF Pro Rounded) for UI, with any custom-type investment reserved for numerals/headlines — a rounded counterpart to Headspace's "letterforms echo the brand" logic.
- **Primary color family**: warm, grounded mid-tones — terracotta, warm clay, muted gold-green — evoking body/earth/movement without becoming generic "wellness leaf green."
- **Secondary palette**: soft, low-saturation supporting tones (dusty blue, warm sand), used the way Gentler Streak uses soft blues/greens — calming, never saturated fitness-app energy.
- **Background/surface philosophy**: soft, warm neutral surfaces with generous room; occasional full-bleed abstract color washes marking transitions (not photography).
- **Illustration language**: a restrained, custom illustrated motion/posture motif system (Gentler Streak's Yorhart in spirit, not a cartoon character), used sparingly at key emotional moments only.
- **Icon style**: soft-rounded line icons, consistent corner radius, matching the type.
- **Data visualization**: continuity-first — streak/ribbon-style indicators and gentle area shapes over sharp bars, emphasizing "the thread continues."
- **Motion**: soft, elastic, breath-paced easing — motion that itself feels like stretching/breathing.
- **Today**: a small embodied ritual check-in ("how did your body move through today"), not a data-entry form. **Timeline**: a continuous ribbon/thread through time rather than stacked cards, visually reinforcing an ongoing, managed condition. **Appointment Summary**: deliberately shifts register toward Territory B's precision for this one screen — a doctor needs data, not warmth, here.
- **Strengths for AS/chronic-illness audience**: directly counters an immobility/fear narrative with an identity about continued movement and agency; well-suited to a condition managed over decades.
- **Risks**: highest risk of drifting into generic "wellness app" softness unless executed with real specificity; must never let "keep moving" framing imply fault on a bad-pain day — a Gentler-Streak-style explicit copy policy is mandatory here, not optional; needs deliberate register-shifting for clinical screens.

## 8. Color system research and proposed palette directions

**What the strongest references actually do**: none of Apple Health, Oura, Flo, or Calm use more than roughly 2-3 true brand hues total. Apple Health uses color *categorically*, never as a value judgment. Flo restricts itself to grayscale plus one accent. Oura draws its whole system from one earthy tonal family. The mechanism across all of them is **role discipline** — every color has exactly one job, none is reused for two meanings, matching Apple's own HIG guidance to avoid reusing colors for different meanings and to reserve alarm-coded color for genuinely rare, critical moments.

Three palette directions, each paired to one territory above, all role-based rather than decorative, all with light/dark and accessibility notes:

**Direction 1 — "Paper & Ink"** (pairs with Territory A): warm deep-ink primary (near-black, warm undertone); muted terracotta/clay secondary reserved for the one primary action per screen; a rare soft dusty-gold accent for milestone moments only; warm off-white background with a barely-distinguishable warmer surface tone; status colors muted (sage/amber/brick), critical red reserved strictly for true system alerts (e.g., a missed-medication safety reminder), never for a symptom value; dark mode inverts to warm near-black, never cool gray. **Accessibility flag**: warm-on-warm palettes are the highest contrast risk in this set — primary text-on-background and the amber "attention" tone both need explicit AA verification.

**Direction 2 — "Instrument Grade"** (pairs with Territory B): a single deep, desaturated teal or ink-plum primary — explicitly not hospital blue, not generic green; neutral warm-gray secondary; no separate decorative accent (radical restraint, closest to Flo's model); crisp near-white surfaces; status colors kept in the same teal family for "positive" so it never reads as a separate traffic-light system, with a clearly distinct desaturated red reserved strictly for safety-critical states; dark mode uses deep neutral (not pure black) with the teal brightened for contrast. **Accessibility flag**: the safest direction for contrast tuning (cool neutrals tune more predictably to AA/AAA than warm-on-warm) — still verify the critical-red independently in both modes and never rely on the teal/red pairing alone without an icon or label.

**Direction 3 — "Grounded Continuity"** (pairs with Territory C): warm clay/terracotta primary (more muted/earthbound than Headspace's brighter orange); muted sand/gold secondary; a single soft blue-gray "rest state" accent forming a deliberate two-hue emotional vocabulary (warm = active/logged, cool = rest/quiet); warm sand-neutral background; status colors reframe "positive" as the sand/gold ("logged/continuing" rather than "good"), critical brick reserved for safety alerts only; dark mode uses warm charcoal, never cool black. **Accessibility flag**: same warm-on-warm risk as Direction 1, plus a specific colorblindness check — the warm/cool two-hue system must never become a de facto good/bad code; lightness/intensity, not hue alone, must carry the distinction.

**Explicit argument against a rainbow dashboard**: no strong reference in this research used more than ~2-3 branded hues, with alert colors kept separate, minimal, and reserved for rare critical moments — a distinct color per tracked variable (pain=red, stiffness=blue, fatigue=purple) appears in none of them and is a hallmark of exactly the generic feel this reset is meant to fix.

## 9. Typography research

**How hierarchy is built without containers**: Apple Health and Oura both lean on size/weight/color-as-category rather than boxes — a large numeral plus a small label communicates importance without a card border. Flo's documented, build-verified 14-style scale is the clearest evidence that the discipline is in having a *finite, deliberately named* set of styles applied consistently, not in any single flourish.

**Custom typeface vs. refined system font**: Headspace's commissioned typeface (Colophon Foundry, letterforms echoing the brand mark, engineered to "flex from playful to clinical" for enterprise healthcare partnerships) is the strongest *for* case found — but its cost and justification (an expensive foundry relationship, justified by a specific enterprise-credibility need) is disproportionate to this project's current stage. Flo is the direct counter-proof: fully system-font (SF Pro/Roboto — the same starting point this product already has), executed with a disciplined, engineering-verified scale, reads as premium and trustworthy at real scale. Apple Health itself is fully system-type and reads as maximally trustworthy *because* it's the platform's own font.

**Recommendation**: keep the system font (already SF Pro via Dynamic Type in this codebase) and invest instead in a small number of clearly named, purpose-specific styles — plus **one deliberate typographic difference reserved for a single high-signal use: tabular/monospaced numerals for every logged clinical value** (pain scores, CRP/ESR, dates). This captures much of Headspace's "distinctive data voice" benefit at a fraction of the cost/risk, and is directly proven achievable by Flo's own system-font-only success.

## 10. Navigation research

**Direct precedent**: Oura consolidated from 5 tabs to 3 in 2024 specifically because feature growth had made the app "confusingly laid out" — a real, recent, documented case of tab *reduction* as a mature health app's answer to feature sprawl, not tab addition.

**Applied to this product's actual feature set**: the current four tabs (Today/Track/Appointments/Insights) risk the same redundancy Oura escaped — Track (meds/injections/labs), Timeline (chronological history of the same data), and Insights (trends over the same data) are three different views of one underlying log, split across two-plus destinations. **Recommendation** (own synthesis from the Oura precedent, not a directly sourced claim — flagged as reasoning, to be validated against real usage before being treated as settled): consider folding Timeline and Track into one combined "Track" tab (today's quick-entry at the top, scrolling back into the full chronological history and trend views below/beside it, mirroring how Oura's "My Health" tab already serves as both trends and long-term record in one place), yielding a leaner **3-tab model**: **Today**, **Track** (the combined log/history/trends), and **Appointments** (kept distinct — task-oriented, occasional-use, document-producing, functionally different enough from daily logging to deserve its own tab, echoing Visible's own separation of daily pacing from a "Prioritize/Progress" reporting function). This recommendation requires validation (see `docs/DESIGN_DIRECTION_2_0.md`'s navigation decision) before being adopted as final.

## 11. Interaction, accessibility, and motion findings

*(From the icon/logo/accessibility/interaction-pattern research pass — full detail retained in that pass's own report; synthesized here.)*

**Data visualization for health metrics**: WHOOP's own public design system is the strongest evidence for "typography over charts" — its primary UI is three oversized numerals (Recovery/Strain/Sleep) with a narrow, consistent 3-color vocabulary; actual graphs sit in an optional third tier most users never open. Recommended per metric type: (a) a single day's pain/fatigue as an oversized numeral, never a radial "progress" ring (a ring implies "fill toward a goal," the wrong metaphor for a symptom score where lower is better); (b) a multi-week trend as a plain inline sparkline (no axes/gridlines), not a full dashboard chart; (c) the stiffness-bucket distribution as a plain-language sentence with a simple proportion strip as secondary confirmation, never a bar chart implying false continuity between categories; (d) CRP/ESR history as the one legitimate exception warranting a real lightweight native chart — a restrained dot-and-line plot with a soft reference-range band, since lab values have genuine continuous magnitude and clinical range actually matters; (e) the Timeline feed itself grouped by strong typographic date headers with natural-language event phrasing ("Logged pain 4/10, stiff ~45 min") rather than icon-badge rows, and *varying* visual weight by event significance (a lab result or appointment note gets more presence than a routine check-in) — the mechanism that makes a feed feel edited/narrative rather than mechanically generated, directly informed by Day One's editorial-journal design pattern.

**Body map**: medical sources (Cleveland Clinic, Mayo Clinic, Arthritis.org) confirm AS/axSpA primarily manifests in the sacroiliac joints and lower back/buttocks — anatomically **posterior** regions essentially unselectable on a front-only silhouette — plus commonly the neck, shoulders, hips, and thoracic spine. **A front/back toggle (two flat views, simple tab or swipe) is a genuine accuracy and usability requirement for this specific condition, not a nice-to-have**, and is recommended over a fully rotatable 3D model (which adds precision-dragging demands disproportionate to a twice-daily quick-log interaction — 3D suits the "explain to my doctor once" use case, not "log every morning while stiff"). Visual direction: a soft, abstracted line-art silhouette (no muscle definition, gender-neutral, moderate zone granularity matching the existing 7-region taxonomy — not CHOIR's clinical 74-segment precision), with selection feedback in the brand accent color, never a red/orange "inflammation" cue, since region selection is a neutral act of reporting location, not a severity signal.

**Onboarding**: the strongest researched pattern is progressive/contextual disclosure with a visible payoff per question (Spotify holding back Discover Weekly, LinkedIn's chained small wins) over front-loaded interrogation, plus RevenueCat's documented finding that the strongest paywalls continue a narrative the onboarding already told rather than starting cold. Concretely for this product: Goals + Priority Symptoms + Body Regions are three structurally identical screens capturing one act of self-description and are a strong merge candidate into one adaptive sequence; Medication + Injection setup similarly merge into one conditional flow; Reminders folds into that same flow instead of its own screen; Privacy folds into Welcome as a trust cue rather than a separate interrogation step; and — a genuine "is this screen necessary here" challenge, not just a merge — **Appointment setup during onboarding has low immediate payoff for a brand-new user and is a candidate to defer to a contextual first-use moment inside the app instead of staying in the initial sequence.**

**Paywall**: RevenueCat's own guidance and case studies (e.g. Citizen) directly support opening the paywall by echoing the user's own onboarding answers back as the value premise, replacing a feature checklist with 2-3 concrete product-preview moments (a realistic mock of the Timeline or Appointment Summary, not a bulleted feature list), and reserving the price/plan cards for last, after the value narrative — with Annual still visually primary and Monthly still secondary, differentiated through typographic weight rather than a generic "RECOMMENDED" ribbon badge or a discount starburst.

**Accessibility as a design input**: Apple's HIG (44×44pt minimum touch target, tap-error research citing motor-impairment impact) and JMIR Human Factors 2022's mHealth dexterity-impairment research (large targets, fewer required gestures, higher contrast measurably improve real usability for this population) converge on the same conclusion WHOOP's own design independently reaches for unrelated reasons: **large, legible, numeral-forward, low-precision design is simultaneously the accessible choice and the premium choice.** Concretely: pain/fatigue entry should use large discrete tap targets or a segmented row, never a fine-drag slider; body-map tap zones must be padded well beyond the visible region outline to clear 44pt regardless of anatomical region size; every status/severity signal must be paired with a numeral or label, never color alone; primary daily controls should sit in the lower two-thirds of the screen for one-handed reach given the app is often used first thing in the morning; the check-in's required fields should be minimal (pain, stiffness) with everything else genuinely optional and de-emphasized, completable in a small number of taps for a low-energy day. This is the strongest, most convergent finding across all three research passes: accessibility and premium aesthetics are not in tension here — the same decision serves both.

**Motion**: restrained and purposeful across every reference studied (Oura's progressive-disclosure reveals, Gentler Streak's "soft/welcoming" easing, How We Feel's single confident tap as the whole payoff). Explicitly avoid: confetti/achievement-style animation on logging a symptom (celebrating a bad-pain-day entry the way a fitness app celebrates a workout is tonally wrong, and no calm reference in this set uses achievement motion for neutral/negative daily data), aggressive spring/bounce easing generally coded "gamified consumer app," and any motion without a Reduce-Motion equivalent that is an instant, information-complete state change (per Apple's own guidance to replace sliding transitions with crossfades for vestibular sensitivity).

## 12. App icon / logo concept research

What strong current health-app marks actually do (research finding, not assumption): none of Headspace, Calm, WHOOP, Flo, or Oura uses a literal object drawn from the product's own subject matter (no lotus for meditation, no heart for cardio) — they use **abstract geometry, color-as-meaning, or one radically simplified mark**, several maintaining a separate, more detailed wordmark for large contexts while a stripped-down mark serves the icon alone (WHOOP's own public brand guidelines describe designing a distinct simplified "Puck" glyph specifically for small-scale use rather than shrinking the full logo). This directly validates rejecting an initials-in-a-gradient-circle icon (the current app's own pattern): the strong current examples invest in an ownable abstract mark, not a monogram.

Three concrete concepts researched/proposed (original proposals informed by, not copied from, the pattern above):

**Concept A — "The Held Line"**: a single continuous stroke that begins as a gentle, slightly uneven wave (irregularity, stiffness) and straightens into a clean line as it travels (regained function, consistency) — one unbroken stroke, one or two colors, inside a simple field. Not a spine — no vertebral segments, no bone shapes — just a line whose *character* visibly changes across its length, standing for the user's own lived arc rather than diagramming anatomy. Reads at 1024px with a subtle gradient along the stroke; reduces cleanly to a flat single-color stroke at 16-20px. **Risk**: needs a genuinely distinctive stroke geometry (not a generic checkmark-swoosh) to avoid a crowded "growth arrow" logo territory.

**Concept B — "Axis Mark"**: an abstract mark built from a short vertical/tilted bar crossed by 2-3 shorter ticks at deliberately uneven, non-symmetrical intervals — evoking a structural axis with points along it, without drawing a spine or vertebrae. Double meaning: "axial" (as in axial spondyloarthritis) *and* a time axis (marking points along the Timeline). No other reference studied uses this measurement/axis vocabulary — genuinely distinct geometric family, and it scales as a *system* (the same tick-mark language could reappear in the Timeline UI or section dividers, giving the brand a reusable geometric signature beyond the icon alone). **Risk**: at true minimum size (~16px raster) the ticks can merge into the bar and start reading as a plus/cross — must be angled off the horizontal/vertical grid and tested explicitly against that association, with a simplified 16px fallback.

**Concept C — "The Streak Ring"**: an open ring or arc with a deliberate, visible gap or varying stroke width around its circumference — not a uniform closed circle. Chronic-illness tracking is about continuity with realistic imperfection (check-ins won't always happen, symptoms fluctuate); an intentionally imperfect ring stands for sustained-but-realistic engagement rather than the "closed ring = 100%" cliché (Apple Activity, Oura). Reads clearly at every size (one closed-ish shape, one visual event) — the most forgiving of the three at small scale. **Risk**: needs the "imperfection" to read as *realistic continuity*, not *failure/incompleteness* — the metaphor should be validated with real users before commitment, since an anxious user could misread a visibly "broken" ring as a bad sign.

All three deliberately avoid: spine/vertebrae illustration, medical cross, ECG line, AI sparkle, heart, brain, robot imagery, generic wellness leaf, gradient blob, and initials-in-a-rounded-square (the current icon's own pattern). See `docs/DESIGN_DIRECTION_2_0.md` for which concept is recommended as the primary direction, connected to the winning brand name.

