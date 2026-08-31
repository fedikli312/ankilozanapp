# V1 Redesign Specification

Status: **Approved** (2026-08-31). Written per Furkan's redesign brief, revised per his approval decisions the same day. This document formally supersedes specific sections of `VISUAL_DESIGN_SPECIFICATION.md` and `UX_SPECIFICATION.md` where noted, and amends `PRD.md`'s scope in one place (Nutrition/Breathing-Posture, §6–7 below). It does not touch `TECHNICAL_ARCHITECTURE.md`'s layering rules (UI → feature/application services → domain → repositories → SQLite) or replace any existing repository/domain code.

This is a **visual and IA refinement of an existing, already-shipped V1 application** (Phases 0–17 complete, 102/102 tests passing at approval time). It is not a rebuild.

Implementation proceeds only phase-by-phase, each requiring its own validation and Furkan's visual sign-off before the next begins, per §9.

---

## 0. Current state (verified by inspection, not assumed)

**Git status at approval:** `main` clean at `71e06a7`, plus an uncommitted mobile-preview-shell/Ionicons pass from the prior session (16 modified + 2 new files — Ionicons navigation, `SectionLabel`/`DateBlock` components, web-only mobile preview shell in `app/_layout.tsx`, Today/Track/Appointments copy polish). Ionicons, `DateBlock`, and the preview shell are directly reusable; dark-styled elements will be re-touched in Phase B under the new light-mode-first tokens.

**Current design tokens** (`src/design-system/tokens/colors.ts`): warm-cream/near-black palette, muted teal accent (`#3D6B66`/`#3D8078`), one `surfaceHighlight` token. This is the *existing approved* `VISUAL_DESIGN_SPECIFICATION.md` §2 palette — replaced by §2 below.

**Current screen inventory** (33 route files under `app/`) and **current design-system components** (`Button`, `Chip`, `ListRow`, `ScreenContainer`, `StepperField`, `TextField`, `ToggleRow`, `AccessibleTouchable`, `SectionLabel`, `DateBlock`, `TrendChart`) — unchanged from the draft version of this document; see git history of this file for the full itemized list if needed.

**Current domain/schema** (`src/db/schema/`): `medication.ts`, `injection.ts`, `appointment.ts`, `lab.ts`, `checkIn.ts`, `notification.ts`, `preferences.ts`. No nutrition/breathing/posture concept exists in schema, domain, or repository layers — and per §6–7 below, **none is added** for V1.

---

## 1. What this brief changes vs. what it doesn't

| Layer | Changes | Stays the same |
|---|---|---|
| Color tokens | Full palette replacement (§2) | Token *names/shape* pattern — screens consuming tokens correctly need no code change beyond the token file |
| Typography | Adds a "MetricLarge" tier (28–36pt) | The Dynamic-Type-mapped scale mechanism |
| Iconography | SF Symbols → Ionicons (already underway) | One consistent family, one icon per semantic purpose |
| Navigation structure | None — still 4 tabs + Profile-via-header | Today/Track/Appointments/Analiz, same route grouping |
| Onboarding | 3 fixed + 0–2 conditional screens → fixed 8-screen flow (**approved UX change**, §4) | No forced account, no diagnosis questions, contextual permission timing |
| Domain/repository/DB layers | **None**, for every existing feature | 100% reused as-is |
| Product scope | **Adds** Nutrition and Breathing/Posture as static, unpersisted supportive content | Everything else in PRD §7's must-have list |

---

## 2. Visual language & design tokens (supersedes `VISUAL_DESIGN_SPECIFICATION.md` §2–§9)

### 2.1 Brand direction — Apple Health-*inspired*, not an Apple Health clone (resolves the §1 conflict)

**Approved, with an explicit boundary.** `VISUAL_DESIGN_SPECIFICATION.md` §1's line "must never read as... an Apple Health clone" is superseded by the following, more precise framing — the documents no longer contradict each other:

> The product's information hierarchy borrows principles from high-quality native iOS health apps — Apple Health among them — without copying any of them one-for-one. It is Apple Health-*inspired* information hierarchy, combined with native iOS restraint, modern medication/treatment tracking, and a calm chronic-condition companion tone. It must remain visually its own product.

**We may borrow:** strong typographic hierarchy, clean white surfaces, compact metrics, native grouped rows, restrained accent colors, highly readable health information, simple charts, minimal cognitive load.

