# Product 2.0 UX Specification — Phase M (Research + Specification Only)

Status: **Draft, for Furkan's review.** This document is the output of Phase M — competitive UX + monetization research, and the resulting Product 2.0 specification. It authorizes nothing by itself. No implementation code was written to produce it. It reopens product/design scope beyond the V1 redesign frozen at Phase K (`de45797`).

Built on top of, and consistent with unless explicitly flagged as a deviation: `docs/PRD.md`, `docs/UX_SPECIFICATION.md`, `docs/VISUAL_DESIGN_SPECIFICATION.md`, `docs/TECHNICAL_ARCHITECTURE.md`, `docs/REDESIGN_SPECIFICATION.md`, `PROJECT_CONTEXT.md`, `PROJECT_MEMORY.md`.

---

## 0. Context recovery — confirmed

- Phase K (final V1 redesign QA) is committed as `de45797`, `main`, clean.
- V1 redesign (Phases A–K) is frozen and approved, per `PROJECT_MEMORY.md`'s 2026-08-31 freeze entry.
- Phase L (native readiness) dependency alignment was attempted, hit a genuine `npm ERESOLVE` conflict caused by `expo install`'s own side effect (duplicate `eslint-config-expo`/`jest-expo` declarations across `dependencies`/`devDependencies`), and was fully reverted — `git status` is clean, all 9 packages are back at their pre-alignment versions, `tsc`/Jest both pass (102/102).
- Working tree is clean at the time of writing this document. No dependency, code, EAS, or signing changes exist anywhere in the repository right now.

**We are reopening PRODUCT SCOPE for a new Product 2.0 iteration.** Everything below is research and specification. Phase N (first implementation phase) has an explicit approval gate at the end of this document and has not begun.

---

## 1–2. Competitive research

Research performed live (September 2026) rather than from model memory, per §26's instruction. Full source list is in §26.

### Apps investigated and why

