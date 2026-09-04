# Design Direction 2.0 — Recommended Direction (Opinionated)

Status: **Proposal only. Nothing in this document has been implemented.** This document commits to ONE recommended direction, per Furkan's explicit instruction not to end with "all options are good." It draws on `docs/DESIGN_RESEARCH_2_0.md` (competitor research + current-app audit) and `docs/BRAND_NAMING_STRATEGY_2_0.md` (naming, recommending **Ilium** as the winning brand name — used throughout this document as the primary proposed direction, per the brief's own instruction).

---

**Update (Phase DESIGN-A2 stress test):** this document's original recommendation was pressure-tested in `docs/DESIGN_DIRECTION_VALIDATION_2_0.md`. Three changes resulted: the visual territory below is now **Hybrid "Warm Precision"**, not pure Editorial Health Journal (§1 below is superseded — see the validation document §5/§12 for the five-screen comparison that drove the change); the logo in §3 below is now **"The Margin Mark"** (non-anatomical), not "The Held Line" (§3 is superseded — see the validation document §4); and navigation in §19 below was stress-tested and **confirmed** as originally proposed (§19 stands, now with its own dedicated nine-criterion comparison in the validation document §8). Read this document for the underlying reasoning that hasn't changed; read the validation document for what has.

## 1. Recommended brand character

**Primary territory: A — Editorial Health Journal**, with a deliberate, named exception for report-facing screens (Appointment Summary, Labs), which borrow Territory B's typographic precision as a *register shift within the same brand*, not a separate identity.

**Why this territory wins, decisively:**

1. **It is the least crowded territory in the entire competitive set researched.** Every general chronic-illness/symptom tracker found (Bearable, Flaredown, CareClinic, Manage My Pain) and both AS-specific apps found (AS Log, Hurtl) are function-forward and visually undifferentiated — none read as an *editorial* product. Territory B (clinical precision) has real, if imperfect, competitors in the "premium health record" space. Territory C (movement/continuity) is, per the research itself, the highest-risk territory for drifting into generic wellness softness. Territory A has **no direct competitor** in this category today.
2. **It is the only territory that makes the app's own best-built feature its emotional center by construction.** Timeline is already this product's most distinctive, most carefully built surface (Phase X), and the brief itself asks for Timeline to feel like "my health story," not a database log. An editorial-journal brand doesn't have to invent a reason for Timeline to matter — Timeline *is* the brand, expressed as a screen.
3. **It matches what a long-term chronic illness actually is: a story, not a session.** A patient living with AS for twenty years is not "using an app" the way someone uses a fitness tracker for a summer — they are keeping a record of an ongoing condition. Dignifying that as a personal record, rather than gamifying it as a dashboard, is both more honest and more differentiated.
4. **It is achievable at this project's actual scale.** Unlike Headspace's typeface commission or a fully custom illustration system, an editorial-journal identity is built primarily from typographic discipline, warm neutral color, and restrained composition — the system-font-plus-rigorous-scale approach Flo proves works at real premium scale (§9 of the research doc), not a large asset-production investment this project isn't positioned to make yet.

**The named exception, stated explicitly so it never gets blurred by accident**: Appointment Summary and the Labs section speak in the *same* type family and *same* palette family as the rest of the app, but in a quieter, more document-grade register — tighter spacing, tabular numerals doing more of the work, less warmth in the color mix, closer to Territory B's "instrument grade" precision. This is not a second brand. It is the same voice, formal, the way one person's voice changes between a diary entry and a letter to their doctor — deliberately, not accidentally.

## 2. Visual identity summary

- **Personality**: composed, literary, unhurried, dignified, honest — quietly confident, never clinical-cold, never wellness-saccharine.
- **What it is not**: not a fitness-tracker dashboard, not a generic meditation-app softness, not a hospital chart, not an AI-assistant's friendly chirpiness.

## 3. Logo concept

**Recommended: "The Held Line," made anatomically specific to Ilium** — a single continuous stroke shaped as the *ilium bone's own gentle wing-curve* (from `docs/DESIGN_RESEARCH_2_0.md` §12's Concept A, fused with `docs/BRAND_NAMING_STRATEGY_2_0.md` §12's name-specific logo concept). The stroke begins uneven/irregular and settles into a clean curve across its length — literally a small narrative arc (irregularity resolving into steadiness) *and* literally the shape of the bone the name refers to. This double meaning — anatomically true to the name, emotionally true to the Editorial Health Journal territory — is why it beats Concept B's more structural/measurement feel (a closer fit for Territory B alone) or Concept C's ring (a closer fit for Territory C alone): it is the one mark that is specifically, ownably *Ilium's*, not a generic territory-appropriate shape that could belong to any name in that territory.