**We must NOT copy:** Apple Health screen layouts one-for-one, proprietary visual assets, exact card compositions, exact iconography/layout combinations, Apple branding of any kind.

Every other clause of §1 (calm, warm, trustworthy, premium, not a hospital dashboard, not gamified, not an AI chatbot) is unaffected and carries forward.

### 2.2 Design tokens — three light-mode surface concepts (final)

```
Light (primary target):
  backgroundWarm:     #FBFAF8   — the overall screen canvas. Subtle warm off-white, not stark.
  surface:             #FFFFFF   — true/near-white elevated content: cards, grouped sections that
                                    genuinely need to read as "important container."
  surfaceSecondary:    #F5F4F1   — light neutral gray for secondary grouped controls (e.g. segmented
                                    control track, input fill) — distinct from `surface` so the two
                                    don't visually compete.
  surfaceHighlight:    #E8F5EF   — pale mint tint, reserved for the one highlighted element per
                                    screen (Today's check-in card while incomplete, selected chip fill).
  textPrimary:         #1C1C1E   — near-black, warm-neutral undertone.
  textSecondary:       #6E6E73   — medium neutral gray.
  borderHairline:      #E5E3DF   — very light neutral gray.
  accent:              #0A8F68   — deep medical/wellness green, primary.
  accentForeground:    #FFFFFF
  accentOnLight:       #0A8F68   — accent as foreground directly on background (nav icons, links).
  statusSuccess:       #0A8F68   — reuses accent; never used for symptom severity (§2.3).
  statusWarning:       #B7791F
  statusDanger:        #C0392B
  statusNeutral:       #8E8E93

Dark (preserved, not primary — per brief §21):
  backgroundWarm:      #1C1E1F
  surface:              #202223
  surfaceSecondary:     #232527
  surfaceHighlight:     #16332A
  textPrimary:          #F2F2F2
  textSecondary:        #98999B
  borderHairline:       #303233
  accent:               #34C28C
  accentForeground:     #0A2A1E
  accentOnDark:         #34C28C
  statusWarning:        #D9A441
  statusDanger:         #E0685A
  statusNeutral:        #8E8E93
```

Semantic hierarchy, per Furkan's framing: `backgroundWarm` → the screen · `surface` → cards/grouped/important containers · `surfaceSecondary` → light neutral grouped controls · `surfaceHighlight` → the one accented focal element per screen. No token beyond this semantic need is created.

### 2.3 Medical-neutrality rule (unchanged, restated because it's load-bearing for §12–13 of the original brief)

Green is the *brand accent* everywhere — never a "this lab value is good" signal; red is never "this lab value is bad." A CRP row uses identical `textPrimary`/`surface` treatment regardless of value. Only genuinely non-medical UI state (selected tab, primary button, destructive confirmation) may use color semantically.

### 2.4 Typography

| Token | Size/weight | Use |
|---|---|---|
| Display | 34–40pt bold | Onboarding welcome only |
| MetricLarge | 28–36pt bold, tabular figures | Today's check-in summary numbers, Insights metric cards, lab detail value |
| Title | 28–32pt semibold | Screen large titles |
| Headline | 16–18pt semibold | Card/section titles |
| Body | 15–17pt regular | Primary rows |
| Caption | 12–14pt regular | Secondary info |
| Micro | 11–13pt regular | Timestamps, unit labels beside a large number |

All map to native Dynamic Type text styles; reflow rules from `VISUAL_DESIGN_SPECIFICATION.md` §27 are unchanged.

### 2.5 Spacing & shape

Spacing scale: `4/8/12/16/20/24/32` (additive over the current `8/12/16/24/32`). Card radius 14–18pt (current 16pt token already sits inside this). Pills/chips fully rounded. Touch targets ≥44pt, unchanged.

**Card discipline** — not every row becomes a card. The native inset-grouped-list pattern stays the default for Track/Profile/list screens. Cards are reserved for: Today's check-in summary, Insights metric cards, treatment cards on Track's Medications/Injections. A small, deliberate set.

### 2.6 Iconography

Ionicons via `@expo/vector-icons` (already installed, uncommitted) formally replaces "SF Symbols only" (`VISUAL_DESIGN_SPECIFICATION.md` §9) — the second explicit supersession. One family, `-outline` at rest, filled/solid on active state where it reads clearly (tab bar). Mapping per the original brief §6, plus: **Nutrition** → `nutrition-outline`, **Breathing/Posture** → `leaf-outline`.