| App | Category | Why relevant here |
|---|---|---|
| **Bearable** | Symptom/mood tracker, chronic illness | Closest direct competitor — general symptom tracker used heavily by chronic-illness communities, has a live paywall we can observe real user reaction to |
| **Visible** | Pacing app for ME/CFS, Long Covid, POTS, fibromyalgia | Closest *condition-community* competitor — same "no free-tracker energy to waste" user base as AS/axSpA, freemium-with-paid-tier model, real published user sentiment |
| **Flo** | Cycle/pregnancy tracking | The most-cited real-world example of personalization-driven paywall conversion at scale; useful precisely because it is *not* chronic-illness (shows the pattern generalizes, and where it doesn't translate) |
| **Headspace / Calm** | Meditation/wellness | Canonical goal-based onboarding personalization; Calm specifically demonstrates a *long* onboarding that still works because of emotional pacing — useful counter-example to "always keep onboarding short" |
| **Oura** | Wearable/readiness scoring | Personalization-via-goal-selection at onboarding, and — more importantly — a model for presenting a computed personal score without medical/diagnostic framing, which is exactly Ankilozanapp's Insights constraint |
| **Apple Health** | Platform health app | Still the visual-language reference per the existing (approved) Redesign Spec §2.1 — inspired-by, not cloned |

WHOOP, MyFitnessPal, BetterSleep, Welltory, Ada were considered per the brief's suggestion list; not separately researched in depth because their core mechanic (continuous biometric streams, calorie logging, symptom-checker triage) doesn't map to Ankilozanapp's actual data model (manual daily check-ins + scheduled treatments). Bearable and Visible already cover "manual chronic-symptom logging + subscription" more precisely than any of them would.

### Key competitive findings, with sources

**Onboarding personalization → paywall commitment (Flo).** Flo collects health goals during onboarding and the paywall reflects a specific personalized plan built from those answers rather than a generic subscription screen — the framing shifts from "should I buy this?" to "should I stop what I already started?" ([Airbridge](https://www.airbridge.io/en/blog/how-to-fix-subscription-app-funnel-not-converting), [Adapty](https://adapty.io/blog/how-to-personalize-onboarding-and-paywalls-in-your-mobile-app/)).

**Goal-selection onboarding (Headspace).** Headspace asks users to self-select goals (reduce stress, sleep better, etc.) immediately, and that self-selection makes subsequent content recommendations feel personal without any inferred/AI-guessed personalization ([UXCam](https://uxcam.com/blog/10-apps-with-great-user-onboarding/)).

**Long onboarding can work (Calm).** Calm's onboarding is longer than most, walking through goals, habits, and past sticking points — it works specifically because each step gives instant feedback, so it reads as a guided conversation rather than a form ([dev.to](https://dev.to/paywallpro/onboarding-first-screen-trends-emotional-hooks-are-back-because-they-never-left-74d)). This is a real counter-signal to "always minimize screens" — length is not intrinsically bad if every screen visibly does something.

**One-question-per-screen.** Standard pattern: one question, one input, one CTA per screen — reduces perceived cognitive load, but multiple sources note the risk of it *feeling* longer even when it technically completes faster ([GenDesigns](https://gendesigns.ai/blog/app-onboarding-design-examples)).

**Hard paywalls convert meaningfully better than freemium, but the gap is enormous either way.** RevenueCat's 2026 benchmark data (115,000 apps): hard paywalls convert at 10.7% vs. 2.1% for pure free-trial-gated flows; a 7-day trial *inside* a paywall still lifts effective paid conversion 38–52% over no trial ([RevenueCat 2026 benchmarks](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026), [buildmvpfast](https://www.buildmvpfast.com/blog/hard-paywall-vs-free-trial-revenuecat-indie-app-2026)). Read together: hard-paywall enforcement and trial-availability are two independent levers, not opposites — our funnel can use both.

**Apple rejected trial-toggle UI as of February 2026.** Apple has begun rejecting paywalls that use a toggle to turn a free trial on/off, citing Guideline 3.1.2 as "confusing and misleading" about pricing/auto-renewal ([Adapty](https://adapty.io/blog/dark-patterns-and-tricks-in-mobile-apps/)). **This is current and directly binds our plan-architecture recommendation in §13** — plans must be shown as distinct, always-visible cards, never a toggle that changes what a single card means.

**Guideline 3.1.2 substantive requirements**, confirmed against current third-party summaries of Apple's own guidelines ([precheck.tools](https://precheck.tools/platforms/apple-app-store/apple-iap-subscription-guide/), [iossubmissionguide.com](https://iossubmissionguide.com/guideline-3-1-in-app-purchase/)): billing amount must be the most prominent price element; trial length and post-trial price must be stated in the purchase flow itself, not just on a marketing screen; a visible Restore Purchases control is required; subscriptions must provide genuine ongoing value, not a one-time unlock disguised as recurring.

**A hard paywall in this exact product category has real, documented backlash risk.** Bearable — the most directly comparable app — locks *the user's own recorded data/analysis* behind its paywall, and this draws specific, pointed criticism from chronic-illness users: *"I had a good experience with it until they wanted me to pay to see the data I recorded,"* and *"the sickest people who need it the most will have the least money and hiding the most useful features behind a paywall seems a little predatory"* ([choosingtherapy.com](https://www.choosingtherapy.com/bearable-app-review/), [aelivra.co](https://aelivra.co/explore/compare/bearable-app-review)). Visible's paid tier is additive (advanced pacing features, clinician reports) on top of a genuinely useful free tier, and its own users say the value case gets weaker once someone already knows their baseline ([aelivra.co](https://aelivra.co/explore/compare/visible-review)). **Ankilozanapp's approved direction (§11) is stricter than either comparable app — it charges before any tracking happens at all, not after value is demonstrated.** This is not a recommendation to change the decision (it is stated as non-negotiable, §11), but it is the single most important risk this research surfaces, and it belongs in front of Furkan explicitly (see §22 blockers).

**Value-reveal-before-paywall is an established, named pattern.** The screen immediately before an offer determines whether the subscription "feels like a useful next step or an interruption" — naming the user's specific plan/answers back to them, then listing what unlocks, consistently outperforms a generic feature list ([Apphud](https://apphud.com/blog/design-high-converting-subscription-app-paywalls)). Personalized paywalls (headline/benefit copy shifting per the onboarding answer) outperform static ones for the same reason ([dev.to](https://dev.to/paywallpro/designing-onboarding-flows-that-convert-how-to-build-trust-before-the-paywall-knp)).

**Symptom-tracker-specific UX**: semantic grouping of log fields, expandable/progressive-disclosure sections, and consistent (non-diagnostic) color coding are the recurring best-practice pattern across current health-logging UX writeups, plus the observation that "complexity does not equal good UX" for a chronic-illness user base that is disproportionately fatigued/in-pain while using the app ([insaim.design](https://www.insaim.design/healthtech-blog/symptom-tracking-in-health-apps-ux-ui-best-practices)).

---

## 3. Pattern library

**Pattern: One decision per screen, reserved for high-signal questions only**
Seen in: Headspace, Calm, Flo.
Why: reduces cognitive load per step; each answer visibly changes something later.
Risk: overused, it inflates screen count without adding signal — Calm's own length only works because every screen has instant feedback attached.
Ankilozanapp adaptation: apply only to the two genuinely new personalization questions in §8 (focus areas, body regions). Every other onboarding screen keeps its current restyled form; we do not fragment existing multi-field screens (e.g. the treatment-add form) into one-field-per-screen just for consistency.

**Pattern: Personalization visibly changes the product before the ask**
Seen in: Flo (goals → paywall plan), Headspace (goals → content recommendations), Oura (focus → which scores are emphasized).
Why: converts "why would I pay" into "this is already mine."
Risk: fake personalization (cosmetic-only reordering with no real product effect) reads as manipulative once noticed, especially in a health app.
Ankilozanapp adaptation: every personalization input in §8 has a named, real product effect in §9 — no input exists purely for paywall theater. Rejected candidates (height, weight, sex, age) are rejected specifically because no real effect could be found.

**Pattern: Value-reveal screen immediately before the paywall**
Seen in: Flo, and the general subscription-app funnel literature (Apphud, RevenueCat, Adapty).
Why: reframes the paywall as "continue what you started" rather than "buy something."
Risk: if the reveal invents value that wasn't actually configured (fake AI insight, a score with nothing behind it), it becomes exactly the kind of deceptive framing Apple penalizes and users resent.
Ankilozanapp adaptation: the reveal screen (§10) only ever reflects real onboarding answers and real configured entities (a medication actually added, focus areas actually selected) — never a generated insight, never a fabricated score.

**Pattern: Hard paywall, no close button, but never a dead end**
Seen in: RevenueCat's 2026 benchmark cohort broadly; Apple's guideline text itself.
Why: 10.7% vs. 2.1% conversion gap is too large to leave on the table for a product with a real, non-optional monetization model.
Risk: documented and specific in this exact category (Bearable/Visible user backlash above) — a hard, no-preview paywall in a chronic-illness app reads as predatory faster than in almost any other category, because the audience is disproportionately price-sensitive and already distrustful of being charged for their own health information.
Ankilozanapp adaptation: keep the hard paywall (non-negotiable, §11), but the value-reveal screen immediately before it must do real work to earn trust before the ask — this is the one place the research says the risk can be mitigated, not eliminated.

**Pattern: Trial availability, no toggle**
Seen in: current 2026 App Store enforcement (Guideline 3.1.2 rejections of toggle UI).
Why: Apple now actively rejects the toggle pattern; RevenueCat data shows trials still lift conversion substantially when shown as a plan property instead.
Risk: none identified beyond standard implementation cost.
Ankilozanapp adaptation: two always-visible plan cards (Annual, Monthly), each stating its own trial/price terms inline — never a single card with a trial on/off switch. See §13.

**Pattern: Body-region selection via labeled zones + list fallback, not full anatomy**
Seen in: general symptom-tracker UX writeups; the existing Ankilozanapp check-in already uses a flat 7-region chip list.
Why: a full anatomical body map adds real interaction and accessibility cost (VoiceOver over an SVG silhouette is unreliable without a proper accessible fallback) for a condition where the relevant regions are a small, fixed set.
Risk: a silhouette invites feature creep toward a "medical" look the brand direction explicitly rejects (§2.1 of the Redesign Spec — not a hospital dashboard).
Ankilozanapp adaptation: see §7 — a simplified single-view silhouette as a visual affordance layered over the *same* accessible chip list already in the schema, never a replacement for it.

**Pattern: Descriptive score presentation without diagnostic framing**
Seen in: Oura's Readiness Score (explains what feeds the number, never claims a medical conclusion from it).
Why: gives a computed number legitimacy without crossing into medical interpretation.
Risk: none additional for Ankilozanapp — this reinforces a boundary the product already enforces structurally (Tech Arch §I — Insights functions are structurally incapable of producing diagnostic copy).
Ankilozanapp adaptation: no new score is proposed in this document. If a future composite score is ever considered, Oura's pattern (explain the inputs, never claim a conclusion) is the reference, but PRD §10.7 already forbids a composite "health score" entirely — that boundary is not reopened here.

---

## 4. Product 2.0 design principles

1. **Show, don't explain.** A visual selector that clearly conveys its own meaning beats a paragraph of instructional copy every time one can be built without losing clinical honesty (pain, stiffness, fatigue all keep their real numeric/enum values — see §6).
2. **One primary decision per screen, reserved for screens that earn it.** Not a blanket rule — see the Calm counter-example in §3. Applied to the two new personalization questions, not retrofitted onto every existing form.
3. **Personalization must be real or it doesn't happen.** Every collected input has a stated, verifiable product effect (§9). No decorative personalization, no data collected because a competitor collects it.
4. **Condition-specific, not clinical-looking.** Iconography, copy, and color stay in the calm/warm/premium register already established by the V1 redesign — this document evolves that system (§19), it does not replace it.
5. **Visual input beats typing, but never beats honesty.** Pain and fatigue stay real 0–10 values with the number always visible — a nicer control is not allowed to blur the underlying data (§6A).
6. **Medical neutrality is structural, not stylistic.** Green/red never encode symptom severity anywhere in the redesigned surfaces either — this is a hard carry-forward from the V1 Visual Design Spec §2.3, not a new rule, but it is being explicitly re-stated here because visual "premiumization" work is exactly the kind of change that tends to accidentally reintroduce severity-coded color.
7. **Premium means restraint, not density.** More cards, more colors, and more icons are not the goal — the goal is fewer words per screen for the same information, which usually means *fewer* visual elements, not more (§19).
8. **Supportive content stays visually subordinate to health-record features**, now extended explicitly to the new Knowledge Hub (§16) — it joins Nutrition/Breathing-Posture's existing subordinate treatment (§8 of the Redesign Spec), not Track's primary section.
9. **The paywall sells the product's real value proposition, not a generic "premium" concept.** Pillars are drawn from PRD §4's actual value proposition ("remembers what happens between appointments"), never a stock feature checklist (§12).
10. **No fake urgency, no fake scarcity, no dark patterns — enforced by current App Store rules, not just preference.** Every paywall requirement in §11 traces to a real, current Apple guideline or a real documented rejection pattern, not house style alone.
11. **A previously-approved product-safety boundary is never silently reopened.** Where this phase's research suggests asking something the V1 UX Spec explicitly excluded (diagnosis duration — see §8), the default is to preserve the existing boundary and flag the conflict for explicit sign-off, not to quietly override it because Product 2.0 "supersedes" V1.
12. **Reaching the paywall must still feel fast.** The existing V1 first-value target ("well under a minute") does not disappear just because a paywall now sits at the end of it — see §14's funnel and the screen-count discipline in §8.

---

## 5. Text-reduction strategy — before/after

| Area | BEFORE (current V1) | AFTER (Product 2.0 direction) |
|---|---|---|
| Onboarding "What to remember" | Multi-select chip list with a full sentence prompt above it | Same chip list, shorter prompt, larger touch targets, icon per chip — no structural change, a copy/density pass |
| Check-in — pain | Numeric label + stepped horizontal control + full sentence VoiceOver label (control itself already good; surrounding copy is verbose) | Same accessible stepped control; screen copy reduced to a 3–4 word question, number shown large above the control, intensity-fill visual behind it (§6A) — no paragraph text on the screen at all |
| Check-in — morning stiffness | Preset duration chips in a row with a text prompt sentence | Visual segmented control (icon + duration per segment), same 5 values, prompt shortened to a fragment ("Sabah tutukluğu?") |
| Medication/injection "taken" state | Icon + text label + full status sentence in list rows | Icon + text label kept (never icon-only, per accessibility §O of UX Spec) — sentence-level copy trimmed to the shortest phrase that still reads clearly in Turkish and English |
| Today's supportive slot | One text row with a full sentence ("2 dakikalık nefes rutini yapmaya ne dersin?") | Icon + shortened label, same single-row constraint, same at-most-one-suggestion cap — trims words, keeps the cap and the subordinate visual weight exactly as approved |
| Insights landing rows | One-line plain-language summary sentence per metric | Same sentence retained — this is exactly the kind of copy that must **not** be cut, since it's the only thing standing between "chart" and "diagnostic-sounding chart" (Tech Arch §I). Text reduction does not apply where text is doing safety work |
| AS Knowledge content | N/A (doesn't exist yet) | Built text-light from the start — see §17 |

**Explicit non-goal**: this is not a mandate to strip every sentence. Safety-load-bearing copy (Insights summaries, the medical disclaimer, notification-permission context, paywall terms) is never shortened at the expense of clarity — the reduction target is *decorative/instructional* text, not *explanatory/safety* text.

---

## 6. Daily Check-in 2.0 — research spec

Core data semantics are unchanged from `docs/TECHNICAL_ARCHITECTURE.md` §D: `pain` (int 0–10), `fatigue` (int 0–10), `morningStiffnessBucket` (`none | under_15 | 15_30 | 30_60 | over_60`), `wellbeing` (nullable enum 1–5), body area (existing 7-region enum), `notes` (nullable). No schema change proposed anywhere in this section.

### A. Pain
**Recommendation: hybrid.** Keep the existing accessibility-*adjustable* discrete 0–10 stepped control (VoiceOver swipe up/down, per-value 44pt+ targets — this is already correct and required, UX Spec §O/§E) as the actual input mechanism. Add a horizontal intensity-fill visual directly beneath it — a single-accent-color fill bar whose length maps to the selected value — so the value reads at a glance without requiring the number to be parsed. The numeric value stays large and bold directly above the control at all times; the fill is a supporting visual, never the only representation of the value (accessibility requirement, UX Spec §O — never color/position-only).
Explicitly rejected: 5 discrete "face" states (mild/moderate/severe-style icons). Faces read as mood, not pain, and risk exactly the medical-interpretation drift the product must avoid ("Your pain is severe" is a diagnostic-adjacent statement the UI would be making, not the user). No mild/moderate/severe text labels either, for the same reason — numeric-first, as the user's own brief requires.
No color-severity coding: the fill uses the existing accent green at every value, never shifting toward red as pain increases (Design Principle 6).

### B. Morning stiffness
**Recommendation: visual segmented control**, one segment per existing enum value, each with a small icon (e.g., a clock/hourglass motif with a filled arc proportional to duration) plus its label: *Yok · <15 dk · 15–30 dk · 30–60 dk · 1+ saat*. Single tap replaces the current preset-chip row with the same five values — no new bucket, no schema change. This is the most direct win identified in this research: current mockup already uses chips; a segmented control with an icon per segment reduces the row to a single visual scan instead of five separate text reads.

### C. Fatigue
**Recommendation: a distinct visual metaphor from pain**, per the user's explicit instruction not to duplicate pain's control. A horizontal "level fill" using an energy/battery-style metaphor (not a literal battery icon — an abstract level-fill shape, to avoid reading as a device-status icon) — same 0–10 discrete, same accessibility-adjustable mechanism as pain, single accent color only (no red-at-low / green-at-high coding — Design Principle 6 applies here specifically, since "low battery" visually invites red-alert framing that must be avoided).

### D. Wellbeing
Optional, stays behind progressive disclosure (unchanged). Recommendation: restyle the existing 5-point labeled scale (*Very poor · Poor · Okay · Good · Very good*) as 5 compact icon+text chips in a single row rather than a vertical list — text labels remain mandatory per the existing accessibility rule (never emoji-only, UX Spec §E).

### E. Note
Unchanged: hidden behind **"+ Not ekle"** progressive disclosure, `CHECK_IN_NOTE_MAX_LENGTH` unchanged.

---

## 7. Body Map 2.0

**Recommendation: D — hybrid**, specifically: a single simplified front-view silhouette illustration divided into large tappable zones, layered directly over the *existing* 7-region chip list (which remains the accessible, authoritative interaction — VoiceOver and Switch Control users select from the chip list exactly as today; the silhouette is a sighted-user visual affordance that taps into the same selection state, not a separate control).

**Region taxonomy: unchanged from the current schema** — `neck | upper_back | lower_back | hips | shoulders | chest_ribs | other`. No new regions proposed; inventing a new taxonomy here would be exactly the kind of unforced schema/domain touch this phase is supposed to avoid, and the existing 7 regions already cover the AS-relevant areas the brief lists.

**Front/back views: one view only, recommended.** Research and product reasoning both point the same way: AS-relevant regions (neck, upper/lower back, hips/SI, shoulders) are legible from a single stylized silhouette where the lower-back/hip zone is understood as a posterior-adjacent region even without a literal back view — a second flippable view adds real interaction cost (an extra tap, an extra state to design and test) for a benefit this taxonomy's size doesn't need. Revisit only if user testing on the real illustration shows the single view is genuinely ambiguous.

**Explicit safety constraints carried forward exactly as instructed**: no diagnosis based on location, no "AS pain detected" logic, no automated severity inference from which regions are selected, no persistence of region-selection *patterns* beyond what the existing `CheckInBodyArea` join table already stores per check-in.

---

## 8. Personalization onboarding 2.0 — candidate fields

For each candidate: why collect · where it affects the product · required/optional · stored · sensitivity · V1.1 recommendation.

| Field | Why collect | Product effect | Required/Optional | Stored | Sensitivity | Recommendation |
|---|---|---|---|---|---|---|
| **Focus areas** (evolves existing "what to remember" step — pain / stiffness / fatigue / treatment tracking / appointment prep) | Determines what the app should visibly emphasize | Today section emphasis, check-in field ordering, value-reveal pillars (§9, §10) | Optional, multi-select, none preselected — same pattern as the current approved step | Yes — evolves `OnboardingState.whatToRemember` | Low–medium (condition-management focus, not new health data) | **Include** — this is not a new question in spirit, it's the existing step given a real downstream effect it doesn't currently have |
| **Most affected body regions** | Personalizes the check-in body-map default and Today's supportive framing | Body map default selection, Today emphasis | Optional, skippable | Yes — new, reuses existing region enum (§7) | Medium (health-adjacent, but identical in kind to data already collected daily) | **Include** |
| **Work/lifestyle context** (masa başı / aktif / belirtmek istemiyorum) | Lets Nefes & Postür and Knowledge Hub content surface the more relevant routine/article first | Content-ordering only, no health-record effect | Optional, lowest priority | Yes — new, single nullable enum | Low | **Include, but first to cut if onboarding needs shortening** |
| **Goals** (what the app should help with) | Considered separately per the brief | — | — | — | — | **Rejected as a separate screen** — in this product, "what do you want tracked" and "what do you want help with" collapse into the same answer; asking both is the fake-personalization trap Design Principle 3 exists to prevent. Goals-driven copy (§9, §10) is derived from the Focus areas answer instead |
| **Age / birth year** | Candidate per brief | No feature in V1 or this document uses age for any personalization, dosing, or content decision | — | — | Medium | **Reject.** No product effect identified — collecting it would be exactly the "fake personalization" this research explicitly warns against |
| **Sex/gender** | Candidate per brief | AS/axSpA has a real epidemiological sex correlation, but nothing in the current or proposed product differentiates content, tracking, or copy by sex | — | — | High (special-category-adjacent inside a chronic-illness app) | **Reject.** No use identified; highest sensitivity of any rejected candidate |
| **Height / weight** | Explicitly flagged in the brief as "do not automatically include" | No BMI calculation, no dosing calculation, no fitness-style display exists anywhere in the product, current or proposed | — | — | Medium–high | **Reject entirely for V1.1** — not even as an optional Profile field. Add later only if a specific future feature (e.g., weight-based dosing guidance, a future BASDAI/ASDAS-adjacent metric) creates a genuine, named need — never speculatively |
| **Diagnosis year / time since diagnosis** | Would let Knowledge Hub order "AS nedir?" differently for newly-diagnosed vs. long-term users, and could tune value-reveal tone | Real, if modest, product effect exists | — | — | Medium–high | **Reject — preserves an existing, explicit V1 boundary.** `docs/UX_SPECIFICATION.md` §C states plainly: *"Explicitly not asked, anywhere in onboarding: diagnosis history, disease duration."* This document does not silently override that. See §22 — flagged for Furkan's explicit decision if he wants this boundary reopened; the default recommendation is to keep it closed and achieve the (modest) Knowledge Hub benefit via an in-hub filter the user sets themselves inside the Knowledge Hub, not at onboarding |
| **Current treatment type** | Candidate per brief | Already fully covered by the existing Add-treatment onboarding step | N/A — not a new field | Existing | — | **Not applicable** — no new question needed |
| **Medication/injection setup** | Candidate per brief | Already exists | N/A | Existing | — | **Not applicable** |
| **Dominant symptoms** | Candidate per brief | Folded into Focus areas above | — | — | — | **Merged, not separate** |
| **Most affected body regions** | (see row above) | | | | | |
| **Morning stiffness pattern** | Candidate per brief | Already captured daily by the check-in itself; a separate onboarding question would be redundant with data the app will have within a day of real use | — | — | — | **Reject as a separate question** |
| **Rheumatology appointment frequency** | Candidate per brief | No personalization use found beyond what the actual Appointments feature already tracks once a real appointment is added | — | — | — | **Reject** |
| **User's goals** | Candidate per brief | (see "Goals" row above) | — | — | — | **Reject as a separate question, merged into Focus areas** |
| **Reminders** | Candidate per brief | Already exists (medication/injection reminder toggle) | N/A | Existing | — | **Not applicable** |
| **Lifestyle/work context** | (see row above) | | | | | |

---

## 9. Personalization outcome — what answers actually change

| Onboarding input | Changes in the product |
|---|---|
| Focus areas | Today: the secondary-tier rows (due meds, next injection, appointment — tier order itself never changes, per §18) get emphasis weighting toward selected focus areas within their existing position. Check-in: fields stay identical in content and order (clinical honesty is never reordered based on preference — pain/stiffness/fatigue/wellbeing/note stay in their fixed clinical sequence), but the value-reveal screen and paywall pillar ordering (§10, §12) reflect the selection. Today's single supportive-suggestion slot rotates preferentially toward the selected areas instead of pure date-seeding, still capped at exactly one suggestion |
| Body regions | Check-in's body-map screen opens with the selected regions pre-highlighted (still fully editable every time — this is a *default*, never a lock) |
| Work/lifestyle context | Which Nefes & Postür routine and which Knowledge Hub article is offered first in Today's supportive slot rotation and in the Knowledge Hub's own landing order |

**What never changes, regardless of any answer**: the fixed Today hierarchy tier order (§18), the actual clinical fields/order inside the check-in, any medical/diagnostic copy, the Insights computation functions, and the medical disclaimer.

**Explicitly rejected as a personalization outcome**: any medical recommendation. The example in the brief is the correct boundary — selecting "Ağrı + Sabah tutukluğu" may make Today emphasize those two metrics; it may never produce "Based on your symptoms you should take X."

---

## 10. Personalized value reveal — screen concept

Placed immediately before the paywall, per the approved funnel (§14). Reflects only real answers and real configured entities — never a generated insight or fabricated score (Pattern Library, §3).

**Proposed structure:**

```
Takibin hazır.

ÖNCELİKLERİN
[icon] Ağrı                        ← only if selected in Focus areas
[icon] Sabah tutukluğu             ← only if selected
[icon] Tedavi takibi               ← only if a medication/injection was actually added

SENİN İÇİN HAZIR
Günlük check-in
Tedavi hatırlatıcıları             ← only if a treatment was actually configured
Kişisel trendler
Randevu hazırlığı

[Continue → paywall]
```

Sections with zero real content are omitted entirely (same "no empty placeholder row" rule already governing Today, UX Spec §D) — a user who skipped every optional onboarding step still sees a shorter, honest version of this screen, never a padded one. This is the same restraint principle that makes the reveal trustworthy rather than manipulative per the research in §2.

No fake AI analysis, no diagnosis, no invented statistic ("87% of users like you..." — not used, no basis for it exists).

---

## 11. Hard paywall — requirements

Non-negotiable per the brief; specified, not implemented.

- Appears only after the personalized value-reveal screen (§10) — never at first app launch (§14).
- Blocks access to Today and all core app functionality until entitlement is established.
- **No close/X button, no swipe-to-dismiss, no back-gesture escape.**
- Legitimate secondary actions only: **Restore Purchases**, **Terms of Use**, **Privacy Policy** — nothing else.
- Subscription details visible directly in the purchase flow itself, not only on a separate marketing screen (Guideline 3.1.2, §2).
- No fake countdown, no fake discount, no fake urgency, no manufactured scarcity.
- No trial-on/off toggle — Apple actively rejects this pattern as of February 2026 (§2). Plans are separate, always-visible cards.
- Money-back or "cancel anytime" claims are used only if literally true of the chosen billing provider's actual behavior — not used as generic reassurance copy.

---

## 12. Paywall value proposition

**Framing: outcome-based, anchored to the product's own approved value proposition** (PRD §4: *"The app remembers what happens between rheumatology appointments"*) — not a generic "Unlock Premium" frame, per the brief and per the research pattern in §2/§3.

**Recommended default headline** (used when no Focus-area personalization is available, e.g. if a user skipped that step): reuse the PRD's own tested value language directly — *"Randevular arasında olanları unutma."* This is deliberately the safest option: it is already-approved product language, not new copy risk.

**Personalized variant** (when Focus areas were selected): headline shifts to name the actual selection, e.g. *"Ağrını ve sabah tutukluğunu net bir şekilde takip et."* — pattern directly per §3's "personalized paywalls outperform static ones."

**4 value pillars, drawn from real V1 features, never a 10-checkmark list** (Design Principle 7, 9):
1. Daha hızlı günlük takip (the visual check-in, §6)
2. Tedavi ve hatırlatıcı düzeni (medication/injection reminders)
3. Zaman içindeki kişisel trendler (Insights)
4. Randevuya hazırlık (Appointment Preparation)

No testimonial/social-proof section is proposed — the product has no real user reviews or usage statistics to cite yet, and inventing them would violate both the copyright/fabrication rule and Apple's prohibition on misleading claims.

---

## 13. Paywall plan architecture

Placeholders only — no pricing has been set.

**A. Trial**: recommend **include a trial**, not omit it — RevenueCat's 38–52% conversion lift (§2) is too large to leave on the table, and a hard paywall and a trial are not mutually exclusive (§2). **Recommended length: 7 days** — this matches Bearable's own model (the closest direct comparable, §2) and is a reasonable, well-precedented default in this category; **flagged as a placeholder, not a research-settled number** — the right length is ultimately a business-model decision Furkan should make once real pricing exists, not something UX research alone can finalize.

**B. Annual vs. monthly**: both shown as separate cards, always visible, no toggle (§11).

**C. Recommended/default plan**: **Annual, visually marked "Önerilen"** (or equivalent), consistent with near-universal current practice and with the higher-value plan being the one that carries the trial.

**D. Hierarchy** (top to bottom):
```
Yıllık  [Önerilen]
[PRICE]/yıl · [X]/ay eşdeğeri
[7 gün ücretsiz dene, sonra [PRICE]/yıl]

Aylık
[PRICE]/ay
```

**E. CTA wording**: outcome-based, not generic — e.g. *"Takibe başla"* rather than *"Devam Et"* or *"Satın Al"* — continues the value-reveal screen's momentum rather than resetting it to a transactional tone.

---

## 14. Hard paywall behavior spec

```
Fresh install:
  Onboarding → personalized reveal → paywall → entitlement granted → Today

Returning, unsubscribed:
  App launch → paywall (Today never rendered)

Returning, subscribed:
  App launch → Today

Restore:
  Paywall → Restore Purchases → entitlement valid → Today
  Paywall → Restore Purchases → entitlement not found → remain on paywall,
    plain-language message, no dead end

Expired subscription:
  App launch → paywall
```

**Offline edge case, flagged not solved here** (belongs to the engineering phase, §25 Phase Q): PRD/Tech Arch's existing offline principle guarantees core recording never blocks on connectivity (Tech Arch §L). A hard paywall reopens that question for a previously-entitled user who opens the app with no signal — RevenueCat entitlement checks need network access. The UX-level recommendation is to cache the last known valid entitlement locally with a reasonable grace window and verify opportunistically, rather than hard-blocking a paying user who has no signal at that exact moment — but the exact grace-window mechanics are an engineering decision, not decided in this document.

---

## 15. App Store / trust constraints

Confirmed against current sources (§2), not assumed from memory:

- Subscription title, duration, and price stated in the purchase flow itself, not only on a preceding marketing screen.
- Trial length and the exact post-trial price shown together, in the same place — never trial terms on one screen and price on another.
- **No toggle-based trial UI** — separate always-visible plan cards only (binding, per the Feb 2026 rejection pattern).
- Restore Purchases visible on the paywall itself, not buried in Profile only.
- Terms of Use and Privacy Policy links present and functional before purchase.
- Billed amount is the single most visually prominent price element on each plan card — never de-emphasized relative to a "per week" framing.
- Subscription must represent genuine ongoing value (Guideline 3.1.2's "ongoing value" requirement) — satisfied here because the product's actual daily-use surfaces (check-in, reminders, Insights, appointment prep) are recurring by nature, not a one-time unlock.
- Auto-renewal and cancellation mechanics must be describable in plain language on request (Profile → a subscription-management entry point, not designed in this document, flagged for Phase Q).

No App Store Connect configuration, product identifiers, or pricing tiers are set up in this phase.

---

## 16. AS Knowledge Hub — concept

**Recommended title: "Bilgi."** Shorter, calmer, and avoids "Ankilozanı Anla" reading as slightly clinical/didactic in a tab-adjacent context — "Bilgi" also matches the terse, single-word register of the existing IA (Bugün · Takip · Randevular · Analiz).

**Categories** (from the brief's candidate list, kept as proposed — no research reason to change it):
AS nedir? · Belirtiler · Sabah tutukluğu · Tedaviler · Biyolojik tedaviler · Günlük yaşam · Masa başında yaşam · Uyku · Randevuya hazırlanma · Romatoloğa sorulabilecek sorular

**Sourcing policy**: content must be adapted from reputable, named clinical/patient organizations — ASAS, EULAR, NHS, Arthritis Foundation, Versus Arthritis, or an equivalent recognized rheumatology body — never generated or paraphrased from general model knowledge presented as medical fact. Every article carries a visible source line. Phase M does not write medical content; it specifies the format content must fit (§17).

**Disclaimer policy**: reuses the existing progressive, non-repeated disclaimer pattern already approved (UX Spec §P) — a short contextual note at the top of the Hub landing, plus reliance on the single canonical disclaimer already living in Profile → Medical disclaimer. No new disclaimer surface is invented.

**Content-length recommendation**: per article, 3–5 short sections, each expressible in 2–4 sentences plus a short source citation — never a long-form article. See §17.

---

## 17. Knowledge UX — format

```
Article hero (title + category icon, no photographic hero image
  — matches the illustration strategy in §21)
  ↓
3–5 concise sections, each with a short heading + 2–4 sentences
  ↓
Icon-supported key points within each section, not walls of text
  ↓
"Bilmen iyi olabilir" — one short related-tip card, optional
  ↓
Source / reference line
```

Explicitly excluded, per the brief: quizzes, gamification, diagnosis of any kind, personalized treatment recommendations. Knowledge Hub content is read-only and static, same persistence posture as Nutrition/Breathing-Posture (§23) — no favorites, no completion tracking, no reading history in V1.1.

---

## 18. Today 2.0 — concept

**What stays fixed** (never moves above core actions, per the brief's own instruction):
1. Daily check-in, dominant while incomplete
2. Something due today (medication doses, due tasks)
3. Next injection, when relevant
4. Upcoming appointment, when relevant
5. Any other relevant reminder

This tier order is identical to the currently-approved V1 Today hierarchy (UX Spec §D) and Design Principle 12 explicitly protects it.

**What can vary by user** (all within-tier, never reordering the tiers themselves):
- Which check-in metrics are emphasized in the collapsed completed-summary row (e.g. "Checked in — Sabah tutukluğu 20 dk" leads if stiffness was a selected focus area, instead of the current fixed pain-first phrasing)
- The relative visual weight of the treatment-summary row within tier 2, if "Tedavi takibi" was a selected focus area
- Which single supportive suggestion appears in the existing supportive slot, still capped at exactly one, still visually subordinate

**What never varies**: tier order, the check-in's own field set/order, any Insights or medical language, the 7-day summary sparkline's underlying computation.

Today does **not** become a dashboard. No new card types are introduced by personalization — only emphasis/ordering within the existing card set.

---

## 19. Visual premiumization

Evolves, does not replace, the existing approved token system (`backgroundWarm`/`surface`/`surfaceSecondary`/`surfaceHighlight`, deep-green accent, Ionicons, native grouped-list pattern — Redesign Spec §2).

| Area | Direction |
|---|---|
| Icon density | Unchanged discipline — one icon per semantic purpose, never decorative repetition (Redesign Spec §2.6 carried forward) |
| Card density | No increase — the visual controls in §6 replace *rows of text*, they do not add *new cards* |
| Whitespace | Slightly increased around the new visual selectors (pain fill, stiffness segmented control) specifically, since these are the screens most likely to feel cramped once a fill/segment visual is added on top of the existing label+control |
| Typography | No new tier needed beyond the existing scale (Redesign Spec §2.4) — MetricLarge already covers the check-in's numeric readouts |
| Visual selectors | Net-new: pain intensity fill, fatigue level fill, stiffness segmented control, body-region silhouette (§6, §7) — everything else in the product keeps its current control style |
| Compact charts | Unchanged — TrendChart's existing "thread" motif (continuous rounded-cap line, no bars, no fill) is not revisited here |
| Illustrations | See §21 |
| Micro-interactions / haptics | Recommend a single, consistent light haptic tick on check-in value changes (pain/fatigue stepping, stiffness segment selection) and on successful paywall entitlement — nothing decorative, nothing on every tap |
| Onboarding transitions | Recommend a consistent, brief (150–200ms) cross-fade between onboarding screens, with an instant/no-motion fallback under Reduce Motion (carries forward the existing Reduced Motion requirement, UX Spec §O) |

---

## 20. Iconography strategy

Ionicons only, `-outline` at rest, matching the existing approved family (Redesign Spec §2.6). Semantic map for Product 2.0-relevant concepts:

| Concept | Icon direction |
|---|---|
| Pain | An intensity/pulse-adjacent outline glyph — not a medical-cross, not a face |
| Stiffness | Clock/hourglass-adjacent, matching the segmented control's own motif (§6B) |
| Fatigue | An energy/level glyph distinct from pain's — not a literal battery (avoids device-status association) |
| Wellbeing | Unchanged from current (no icon exists today beyond the text scale — a simple outline glyph if one is added, never a face/emoji) |
| Medication | Existing `medical-outline`-adjacent, unchanged |
| Injection | Existing approved `medical-outline`, unchanged (Redesign Spec §2.6) |
| Lab | Existing, unchanged |
| Appointment | Existing, unchanged |
| Body region | A simplified silhouette-fragment glyph per zone, used only inside the body-map screen (§7), never elsewhere |
| Knowledge | A book/outline glyph, distinct from Nutrition's `nutrition-outline` and Breathing's `leaf-outline` |
| Nutrition | Existing `nutrition-outline`, unchanged |
| Breathing/posture | Existing `leaf-outline`, unchanged |
| Profile | Existing, unchanged |
| Premium/paywall | A single restrained glyph (e.g. a subtle checkmark-in-circle used consistently for the value-reveal's "ready for you" list) — explicitly **not** a crown, gem, or lock icon, which read as generic freemium-app cliché and clash with the calm/premium-restrained direction |

No emoji anywhere in core UI, unchanged (Redesign Spec, carried forward).

---

## 21. Illustration strategy

**Recommendation: yes, for exactly two places** — the body-map silhouette (§7) and the onboarding/value-reveal moments, and **no**, for the Knowledge Hub and the paywall (text/icon-led there is sufficient and lower-risk).

**Style, if pursued**: simple line/flat illustration, low detail, restrained to the existing accent green plus one soft neutral/mint tone — no cartoon or gamified style, no hospital imagery, no anatomical gore, no photorealistic body diagrams (all per the brief's own explicit constraints, which match the existing brand direction in Redesign Spec §2.1 exactly). The body-map silhouette specifically should read as an abstract wayfinding shape, not an anatomy-textbook figure — closer to a wayfinding pictogram than a medical illustration.

No assets are generated in this phase.

---

## 22. Product 2.0 information architecture

**Recommendation: keep the existing 4-tab structure** (Bugün · Takip · Randevular · Analiz + Profile via header icon) — unchanged. No dedicated Knowledge tab.

**Knowledge Hub entry point**: lives inside Track's existing `GÜNLÜK DESTEK` subordinate section, alongside Beslenme and Nefes & Postür — a third item in an already-established, already-approved pattern (Redesign Spec §8), not a new navigation concept. A second, contextual entry point is recommended from Appointment Preparation specifically, linking directly to the "Romatoloğa sorulabilecek sorular" category — the one moment in the product where that content is maximally relevant. Today's existing single supportive-suggestion slot may also rotate a Knowledge article in occasionally, under the same one-suggestion cap already governing that slot (§18).

A 5th tab was considered and rejected: the existing 4-tab rationale (UX Spec §A — reserve the tab bar for what a user returns to daily/weekly) applies at least as strongly to Knowledge content, which by nature is read occasionally, not daily.

---

## 23. Data model impact — analysis only

No migrations are designed here. Categorized per the brief's own A/B/C/D split.

**A. UI-only (no persistence)**: value-reveal screen content (always derived live from existing onboarding/domain data, never stored as its own record — same "derive, don't duplicate" principle as Appointment Preparation, Tech Arch §J); paywall plan-selection UI state before purchase.

**B. Local profile persistence (new, non-health-record)**:
- Evolve `OnboardingState.whatToRemember` into a field that also drives Today/paywall emphasis (same column, expanded meaning — not a duplicate field)
- New: onboarding-selected body regions (a "default hint," reusing the existing region enum — not a new taxonomy)
- New: optional lifestyle/work context (nullable enum)
- New: an onboarding-version/personalization-completed marker, so a user who completed V1's onboarding before this phase shipped can be distinguished from one who completed Product 2.0's — relevant to how existing users are funneled into the new paywall (see §22 blockers)

**C. Health tracking persistence**: **none new.** Check-in 2.0 changes presentation only — `DailyCheckIn`, `CheckInBodyArea`, and every existing enum stay exactly as defined in Tech Arch §D.

**D. Monetization entitlement (new category entirely)**: subscription/entitlement state — product identifier, expiration/renewal date, trial state, and a mapping to whatever subscription provider is used (PROJECT_CONTEXT.md already names RevenueCat as the intended provider, unimplemented). This is new schema surface, would sit beside the existing repository layer per Tech Arch §T's own described pattern for future additive modules, and is explicitly scoped to Phase Q (§25) — no schema is designed in this document.

---

## 24. Privacy review

Data-minimization applied per field — see the full accept/reject table in §8. Summary of the three fields the brief specifically asked to be scrutinized:

- **Weight**: no personalization use identified anywhere in this document or the existing product. **Reject** — not even as an optional Profile field.
- **Height**: same finding. **Reject.**
- **Sex/gender**: no differential product behavior identified; highest sensitivity of the rejected candidates given the chronic-illness context. **Reject.**

Fields recommended for inclusion (Focus areas, body regions, lifestyle context) are all either (a) evolutions of data the product already collects in essentially the same form (body regions — identical to the existing daily check-in field), or (b) directly load-bearing for the funnel's own core promise (Focus areas). None are collected merely because a competitor collects them.

**New third-party-SDK boundary**: once a subscription provider (RevenueCat) is actually integrated (Phase Q), the existing PRD §16 rule — health values must never be sent to any analytics/third-party SDK — extends explicitly to it. Entitlement/billing metadata is not health data and may be sent to the subscription provider; symptom, medication, lab, and note values must never be, under any configuration. This should be stated as an explicit engineering requirement when Phase Q is scoped, not assumed.

---

## 25. Product 2.0 roadmap

| Phase | Scope | Excluded scope | Data changes | UX changes | Risk | Approval gate |
|---|---|---|---|---|---|---|
| **N — Personalized Onboarding 2.0** | Evolve "what to remember" step; add body-regions screen; enhance value-reveal screen with real personalization | No paywall gating yet (entitlement check bypassed/stubbed in this phase) | §23-B (profile-level, non-health) | New/changed onboarding screens per §8, §10 | Low — additive, no schema touching health tables | Furkan visual sign-off, same cadence as V1 phases |
| **O — Visual Check-in 2.0 + Body Map** | Pain/fatigue fill visuals, stiffness segmented control, body-map silhouette layered over existing chips | No new check-in fields, no schema change | None | §6, §7 | Low-medium — accessibility parity with existing controls must be proven, not assumed | Furkan visual sign-off + explicit accessibility check (VoiceOver over the new controls, not just the old ones) |
| **P — AS Knowledge Hub** | IA, article template, sourcing/disclaimer policy, 2–3 seed articles from named reputable sources | No quizzes, no personalized recommendations, no persistence | None (static content, same posture as Nutrition/Breathing) | New route(s) per §16, §17, entry points per §22 | Low — content-sourcing accuracy is the main risk, not architecture | Furkan sign-off on both IA and the actual seed-article content/sourcing before commit |
| **Q — Hard Paywall + Entitlement UX** | RevenueCat SDK integration, entitlement schema/repository, paywall screen, restore flow, gate wiring into app launch | No App Store Connect config, no product pricing decisions beyond placeholders, no EAS work | §23-D (new entitlement category) | §10–§15 | **High** — new native dependency (needs the same careful alignment Phase L was already doing), new architecture layer, and the documented backlash risk from §2 | Explicit, separate approval — this phase changes the app's fundamental access model and should not be bundled into a routine visual sign-off |
| **R — Personalized Today/Track** | Wire Phase N's onboarding answers into Today's within-tier emphasis and Track's supportive-section ordering | No tier reordering (§18 stays fixed) | None | §18 | Low | Furkan visual sign-off |
| **S — Final Product 2.0 QA** | Full cross-app visual/product review, same rigor as Phase K | — | — | — | Low | Furkan sign-off |
| **T — Native readiness / dependency alignment** | Resume the paused Phase L work — now with a real justification, since Phase Q adds RevenueCat as a genuine new native dependency | No EAS/Apple work | — | — | Medium (the original ERESOLVE blocker from Phase L still needs resolving first) | Furkan direction, per the still-open Phase L question |
| **U — Physical-device QA** | The Phase L device-QA checklist, now covering the paywall/entitlement flows too | No EAS/Apple work | — | — | Medium | Furkan go-ahead |
| **V — EAS / Apple preparation** | Bundle identifier, signing, App Store Connect, subscription product setup | — | — | — | — | Furkan explicit go-ahead — unchanged, still not authorized by anything in this document |

This ordering places the highest-uncertainty phase (Q, the paywall/entitlement architecture) before the lower-risk personalization-wiring phase (R), deliberately — R's "personalize Today based on onboarding" work is worth doing, but sequencing it after Q means it's built once, against a paywall-gated app, rather than built twice.

---

## 26. Research sources

All research performed live in September 2026, not solely from model memory, per the brief's instruction.

- [choosingtherapy.com — Bearable App Review 2026](https://www.choosingtherapy.com/bearable-app-review/)
- [aelivra.co — Bearable App Review](https://aelivra.co/explore/compare/bearable-app-review)
- [aelivra.co — Visible Band Review](https://aelivra.co/explore/compare/visible-review)
- [Airbridge — Subscription App Funnel Optimization Guide](https://www.airbridge.io/en/blog/how-to-fix-subscription-app-funnel-not-converting)
- [Adapty — How to personalize onboarding and paywalls](https://adapty.io/blog/how-to-personalize-onboarding-and-paywalls-in-your-mobile-app/)
- [Adapty — Dark patterns and tricks in mobile apps](https://adapty.io/blog/dark-patterns-and-tricks-in-mobile-apps/)
- [RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026)
- [buildmvpfast.com — Hard Paywall vs Free Trial: RevenueCat 2026 Data](https://www.buildmvpfast.com/blog/hard-paywall-vs-free-trial-revenuecat-indie-app-2026)
- [precheck.tools — Apple App Store IAP/Subscription Guide](https://precheck.tools/platforms/apple-app-store/apple-iap-subscription-guide/)
- [iossubmissionguide.com — Guideline 3.1 Rejection Fixes](https://iossubmissionguide.com/guideline-3-1-in-app-purchase/)
- [uxcam.com — 12 Apps with Great User Onboarding](https://uxcam.com/blog/10-apps-with-great-user-onboarding/)
- [dev.to/paywallpro — Onboarding First-Screen Trends](https://dev.to/paywallpro/onboarding-first-screen-trends-emotional-hooks-are-back-because-they-never-left-74d)
- [dev.to/paywallpro — Designing Onboarding Flows That Convert](https://dev.to/paywallpro/designing-onboarding-flows-that-convert-how-to-build-trust-before-the-paywall-knp)
- [gendesigns.ai — App Onboarding Design Examples 2026](https://gendesigns.ai/blog/app-onboarding-design-examples)
- [apphud.com — How to Design a High-Converting Subscription App Paywall](https://apphud.com/blog/design-high-converting-subscription-app-paywalls)
- [insaim.design — Symptom Tracking in Health Apps: UX/UI Best Practices](https://www.insaim.design/healthtech-blog/symptom-tracking-in-health-apps-ux-ui-best-practices)
- [screensdesign.com — Flo Cycle & Period Tracker UI Breakdown](https://screensdesign.com/showcase/flo-period-pregnancy-tracker)

---

## 27. Open decisions — RESOLVED 2026-09-01

All five items below are closed by Furkan's explicit Phase M approval. Recorded here as the canonical resolution; see `PROJECT_MEMORY.md` for the dated decision-log entries.

1. **Diagnosis-duration boundary — CLOSED, stays closed.** Do not add diagnosis year/duration to Product 2.0 onboarding. It has no approved product behavior attached to it, and health information is never collected solely to create the appearance of personalization. Revisit only if a future feature genuinely needs it — not before.
2. **Hard-paywall risk — ACKNOWLEDGED, decision unchanged.** The backlash/retention risk documented in §2/§11 (Bearable/Visible precedent) is acknowledged, not disputed. The funnel intent is explicit: personalization onboarding → personalized value reveal → hard paywall → product access. This is deliberately **not** "let the user build a health history, then lock previously-recorded data behind a paywall" — nothing is recorded before the paywall in this product, which is the specific mechanism that drew backlash in the two comparables. No free core mode is planned. The user must understand the subscription requirement before entering the core product.
3. **Trial architecture — APPROVED.** Annual: primary/default selected plan, includes a 7-day free trial. Monthly: always visible as a separate plan (never a toggle, per §13/§15's Apple-enforcement finding), no trial initially. This is a product-spec decision only — pricing is not set, no real prices are hardcoded anywhere, and no subscription logic is implemented until Phase Q.
4. **Legacy-user migration — DEFERRED, not designed now.** No complex legacy-user migration flow is designed in Phase N; the product hasn't reached the stage where this needs to be a major surface. Binding requirement carried into Phase N instead: onboarding state must be versionable (`onboardingVersion` concept, §21/§22 of the Phase N brief), existing local dev/test onboarding state must never produce broken navigation, and onboarding changes must never delete real health records (medications, injections, labs, appointments, check-ins) under any circumstance.
5. **Implementation order — APPROVED as specified.** Phase N (Personalized Onboarding 2.0) → O (Visual Check-in 2.0 + Body Map) → P (AS Knowledge Hub) → Q (Hard Paywall + Entitlement UX) → R (Personalized Today/Track) → S (Product 2.0 Final QA) → then resume native-readiness work (paused Phase L, then U/V per §25's original table).

---

**Phase M: committed. Phase N: approved to begin, scoped to onboarding only — ends at the value-reveal screen, does not implement the paywall. No EAS/Apple work. No background agents launched.**