The wordmark ("Ilium") should let the same stroke logic generate a distinctive ligature or connecting stroke — most naturally between the "I" and the curve of the "l"/"i" sequence — so the mark and the lettering read as one family, not a symbol bolted onto stock type.

## 4. App icon concept

Same "Held Line" device, resolved for icon scale: at 1024px, the stroke can carry a very subtle gradient along its length (muted clay at the "uneven" end to a calm ink/teal at the "steady" end — using Direction 1's own palette, never a rainbow or an unrelated hue) inside a simple rounded field. At 16-20px (home screen, notification, settings), it reduces to a single flat-color stroke on a flat field — tested to remain legible at true minimum size before commit, per the research's own explicit warning against unresolved detail at small scale. This directly replaces the current unfinished, off-brand blue gradient chevron (`assets/icon.png`) with a mark that is (a) actually finished, (b) actually connected to the chosen palette, and (c) actually meaningful rather than an initial-in-a-shape.

## 5. Color direction

**Recommended: Direction 1, "Paper & Ink"** (from `docs/DESIGN_RESEARCH_2_0.md` §8), tuned per-surface:

- Everyday surfaces (Today, Check-in, Track, Timeline): the full warm palette — warm off-white background, warm-ink primary text, muted terracotta/clay as the one reserved action color, a rare soft dusty-gold accent for genuine milestone moments only (never routine UI).
- Report-facing surfaces (Appointment Summary, Labs): the same palette pulled toward its quieter, more neutral end — less terracotta, more ink/neutral gray, consistent with the Territory B register shift in §1. Same tokens, different proportions — never a second palette.
- Status colors stay muted and single-purpose throughout: a true, clearly distinct (but still desaturated) red is reserved **strictly** for safety-critical states — a missed-medication reminder, an overdue-lab nudge — and is **never** used to color-code a pain score, a stiffness bucket, or any other symptom value. This is a hard rule carried over unchanged from the current app's existing (correct) discipline, now made an explicit part of the brand system rather than an implicit convention.
- Dark mode inherits the same warm relationships (warm near-black, not cool gray) — accessibility contrast for text-on-background and the amber "attention" tone must be explicitly verified in implementation, flagged as the palette's one real risk in the research.

## 6. Typography direction

- **Keep the system font** (SF Pro via Dynamic Type) — no bespoke typeface commission at this stage. This is a deliberate, evidence-based choice (§9 of the research doc): Flo proves a system-font-only approach reads as premium when the token discipline is rigorous, and a full commission (Headspace's path) is a cost/risk disproportionate to this project's current scale.
- **One deliberate typographic signature, applied everywhere, not just in one territory**: every logged numeric value (pain, fatigue, CRP, ESR, dates) renders in **tabular/lining numerals**, consistently, across the whole app. This single decision is cheap, low-risk, and does real work — it's the "distinctive data voice" the brief itself named as an example of intentional design, achieved without a foundry commission.
- For headline/date treatment specifically on editorial-register screens (Today's date, Timeline's month/day headers), consider a restrained serif or slab-serif accent weight for those specific elements only — never for body copy or UI chrome, which stay in the system sans throughout. This is the one place a second typographic voice earns its keep; it should not spread further than headline/date use.
- Rebuild the type scale with named, purpose-specific tiers (extending the current `display/metricLarge/title/headline/body/caption/micro` scale rather than replacing it) — the discipline is in consistent application, not novelty.

## 7. Layout philosophy

- **Retire `GroupedList`'s triple-framing as the default.** The current pattern (`surface` fill + 1px `borderHairline` + 16px radius, applied to nearly every section on nearly every screen) is the single largest contributor to the "endless white cards" feeling (`docs/DESIGN_RESEARCH_2_0.md` §3, item 1). Replace it as the *default* with: typography-led section separation (a strong section label + generous whitespace + optional hairline divider between rows), reserving an actual bordered/elevated card treatment for genuinely distinct, elevated moments — a single highlighted daily action, a hero metric, a milestone — never for "one more settings-style list."
- **Full-width, container-free modules** become the norm for narrative content (Timeline entries, Today's primary state) rather than the exception.
- **Selective cards remain justified** specifically where content is genuinely a self-contained, tappable, navigable unit competing for attention against siblings (e.g., an appointment card, a medication card) — not for every grouped list of settings-style rows.

## 8. Component philosophy

- **Consolidate `Chip` and `SelectableCard`** — research (`docs/DESIGN_RESEARCH_2_0.md` §1) found these are already the same visual selection language (border + fill + checkmark) at two sizes. Keep one deliberate selection component family with size variants, rather than two nominally-different components that happen to look identical, closing the redundancy rather than adding a third pattern on top.
- **Retire decorative icon usage.** Every icon currently in the app is a stock Ionicons glyph, several reused across unrelated meanings (`flask-outline` for both CRP and ESR; `leaf-outline` as onboarding's brand mark, the paywall's brand mark, *and* Breathing's row icon). New rule: icons communicate function only, never stand in for a missing brand mark, and a small custom icon set (thin-line, consistent stroke weight, matching the new typography's precision — see the research doc's icon-style notes per territory) replaces the stock icon-font wherever an icon is genuinely load-bearing (navigation, event-type differentiation on Timeline). Where an icon was purely decorative (e.g., every onboarding screen's icon-in-a-circle), remove it rather than replace it — let typography carry the moment instead.
- **MetricCard retires as the default "everything is a stat tile" component.** Reserve an actual card treatment for a single hero metric per screen at most; every other logged value renders as oversized numeral-forward typography inline with its label, per the data-visualization philosophy below.

## 9. Data visualization philosophy

Directly per `docs/DESIGN_RESEARCH_2_0.md` §11 (WHOOP precedent: three numerals over charts as the primary layer):

- **Single-day pain/fatigue**: an oversized numeral with a short label, never a radial "progress" ring (a filling ring implies "toward a goal," the wrong metaphor when lower is better).
- **Multi-week trend**: a plain inline sparkline, no axes, no gridlines — confirmation of direction, not a precision instrument (the numeral remains the precision instrument).
- **Stiffness-bucket distribution**: a plain-language sentence ("Stiffness lasted 30-60 min on most mornings this month") as the headline artifact, with a simple proportion strip as secondary confirmation — never a bar chart implying false continuity between categorical buckets.
- **CRP/ESR history**: the one legitimate exception earning a real lightweight native chart — a restrained dot-and-line plot with a soft reference-range band, no chart library dependency, kept in the report-register palette.
- **Timeline**: strong typographic date headers, natural-language event phrasing over icon-badge rows, and visual weight that varies by event significance (a lab result or appointment gets more presence than a routine check-in) — the mechanism that makes a feed read as edited/narrative rather than a database log.

## 10. Motion

Restrained, functional, confirmatory — never decorative, never celebratory on symptom data specifically (per the research's explicit finding that no calm reference app uses achievement-style motion for neutral/negative daily entries). Check-in value selection and body-region taps get a brief (~100-150ms), non-bouncy state change. A completed check-in earns one calm, quiet acknowledgment — settling into a "logged" state, not a burst of celebration, matching Gentler Streak's non-comparative tone applied to motion rather than just copy. Every motion has a Reduce-Motion equivalent that is an instant, information-complete cut to the end state, per Apple's own guidance.

## 11. Imagery / illustration

None as a general rule — Territory A's distinctiveness comes from type and composition, not illustration (unlike Territory C, which would have required a custom illustration system in the Gentler-Streak mold). The one exception: a small number of custom line-art marks reused as the app's *own* visual vocabulary (e.g., a refined version of the existing Body Map silhouette, and small typographic/rule-line devices echoing the logo's stroke logic) — never generic clip-art, never stock icon-font glyphs standing in for illustration.

## 12. Iconography

A small custom set (thin-line, single consistent stroke weight, editorial in feel — closer to a magazine's custom iconography than a UI icon font), reserved for genuinely functional uses: primary navigation, Timeline event-type differentiation, status. Ionicons may remain as an implementation fallback only for the least brand-visible utility contexts (e.g., a settings-row chevron) during incremental rollout, but is retired from every brand-visible surface.

## 13. Today philosophy

One dominant daily state or action, never a stacked feature list. The question Today answers is "what matters to me today," not "here is everything the app can do." A single highlighted moment (the day's check-in, done or not-yet-done) leads; everything else (next treatment, next appointment, one health observation) is secondary and quiet, in that order of importance, not equal visual weight. See `docs/DESIGN_REDESIGN_PLAN_2_0.md` for the concrete concept comparison.

## 14. Check-in philosophy

One coherent interaction, not five stacked control types. Pain, Stiffness, Fatigue, High-Symptom Day, and Body Regions should feel like one continuous act of reporting, completable in roughly 15-30 seconds, with large discrete tap targets throughout (never a fine-drag slider, per the accessibility research) and progressive disclosure for the genuinely optional fields (Wellbeing, Note) exactly as today, just visually unified rather than five separately-styled widgets in sequence.

## 15. Track philosophy

Track becomes "my health record," with **Timeline promoted to its visual anchor**, not one more equal-weight row in a list of five. Medications/Injections/Labs remain reachable but visually subordinate to the chronological record they feed. See §16 (Navigation) for whether Track and Timeline should in fact be the same destination.

## 16. Timeline philosophy

The signature surface. Continuous, typography-led chronology; strong date headers; natural-language event phrasing; visual weight that varies by event significance; fewer per-day containers than the current implementation already has (Phase X was a real improvement over the rest of the app but is still container-bound). This is where the editorial-journal brand is most fully expressed — "my health story," not a database event log, exactly as the brief names it.

## 17. Appointment philosophy

Before/During/After, with Appointment Preparation and Appointment Summary **merged into one screen family** built entirely on the already-correct Phase W/Z deterministic data (see `docs/DESIGN_REDESIGN_PLAN_2_0.md` §1/§2 for why these are currently two parallel, duplicative implementations). The merged "Before" experience registers in the report-facing voice (§1's named exception) — document-grade, exportable-feeling, genuinely worth handing to a doctor, without ever adopting clinical/EHR chrome.

## 18. Insights philosophy

Folded into Track as a mode/section rather than kept as a fourth, overlapping destination (see §19). Where it appears, it leads with a narrative framing ("this period, this is what changed") over a flat menu of stat rows, using the data-visualization philosophy in §9 — restrained sparklines and plain-language summaries, no dashboard grid.

## 19. Navigation recommendation

**Recommended: a leaner 3-destination model — Today / Track (absorbing Timeline and Insights) / Appointments** — replacing the current 4-tab Today/Track/Appointments/Insights structure.

**Why**: directly informed by Oura's own real, recent (2024) precedent — consolidating from 5 tabs to 3 specifically because feature growth had made the app "confusingly laid out" (`docs/DESIGN_RESEARCH_2_0.md` §10). This product's own current Track, Timeline, and Insights are three different views of the same underlying logged data (medications/injections/labs; the chronological record of that same data; trends over that same data) split across two-plus destinations today — the same redundancy Oura found and fixed. Folding Timeline and Insights into Track (Timeline as its default/anchor view, Insights as a "trends" section within it) removes a tab without removing a single piece of functionality, and directly fixes the "feature-directory tab" critique from the current-app audit (`docs/DESIGN_RESEARCH_2_0.md` §2/§3).

**What stays separate**: Today (the daily ritual, distinct in cadence and purpose from everything else) and Appointments (task-oriented, occasional-use, document-producing — genuinely different in kind from daily logging, not just a different view of the same data, matching Visible's own separation of daily pacing from its reporting function).

**Explicitly flagged as needing validation before being treated as settled**: this recommendation is reasoning from a strong precedent and this product's own feature map, not a directly tested result — Furkan should weigh it against real usage patterns/analytics before commit, and the redesign plan should not block on it (a 4-tab fallback that simply gives Timeline real visual priority within Track, per §15, captures most of the benefit even if the tab count itself doesn't change immediately).

## 20. Onboarding philosophy

Progressive, contextual, payoff-per-question — never a block of 11+ structurally identical "headline + chips + Continue" screens. Concretely: Goals + Priority Symptoms + Body Regions merge into one adaptive sequence where each answer visibly shapes what's asked next; Medication + Injection setup merge into one conditional flow with Reminders folded in; Privacy folds into Welcome as a trust cue rather than its own interrogation step; Personalized Summary + Value Reveal merge into one continuous "here's what we understood, here's what's ready" moment that becomes the first thread of the paywall's own narrative; and Appointment setup is challenged as a candidate to move out of onboarding into a contextual first-use moment rather than staying in the initial sequence, since it has the lowest immediate payoff of anything currently asked before a user has used the app once. Net: roughly 11-13 screens down to roughly 7-8 felt steps, with no data currently collected lost. Full detail in `docs/DESIGN_REDESIGN_PLAN_2_0.md`.

## 21. Paywall philosophy

Presentation only — hard paywall, Annual-primary-with-trial, Monthly-secondary all unchanged. The paywall opens by echoing the user's own onboarding answers back as the value premise (continuing the merged Personalized-Summary/Value-Reveal narrative from §20), replaces the current feature-checklist-with-icon-bullets with 2-3 concrete product-preview moments (a realistic mock of the Timeline or Appointment Summary, not an abstract bullet list), and reserves the plan/price cards for last. Annual stays visually primary through typographic weight and specific framing copy, not a generic "RECOMMENDED" ribbon or a discount starburst. No testimonials, no sparkle decoration, consistent with every calm reference studied.

## 22. Why this direction specifically fits people living with AS/axSpA

AS is a lifelong condition, usually diagnosed young, often after a long diagnostic delay, managed for decades rather than "improved" in a season. An editorial-journal identity treats that reality honestly: it frames the app as a *record*, not a *program*; it never implies a finish line, a score to beat, or a competition against other users; and its one deliberate copy/tone discipline (carried over from Gentler Streak's own explicit, named rule — never say "underperforming," state facts) applies naturally to a condition that has good mornings and bad mornings as a matter of course, not as a matter of the user "doing it right." The report-facing register shift for Appointment Summary and Labs respects that the same person who wants their daily experience treated with warmth also needs their doctor to receive something precise and credible — one brand, two registers, exactly the way a real, considered relationship with a chronic illness actually works.