**Injection icon — approved: `medical-outline`.** No custom syringe asset for V1. The icon never carries the semantic meaning alone — row labels ("İğneler", "Sonraki iğne", "Enjeksiyon") always accompany it. If a more precise glyph already in the installed Ionicons set is found during implementation, it may be substituted under the same constraints: one family only, no new dependency, no emoji, no custom image asset.

---

## 3. Navigation (no structural change)

Still 4 tabs — `BUGÜN · TAKİP · RANDEVULAR · ANALİZ` — Profile via persistent header icon. Pure token/icon restyle of the existing `(tabs)/_layout.tsx`. No center floating-plus button.

---

## 4. Onboarding — approved 8-screen flow (supersedes `UX_SPECIFICATION.md` §C as a UX change, not just visual)

| # | Screen | Route | Status |
|---|---|---|---|
| 1 | Welcome | `onboarding/welcome.tsx` | Restyle only |
| 2 | Privacy | `onboarding/privacy.tsx` | Restyle only |
| 3 | What to track | `onboarding/what-to-remember.tsx` | Restyle only |
| 4 | Daily check-in preview | *new* | New screen, static illustrative preview, no live data |
| 5 | Add treatment | `onboarding/add-medication.tsx` + `add-injection.tsx` | Restructured entry choice, reuses existing forms verbatim |
| 6 | Reminder explanation | *new* | New screen, no permission request on load — contextual timing unchanged |
| 7 | Optional appointment | `onboarding/add-appointment.tsx` | Restyle only |
| 8 | Ready summary → Today | *new* | New screen, reads back real configured state from existing repositories |

**Must feel shorter than 8 traditional form screens** — concise copy, one decision per screen, lightweight transitions, obvious skip paths after Privacy wherever product logic allows, optional progress indication. Never require: diagnosis date, disease duration, demographics, BASDAI, detailed medical history, nutrition preferences, breathing preferences. Objective unchanged: reach first value quickly.

---

## 5. Screen inventory — final

**Visual-only restyle:** `(tabs)/index.tsx`, `(tabs)/track.tsx`, `(tabs)/appointments.tsx`, `(tabs)/insights.tsx`, `medications/*`, `injections/*`, `appointments/*`, `labs/*`, `insights/[metric].tsx`, `symptoms/index.tsx`, `check-in.tsx`, `profile/*`, the 5 reused onboarding screens.

**Structural reordering within an existing screen:** Today (adds one "Bugün için" supportive-suggestion row, §9 below), Track landing (adds the two new grouped sections, §8 below), Appointment Preparation (shortened title, already flagged pre-brief).

**New routes:** `onboarding/checkin-preview.tsx`, `onboarding/reminders.tsx`, `onboarding/ready.tsx`; `nutrition/index.tsx`, `nutrition/[category].tsx`; `breathing/index.tsx`, `breathing/[routine].tsx`.

No route removed or renamed at the file level; "Analiz" is a copy/label change on the existing Insights route, same as "Bugün"/"Takip"/"Randevular."

---

## 6. Nutrition — V1 scope (amends `PRD.md` §7)

`PRD.md` §7 is amended: Nutrition moves from explicitly-out-of-scope to a narrowly-scoped V1 supportive-content feature (see `PRD.md`'s own updated §7/§10 for the canonical amendment text).

**Approved V1 scope:** educational supportive content only — browse categories (Sebze & meyveler, Tam tahıllar, Protein kaynakları, Omega-3 içeren besinler, Su tüketimi, Dengeli tabak yaklaşımı), read concise guidance, optionally see a rotating "today" suggestion. **No favorites/saved items, no food diary, no meal logging, no calorie/macro tracking, no meal-plan generator.** Static, bundled, localized content module — **zero new database tables, zero repository changes.**

It is NOT medical nutrition therapy, an AS diet, or an anti-inflammatory treatment recommendation.

**Copy rule:** use language like *"Genel dengeli beslenmeyi destekleyen seçenekler."* Never: *"AS için yemelisin," "İnflamasyonu düşürür," "Ağrıyı azaltır," "Hastalığı kontrol eder"* — unless a future, separately medically-reviewed feature explicitly supports such a claim.

## 7. Breathing & Posture — V1 scope

Approved name: **"Nefes & Postür."** Never "Egzersizler" — this is not the deferred exercise library.

**Approved V1 scope:** 3–5 short routines (2 dakikalık sakin nefes, Diyafram nefesi, Göğüs kafesi nefes farkındalığı, Masa başı postür molası, Duruş farkındalığı), each with title/duration/static text instructions, optional static illustration placeholder, a start action. **Completion exists only as ephemeral session-local UI state — no historical storage, no streak, no XP/score, no leaderboard, no animated exercise library, no treatment claims.**

**Net schema/domain answer (final): no new tables, no repository changes, no migration for Nutrition or Breathing/Posture in V1.** If persistence (saved nutrition items, breathing completion history) becomes desirable later, it is explicitly deferred to a separately approved product/domain phase — not assumed here.

---

## 8. Track — information architecture (approved)

```
Takip

SAĞLIK TAKİBİ
 ├─ Belirtiler
 ├─ İlaçlar
 ├─ İğneler
 └─ Tahliller

GÜNLÜK DESTEK
 ├─ Beslenme
 └─ Nefes & Postür
```

Two grouped sections, not one flat list. `GÜNLÜK DESTEK` (supportive content) is visually subordinate to `SAĞLIK TAKİBİ` (health-record features) — smaller/quieter section treatment, never equal visual weight to medications, symptoms, or labs. This is a hard product-safety-adjacent rule, not a styling preference: supportive content must never look as clinically authoritative as the actual health-record features.

---

## 9. Today — redesign detail

Structure per the original brief §9, mapped to the existing `useTodayData` hook (`hasAnyTreatment`, `dueToday`, `nextMedication`, `nextInjection`, upcoming-appointment data) — **no new data source needed** for check-in summary, treatment summary, or upcoming-appointment sections.

**"Bugün için" supportive row — hard constraint: at most ONE suggestion at a time**, e.g. either "2 dakikalık nefes rutini" or "Dengeli beslenme için küçük bir öneri" (a simple date-seeded rotation through the fixed static list, no personalization logic). Must remain visually secondary to daily check-in, due medication, injection, and appointment — **Today must never become a content feed.**

**7-day summary sparkline:** reuses existing `computePainHistory`/`computeStiffnessHistory`/check-in-completion domain functions — visual-only addition, no new domain function.

---

## 10. Phased implementation plan

| Phase | Scope | Domain/schema touch? |
|---|---|---|
| **A** | Redesign spec — done, approved | None |
| **B** *(next, this task)* | Design tokens, typography, spacing/radius, icon system, tab bar, header/profile affordance, layout/grouped-list/metric-card/section-header primitives, web-only mobile preview shell | None |
| **C** | Onboarding — 3 new screens + restyle of 5 existing | None |
| **D** | Today + Check-in redesign | None |
| **E** | Track + Medication + Injection redesign | None |
| **F** | Labs redesign | None |
| **G** | Appointments + Appointment Preparation redesign | None |
| **H** | Insights/Analiz redesign | None |
| **I** | Nutrition + Breathing/Posture — new static-content screens | None, per §6–7 |
| **J** | Profile + empty states + global polish | None |
| **K** | Full mobile visual review | None |

Each phase: preserve domain/repository behavior, run tsc/lint/relevant Jest, commit only that phase's files after Furkan's visual sign-off, no EAS/Apple work. **Phase B explicitly excludes** onboarding, Today, Track, medication/injection, labs, appointments, Insights, Nutrition, and Breathing/Posture redesigns — those belong to Phases C–J.

---

## 11. Resolved decisions log (2026-08-31 approval)

All five open questions from the draft are resolved:

1. Apple Health brand-principle conflict → resolved, §2.1 (inspired-by with explicit boundary, not a clone).
2. Surface tokens → three, not two: `backgroundWarm`, `surface`, `surfaceSecondary` (plus the existing `surfaceHighlight`) — §2.2.
3. Nutrition/breathing persistence → none in V1, confirmed — §6–7.
4. Injection icon → `medical-outline`, confirmed, no custom asset — §2.6.
5. Onboarding structural change → approved as a UX change — §4.

Additional decisions folded in at approval: Track IA grouping (§8), Today's single-supportive-suggestion cap (§9), Nutrition/Breathing exact category and routine lists and copy rules (§6–7).

---

Next: Phase B (design system + navigation shell) only. Implementation changes remain uncommitted until Furkan visually reviews the local web preview.
