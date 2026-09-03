# Product 2.1 Specification — Doctor Visit Report, High-Symptom Day, My AS Timeline, HealthKit, AI Health Report

Status: **Specification only — nothing in this document has been implemented.** Written per Furkan's brief immediately following Phase S (uncommitted, held intact — see `PROJECT_MEMORY.md`). Product 2.0 feature freeze is postponed; this document defines the scope that must land before that freeze is re-considered.

**Approved as the planning baseline** with two architecture amendments recorded below, applied throughout this document:

- **Amendment 1 (AI architecture):** the AI data flow is `mobile client → server-side AI gateway → LLM provider`, never `mobile client → LLM provider` directly. See §14/§16/§23.
- **Amendment 2 (High-Symptom Day persistence):** `daily_check_in.flagged_important` is **not** approved for reuse. Phase W must investigate its original semantics and every existing reference before any persistence decision is made. See §19/§25.

**Phase W complete** (architecture + data contracts + Amendment 2's investigation) — the deterministic aggregation layer (`src/domain/healthSummary/`, `src/domain/timeline/`), Amendment 2's resolved decision (a new `is_high_symptom_day` column, `flagged_important` untouched), and their feature-layer DB wiring all exist and are tested (250/250 tests). No UI, no HealthKit, no AI — see §12/§19 for what changed and §23 for what remains. Nothing from this phase is committed yet.

---

## 0. Context recovery — confirmed

Grounded in the current codebase, not assumed:

- **Local-first, no backend.** Every table lives in on-device SQLite via Drizzle (`src/db/schema`), read/written through a typed repository layer (`src/repositories`). There is no server, no account, no sync today. AI is the first feature in this app's history that requires data to leave the device at all — treated throughout this document as a first-of-its-kind architectural boundary, not a routine addition.
- **A deterministic aggregation layer already exists** (`src/domain/insights/`): `computePainHistory`, `computeStiffnessHistory`, `computeFatigueHistory`, `computeMedicationAdherence`, `computeInjectionHistory`, `computeLabHistory`, each a pure function over repository rows and a date range, unit-tested independently of React. Doctor Visit Report, My AS Timeline, and the AI layer are designed here to **extend this existing layer**, not create a parallel one.
- **The High-Symptom Day persistence question is resolved (Phase W).** `daily_check_in.flagged_important` — dormant since the schema's first commit, Phase 3, not Phase 12 as first assumed — turned out to have a real, documented, historically unrelated meaning ("surface this note in Appointment Preparation," `docs/TECHNICAL_ARCHITECTURE.md`), so Phase W added a new, separate column instead: `daily_check_in.is_high_symptom_day`. Full investigation and decision in §19/§25.
- **RevenueCat currently receives zero health content** (Phase Q, reconfirmed in Phase S). Every new data flow proposed here is designed to preserve that, not just avoid regressing it.
- **AI never talks to a provider directly from the mobile client (Amendment 1).** A minimal server-side gateway sits between the app and any LLM provider — the only place a provider API key ever lives. This is a correction to this document's own first draft, not a reinterpretation of the brief: shipping a provider secret inside a distributed mobile binary is a real, well-known exposure (any user can extract a bundled API key from the app package), and the brief's own architecture principle ("local structured health data → deterministic aggregation → strict structured AI input → LLM → validated response") already implied a boundary layer between the app and the provider — Amendment 1 makes that boundary an explicit, separately-owned service rather than logic embedded in the client. See §14/§16.
- **The hard paywall gates the entire app**, not individual features (`docs/PAYWALL_AND_ENTITLEMENT_SPECIFICATION.md`) — a completed-onboarding, non-entitled user cannot reach any screen. §18 evaluates whether Product 2.1 changes that model.
- **Four tabs, `headerShown:false` at the root, native tab headers on each of the four `Tabs.Screen`s** (`app/(tabs)/_layout.tsx`) — confirmed live this session, including the exact bug (duplicated headings) that results from forgetting the tab navigator already renders a title. Every new screen proposed here follows this existing pattern.
- **Expo SDK 57, Expo Router, TypeScript strict, `headerShown:false` root Stack, `react-native-svg` pinned at `15.15.4`.** No dependency changes are made by this document — §23 explicitly gates when HealthKit's native dependency is introduced, and it is not this phase.

---

## 1. Product rationale

Product 2.0 answered "does this app respect me and help me track my day." Product 2.1 answers a different question the same target user asks a few weeks in: **"does this app help me at the moment that actually matters — my next rheumatology appointment?"**

Ankylosing spondylitis is managed almost entirely through periodic specialist visits (typically every 3–6 months). Between visits, patients are the only continuous observer of their own disease; at the visit, they have minutes to compress months of lived experience into something a clinician can act on. The single highest-leverage thing a self-management app can do — more than any individual tracking screen — is make that compression easier and more accurate. Every one of the five 2.1 features exists to serve that one moment:

- **My AS Timeline** turns five separate tables into the one continuous story the user actually lived.
- **High-Symptom Day** captures the days that matter most, with the least friction, precisely because bad days are when typing effort is scarcest.
- **Doctor Visit Report** is the compression step itself — turning weeks of scattered records into something that survives a 12-minute appointment.
- **HealthKit context** adds the two or three objective signals (sleep, activity, resting heart rate) patients are repeatedly told are relevant to inflammatory disease but rarely have organized alongside their symptom data.
- **AI Health Report / Appointment Copilot** is not a new capability so much as a narrator for the other four — turning correct-but-dry structured data into the two or three sentences a time-pressured person can actually read and use before walking into a clinic.

None of these is a fitness-tracking, social, or gamification feature. All five point at the same appointment.

## 2. User problems

| Problem | Who feels it | Which feature answers it |
|---|---|---|
| "I have three months of check-ins, meds, and labs, and no way to summarize them before my appointment except scrolling." | Every user with >2 weeks of history | Doctor Visit Report |
| "On my worst days I have the least energy to fill out a form — so I skip logging exactly the days that matter most." | Users mid- or post-flare | High-Symptom Day |
| "I can't see my symptoms, treatment, and appointments as one story — Track shows four separate lists." | Users trying to spot their own patterns | My AS Timeline |
| "My rheumatologist keeps asking about my sleep and activity level and I have no organized answer." | Users with an Apple Watch/iPhone already tracking this passively | HealthKit context |
| "I have all this data but no idea what it actually says about the last month, in plain language, before I forget to ask my doctor about it." | Every user, especially before an appointment | AI Weekly Summary / Appointment Copilot |

## 3. Feature hierarchy

The five features are not independent — they form one pipeline, most-foundational first:

```
Daily Check-ins, Medications, Injections, Labs, Appointments, (Apple Health)
                              │
                              ▼
                     My AS Timeline           ← unified read-over-existing-data view
                              │
                              ▼
                 Doctor Visit Report            ← the same data, range-scoped and structured for a clinician
                              │
                              ▼
              AI Weekly Summary / Copilot       ← the same structured data, narrated in plain language
```

**High-Symptom Day** and **HealthKit** are not downstream of the Timeline — they are two additional *inputs* that make the Timeline, the Report, and the AI summaries all richer:

```
High-Symptom Day  ──┐
                     ├──▶  feeds Timeline (as an event type) and Doctor Visit Report (as a section)
Apple Health data ──┘
```

Practical consequence for sequencing (see §23): the Timeline and the deterministic aggregation engine are the true foundation, and both now exist (Phase W). High-Symptom Day's persistence decision is resolved (§19, Amendment 2 — a new `is_high_symptom_day` column, not a reuse) with repository plumbing already in place; only its UI (Phase Y) remains. HealthKit is native-only and gated behind a dev-client/device QA cycle this session cannot run. AI is deliberately last — it is a narrator over data that must already be correct, it is the only piece that opens a new privacy boundary (data leaving the device, through the Amendment 1 gateway, never directly to a provider), and it needs its own review gate.

## 4. Navigation / IA

**Recommendation: no new tab.** The four-tab structure (Today, Track, Appointments, Insights) stays exactly as Product 2.0 left it. All five features are placed as *entry points inside* existing tabs and existing pushed screens — consistent with this app's established pattern (`headerShown:false` root Stack, native per-tab headers, Profile as a persistent top-right icon rather than a fifth tab).

| Tab / screen | Addition | Why here |
|---|---|---|
| **Today** | "Symptoms feel more intense today" entry point (a restrained secondary action near, not replacing, the normal check-in CTA) | Today is already the daily-decision screen; High-Symptom Day is a daily decision |
| **Today** | "Your week" AI summary card (collapsed/optional, dismissible) — *only after AI ships, Phase AD* | Today is the one screen every session opens; a weekly summary is a glanceable, non-urgent artifact, not a workflow |
| **Track** | New row in the existing "SAĞLIK TAKİBİ / HEALTH TRACKING" `GroupedList`: **"My AS Timeline"** | Track is already "your health history" (`track.subtitle`) — the Timeline is the natural upgrade of that promise, not a new promise |
| **Appointments** | Inside appointment *preparation* flow (`app/appointments/[id]/prepare.tsx` already exists for rheumatology appointments) — add **"Generate visit report"** and, later, **"Ask the AI Copilot"** as actions on that same prepare screen | Appointment Preparation already exists as a concept (Phase 12) and already reads check-in notes for a date range (`useAppointmentPreparation.ts`) — Doctor Visit Report is a natural, larger sibling of a feature already there, not a new concept |
| **Insights** | New card at the top of the landing list: **"Apple Health context"** (steps / sleep / resting heart rate, last 7 days) — appears only once HealthKit is authorized | Insights is already "descriptive factual presentation, no interpretation" (`insights.ts`'s `numericSummary` doc comment) — Apple Health context is the same contract with different metrics |

This keeps every new feature answering "why is this here" in one sentence, and avoids inventing a fifth top-level concept the way a dedicated "Reports" or "AI" tab would.

## 5. Doctor Visit Report — UX

**Entry points:** (a) Appointments → an appointment's Prepare screen → "Generate visit report"; (b) Track → My AS Timeline → a persistent "Generate report" action, for users who want one without an appointment context.

**Flow:**
1. **Range picker** — two options only in v1: *Last 30 days* / *Last 90 days*. No custom range (reduces decision cost; both windows already match the existing Appointment Preparation lookback pattern).
2. **Generating** — a brief, restrained loading state (this is pure on-device computation over the aggregation layer in §12, typically well under a second; no network call in v1 since PDF/AI are both out of scope for the first slice).
3. **Report view** — a single scrollable screen, section-ordered exactly as the brief specifies (Symptoms → High-Symptom Days → Treatment → Labs → Appointments → Apple Health, each section omitted entirely — not shown empty — if there is no data for it in range).
4. **Actions** — "Copy as text" (v1, trivial, no new dependency) and a visibly-disabled "Export as PDF" affordance labelled *Coming soon* (§ "Future capability" below) so the architecture is visibly ready without committing to it now.

**Section content (mirrors the brief, made concrete against existing domain types):**

- **Symptoms** — average pain, pain range (min–max), morning-stiffness bucket distribution (reuses `computeStiffnessHistory`), fatigue summary (reuses `computeFatigueHistory`), most-frequent body regions (new small aggregation over `checkInBodyArea`, same shape as the others), completed check-in count vs. days in range.
- **High-Symptom Days** — count, dates, and for each date its recorded pain/stiffness/fatigue/body-regions/note (same underlying row as a normal check-in, filtered by the marker from §6/§19).
- **Treatment tracking** — medication adherence (`computeMedicationAdherence`, already reports taken/missed/skipped), injection history (`computeInjectionHistory`, already reports completed/missed). "Missed/late" language only appears where these existing functions already support it — no new inference is introduced for this report.
- **Labs** — CRP/ESR values and dates in range (`computeLabHistory`).
- **Appointments** — the most recent past appointment and the next upcoming one in/adjacent to range (existing `appointmentRepository` queries, no new logic).
- **Apple Health context** — *only rendered once HealthKit ships (Phase AA)* — average steps, sleep summary, resting-heart-rate summary for the same range, sourced from §8/§12.

**Explicit non-goals, restated as UI constraints, not just prose rules:** no severity score, no red/yellow/green zones, no "your condition is X" sentence anywhere on the screen, no trend arrows implying improvement/decline. Every number is presented as a fact about *records*, in the same "average / range / count" vocabulary Insights already uses (`insights.averageComparison`, `insights.stiffnessSummary`), not a new vocabulary.

**Future capability — PDF export.** Architected for, not built in the first slice: the report view is designed as a single pure function `buildDoctorVisitReport(range) → DoctorVisitReport` (a plain serializable object, §12) that both the on-screen renderer and a future PDF renderer consume identically. Adding PDF later means adding a `renderDoctorVisitReportPdf(report)` function against the same object — no new data-layer work. Recommended trigger to build it: real user demand signal post-launch (a "share with your doctor" ask), not speculative work now — copy-as-text covers the same terminal use case (paste into a message or portal) at near-zero cost today.

## 6. High-Symptom Day — UX

**Approved product language, both locales (recorded, not to be redrafted ad hoc later):**

| Use | EN | TR |
|---|---|---|
| Entry-point CTA (Today) | "Symptoms feel more intense today" | "Belirtilerim bugün daha yoğun" |
| Feature/label name (history, Timeline) | "High-symptom day" | "Yoğun belirti günü" |

Internal code/data may use `highSymptomDay`/`isHighSymptomDay` naming; the string **"flare"** (EN) and **"alevlenme"** (TR) do not appear anywhere in shipped copy in either locale for the first slice. History screens say *"You marked 4 high-symptom days in the last 30 days"* / *"Son 30 günde 4 yoğun belirti günü işaretledin"* — never *"You had 4 flares"* / *"4 alevlenme geçirdin"* — per the brief, and this rule is treated as a hard content-QA gate in §20/§22, not a style preference.

**Entry point:** Today screen, a secondary (not primary-button-weight) action near the normal check-in CTA — visually calmer than "Kontrolü başlat"/"Start check-in" (smaller, text-link-weight, consistent with how "Kaydı görüntüle"/"View entry" already reads on that screen), so it never competes with or replaces the everyday check-in action.

**Flow when activated:**
1. Opens a **reduced** check-in — same visual language as the existing `CheckInForm`, but only Pain, Morning stiffness, Fatigue, Body regions, and an optional note. Wellbeing and every other optional field is dropped for this path specifically because the brief's stated goal is *reducing* interaction burden on a hard day, not adding a parallel form to maintain.
2. Saving marks that day's check-in as high-symptom (§19's schema decision) **in addition to** its normal Pain/Stiffness/Fatigue values — it is still one row, one source of truth, never a duplicate record.
3. If a check-in already exists for today, activating this flow edits that same row (adds the marker, offers to update the reduced fields) rather than creating a second entry for the same date — consistent with the existing one-row-per-date rule (`daily_check_in.date` is unique).

**Explicit control, never inference:** the marker is set only by this explicit user action. No part of the system (not the check-in form, not Insights, not the AI layer in Phase AD) ever sets or suggests it from pain/stiffness/fatigue score thresholds. This is stated as a hard rule here because it is the single easiest place for a future contributor to "helpfully" auto-suggest a flare from a pain=9 entry — the spec exists partly to foreclose that.

## 7. My AS Timeline — UX

**Location:** Track tab, new row → full-screen scrollable list, month-grouped (matching the brief's own mockup: "September" header, then reverse-chronological entries).

**Event types and their one-line summaries** (each sourced from an existing repository, no new writes):

| Event | Source | Line shown |
|---|---|---|
| Daily check-in | `daily_check_in` | Pain / stiffness / fatigue, condensed (reuses the same `stiffnessCompact` strings shipped in Phase S) |
| High-symptom day | `daily_check_in` (marked) | Same as above, visually distinguished (an icon/tint, never a red "alert" treatment — still a check-in, not an incident) |
| Medication taken/missed | `medication_administration` | Medication name + status |
| Injection recorded | `injection_administration` | Injection name |
| Lab result (CRP/ESR) | `lab_result` | Marker + value |
| Appointment | `appointment` | Type + doctor/institution |

**Interaction:** tapping any entry navigates to that record's existing detail screen (`/appointments/[id]`, `/labs/[marker]`, etc.) — the Timeline is a *lens*, not a new destination with its own detail views. This is the direct UI expression of §12's "derived presentation, not a second source of truth" rule.

**Empty/sparse states:** for a user with very little history, the Timeline reads naturally short (a handful of entries) rather than showing an empty-state message where a message isn't needed — consistent with how Insights already treats sparse data (`insights.notEnoughData`) only where a *computation* (not a list) genuinely has nothing to show.

**Filtering:** out of scope for the first slice (Phase X) — a single unified chronological feed is the whole point of the feature; per-type filtering is a plausible fast-follow if usage data shows people want to isolate one event type, not a v1 requirement.

## 8. HealthKit — UX

**Where it appears:** Insights tab only, as a new card ("Apple Health context") positioned above the existing metric list. **Not** surfaced on Today, Track, or anywhere else — this deliberately keeps HealthKit data out of the daily-decision screens the way the brief requires ("supporting context for AS tracking," "do not turn the app into a generic fitness dashboard").

**First-open flow (context-sensitive request, per Apple's own HIG guidance — see §26):**
1. Before authorization, the card shows a short explanation ("See your steps, sleep, and resting heart rate alongside your symptoms") and a single "Connect Apple Health" button — not requested at app launch or during onboarding.
2. Tapping it triggers iOS's own system permission sheet (HealthKit requires the system UI; a custom permission screen replicating it is explicitly against Apple's guidelines — §26). The app's own copy stops there; it does not attempt to explain the system sheet's contents.
3. After the system sheet closes, the app can only ever observe **granted vs. everything-else** for read scopes — HealthKit deliberately never reports "denied" distinctly from "no data," to prevent apps from inferring what a user is hiding (§15 covers this in full). The app tracks its own `hasRequestedHealthKitAuthorization` flag (a boolean in `user_preferences`, alongside the existing `languageOverride`/`notificationDetailOptIn` pattern) purely to distinguish "never asked" (show the connect button) from "asked, and either declined or has no data yet" (show a neutral "No Apple Health data available for this period" line — never "Access denied," which the app cannot actually confirm).

**Presentation once connected**, per the brief's own mockup — Insights, last 7 days:
```
Average recorded pain      Average daily steps
Average sleep duration     Average resting heart rate
```
Side-by-side descriptive tiles, same visual weight, same "average X" vocabulary as every other Insights metric. No chart correlating two series on one axis in v1 (a shared-axis chart is itself a mild correlation claim; two side-by-side numbers is not).

**Forbidden copy, restated as a content rule:** nothing resembling "your pain increased because you slept less," nothing implying step count or sleep *predicts* or *explains* a symptom value. If a future slice adds any correlation language at all, it is scoped and reviewed separately — not part of this document's approval.

## 9. AI Weekly Summary — UX

**Entry point:** Today screen, a dismissible card ("Your week") appearing only for users with enough check-in history to summarize (reuses the existing `sufficientData` threshold concept from `domain/insights`, not a new threshold).

**Content shape** (per the brief's own example): 3–5 short sentences — check-in count, a pain range, a stiffness-frequency observation, most-frequent body regions. Every number in that sentence is computed by §12's deterministic layer and handed to the LLM as already-final values; the LLM's only job is turning them into readable prose in the user's locale (§21).

**User controls:** explicit "Generate" action, not automatic/background generation — consistent with §14's data-minimization stance (nothing is sent anywhere without a specific user action) and with this being the first feature in the app that ever contacts a network service for user content. A visible "What data is used for this?" link opens a short, plain-language explanation (linking to §14's user-facing summary), satisfying the consent transparency this feature's data flow requires.

**Failure/offline:** if generation fails or the device is offline, the card shows the same information as a plain deterministic sentence with no AI framing ("6 check-ins this week, pain 4–7") rather than an error state — the deterministic layer under the AI is designed to be useful on its own, and never leaves the user with nothing (§17).

## 10. AI Appointment Copilot — UX

**Entry point:** the same appointment-preparation flow as Doctor Visit Report (§5) — a Copilot section appears below or alongside the generated report, using the *same* 30/90-day structured data as its input (never a second, separately-scoped read).

**Content shape:** 2–4 sentences highlighting patterns worth mentioning to a clinician, per the brief's own example ("You recorded morning stiffness longer than 30 minutes more frequently during this period. You may want to mention this pattern at your next appointment."). Every such sentence is a restatement of a fact the deterministic layer already computed (a frequency, a count, a comparison between two periods) — the Copilot's contribution is exclusively selecting which 2–4 of the report's facts are worth foregrounding and phrasing them as a conversation prompt, never introducing a new computed fact of its own.

**Hard boundary, enforced at the validation stage (§13/§14):** no sentence may claim disease state, trajectory, or treatment effect. The example the brief itself flags as forbidden ("Your disease is getting worse") is a literal test case in the response-validation step described in §13 — a shipped Copilot response containing progression, diagnosis, or efficacy language is a shipping-blocking bug, not a copy nitpick.

## 11. Ask My Data — future architecture (not built in this phase)

Scoped now so later phases build toward it rather than away from it, per the brief's explicit "architecture-ready" framing.

**Design direction:** a constrained natural-language *front end* over the same deterministic aggregation layer (§12) — never a free-form SQL/DB-access agent. Concretely: the LLM's job is to map a user's question to one of a small, enumerated set of supported query shapes (e.g., "most frequent body region in period," "last event of type X," "count of event type Y in period"), each backed by a real, already-tested aggregation function; the LLM does not compute the answer, only selects which existing function(s) answer the question and phrases the result.

**Grounding rule:** if a question doesn't map cleanly to a supported query shape, or the data needed doesn't exist, the answer must say so explicitly ("I don't have enough recorded data to answer that") rather than the model improvising an answer from its own general knowledge. This is the same "insufficient information" contract the rest of this document uses everywhere else (§9, §13) — Ask My Data does not get a looser version of it.

**Same gateway, no exception (Amendment 1):** whenever this is built, it goes through the same server-side gateway as every other AI feature (§14) — a natural-language query is exactly the kind of request the gateway's schema/whitelist validation exists to constrain, arguably more so than the other two features, since it is the one surface a user directly controls the input to.

**Why later, not now:** every one of its example questions in the brief is already answerable by a *combination* of Timeline + Doctor Visit Report + Weekly Summary computations (§X/§Z/§AD) — Ask My Data's actual new work is the query-classification layer, which is safer to design once those three features (and their aggregation functions) already exist and are battle-tested, not before.

## 12. Deterministic aggregation model

**Principle, restated as an architecture rule:** every number that appears anywhere in Doctor Visit Report, the Timeline, or any AI-surfaced text is computed by plain TypeScript against repository data — the LLM is never asked to count, average, or compare. This is a direct extension of a pattern that already exists and is already tested (`src/domain/insights/`), not a new pattern.

**Built in Phase W as two modules, not one `src/domain/reporting/`** (this document's original sketch) — investigation during implementation found the aggregated-statistics contract (`HealthSummary`) and the derived-event-list contract (`TimelineEvent`) have different enough shapes and consumers to warrant separate, more precisely-named directories, matching Phase W's own brief (§12: "or whether Product 2.1 deserves something like `src/domain/healthSummary`, `src/domain/timeline`"):

```
src/domain/healthSummary/
  types.ts                    → HealthDateRange (= domain/insights' own DateRange, re-exported), HealthSummary,
                                 SymptomSummary, TreatmentSummary, LabSummary, AppointmentSummary,
                                 HighSymptomDaySummary, BodyAreaFrequency, HealthKitContext (reserved,
                                 intentionally provisional — its real shape awaits Phase AA's HealthKit
                                 API/device research; never populated or fabricated before then, §11/§15)
  resolveHealthDateRange.ts   → (days, today) => HealthDateRange, + HEALTH_SUMMARY_RANGE_DAYS (7/30/90)
  computeBodyAreaFrequency.ts → (entries, range) => BodyAreaFrequency[]
  computeCheckInCoverage.ts   → (checkIns, range) => CheckInCoverage
  computeHighSymptomDays.ts   → (checkIns, range) => HighSymptomDaySummary   [reads the §19 marker, never infers it]
  buildTreatmentSummary.ts / buildLabSummary.ts / buildAppointmentSummary.ts → the per-section composers
  buildHealthSummary.ts       → (sources, range) => HealthSummary            [the top-level pure composer]
  buildDoctorReportInput.ts   → (sources, 30|90, today) => DoctorReportInput  [= HealthSummary, range-constrained]
  aiSafePayload.ts            → (summary) => AiSafeHealthSummaryPayload      [the §10/§14 whitelist boundary — no network code]

src/domain/timeline/
  types.ts                    → TimelineEvent (discriminated union), TimelineEventType
  buildTimelineEvents.ts      → (sources, range?) => TimelineEvent[]         [merges all event sources, sorted + tie-broken]
```

Both are pure — no repository or database import anywhere in either directory (Tech Arch's own domain-layer rule). The one place repository functions and these pure modules meet is a new, matching feature-layer pair: `src/features/healthSummary/getHealthSummary.ts` (+ `getDoctorReportInput.ts`) and `src/features/timeline/getTimelineEvents.ts` — plain functions, not React hooks (Phase W builds no UI); a future Phase X/Y/Z hook wraps these rather than duplicating them.

**`DoctorReportInput` as the AI's actual input contract:** it is a type alias for `HealthSummary`, not a parallel shape — the object `buildHealthSummary()`/`buildDoctorReportInput()` returns is the same object `buildAiSafeHealthSummaryPayload()` strips down for the future AI layer in §14. This guarantees the AI can never see a number the on-screen report doesn't also show, and that a fix to the Report's math is automatically a fix to the AI's math.

**Testing bar — met:** every new function ships with the same unit-test discipline already established for `domain/insights` and `domain/scheduling` — pure-function tests (`domain/healthSummary/__tests__`, `domain/timeline/__tests__`) plus real-database integration tests for the feature-layer wiring (`features/healthSummary/__tests__`, `features/timeline/__tests__`, using the same `createTestDatabase` harness `migrations.test.ts` already established). 53 new tests, full suite green (§16).

## 13. AI safety contract

Restating the brief's contract as an implementation mechanism, not just a policy list — because a prompt instruction alone is not a safety contract for health content.

**Two enforcement layers, not one:**

1. **System prompt constraints** (soft layer) — the LLM is instructed with the full "must never / may" list from the brief, verbatim, as its system prompt. This alone is necessary but not sufficient for health content; layer 2 is what actually gates what ships.
2. **Deterministic response validation** (hard layer, runs inside the Amendment 1 gateway — the "output validation boundary" in §14's gateway responsibility list — on every response, before it ever reaches the mobile client) — a small rule-based checker that:
   - Rejects any response containing terms from a maintained denylist (diagnosis-adjacent language: "flare" outside the approved "high-symptom day" framing, "your disease," "getting worse," "getting better," medication-efficacy language: "is working," "isn't working," dosage/medication-change verbs: "start," "stop," "increase your dose," and comparable Turkish equivalents).
   - Rejects any response that introduces a number not present in the structured input it was given (a cheap, effective check against fabrication — every legitimate number in a response must trace back to `DoctorVisitReport`/`TimelineEvent` fields).
   - On rejection: falls back to the plain deterministic sentence (same fallback as §9's offline case) rather than retrying the LLM silently or showing nothing — a validation failure and a network failure degrade to the identical, already-designed safe state.

**The "MAY" list is the actual product surface**, not a permissive afterthought: summarize records, compute-and-restate descriptive statistics, organize timelines, explain what a recorded metric means in neutral language, prepare appointment talking points, explain approved Knowledge Hub content, and say when there's insufficient information. Every UX section above (§9, §10, §11) was designed to stay entirely inside this list — nothing proposed in this document asks the AI to do anything the brief's "MAY" list doesn't already cover.

## 14. AI privacy / data-flow model

This is the section the brief explicitly says must be resolved *before* any AI API is implemented (§ "AI PRIVACY" in the brief) — treated here as a gate on Phase AC/AD, not a formality.

**What leaves the device:** only the structured `DoctorVisitReport`/`TimelineEvent`/weekly-aggregate objects from §12 — numeric and categorical fields only (pain values, stiffness buckets, counts, dates, medication/injection names, lab values, Apple Health averages). **Free-text notes are excluded from every AI request in the first slice** — this is a deliberate, conservative default: notes are the one field a user might write anything into, including information they would not want summarized by a third-party model, and the brief's example outputs never require note content to work. Revisiting this is a distinct, later, explicitly-scoped decision, not a default to relax quietly.

**What never leaves the device:** anything RevenueCat-adjacent (entitlement status, purchase history — already excluded, this document changes nothing there), the user's name/email (this app has no account system to begin with), free-text check-in/appointment notes (see above), any HealthKit data type not already listed in §8's authorized set — **and, as of Phase W's approval, doctor and institution/clinic names.** They are not necessary for the Weekly Summary or Appointment Copilot (the AI's job is noting *that* an appointment exists, not *with whom*) and must not leave the device in the first AI slice. Implemented and tested in `src/domain/healthSummary/aiSafePayload.ts`'s whitelist stripper (Phase W) — a pure type + function, no network code, no provider SDK; the internal appointment/medication/injection IDs those same records carry are excluded for the same "not necessary for this job" reason.

**Provider/API architecture — Amendment 1 (approved, supersedes this document's original "direct client → provider" draft):**

```
mobile client  →  minimal server-side AI gateway / Edge Function  →  LLM provider
```

The mobile client **never** holds a provider API key and never calls the LLM provider's API directly — a key shipped inside a distributed mobile binary is extractable from the app package by any user, a standard, well-understood mobile-security exposure this app has never had to consider before (every prior data flow was purely on-device). The gateway is the only place a provider secret lives.

The gateway's responsibilities, as specified by Amendment 1 (this list is the gateway's actual scope for Phase AC — not aspirational):

- provider API-key protection (the key lives only in the gateway's own server-side environment, never in any client-shipped artifact)
- request authentication/authorization where applicable (scoped to what a single-tier, already-entitled-only user base in §18 actually needs — likely a lightweight app-level check rather than a full account system, decided in Phase AC)
- rate limiting (the mechanism behind §18's cost mitigation — enforced at the gateway, not trusted to client-side logic alone)
- strict input schema validation (rejects any request that isn't a well-formed `DoctorVisitReport`/`TimelineEvent`/weekly-aggregate object from §12 — the gateway is a second, server-side enforcement of "only structured data, never free text or raw records")
- an explicit health-data field whitelist (an allow-list of exactly which fields a request may contain, independent of and stricter than "whatever the client happens to send" — closes off any future client bug from silently widening what leaves the device)
- payload-size limits (a coarse additional guard against an oversized or malformed request)
- provider invocation (the only component that actually calls the LLM provider's API)
- an output-validation boundary (this is where §13's deterministic response validator — the denylist and no-unattributed-numbers checks — actually runs; validation happens at the gateway, not trusted to client-side code the app itself doesn't control end-to-end)
- generic error handling (the client only ever sees "succeeded" or "failed," never a provider-specific error that might leak infrastructure detail)

**Explicitly preserved from this document's original privacy stance — Amendment 1 changes *where* the boundary is enforced, not what crosses it:** the gateway is designed **stateless wherever technically practical** — it is a request/response pass-through with validation, not a service with its own database. **No cloud health-record database is created merely to support AI** (the brief's own explicit prohibition, restated as a hard architectural constraint here). The gateway does not intentionally persist health payloads, and does not log health payload bodies (only operational metadata — timestamps, status codes, rate-limit counters — the same class of logging any stateless API gateway needs to operate, never the request content itself). Free-text notes remain excluded from AI v1 (unchanged from this document's original §14). Raw HealthKit samples remain excluded from AI v1 (unchanged). RevenueCat continues to receive zero health information (unchanged). Provider selection remains deferred to Phase AC (unchanged) — Amendment 1 fixes the *shape* of the architecture, not the vendor.

**Retention:** nothing AI-related is persisted locally beyond the current session's rendered summary (regenerating produces a fresh request; there is no "AI history" store in v1), and nothing AI-related is intentionally persisted at the gateway either, per the statelessness principle above.

**Consent:** the explicit "Generate" tap (§9/§10) *is* the consent action for that specific request — there is no separate global "AI opt-in" toggle to build in v1, because there is no standing/background AI behavior to opt into. If Ask My Data (§11) or any recurring/background AI behavior is ever built, it requires its own explicit, additional consent surface at that time.

**Deletion:** since nothing AI-related is retained beyond a rendered screen, "delete all data" (`useDeleteAllData`) requires no new AI-specific deletion logic in v1 — noted explicitly here so it isn't rediscovered as a gap later.

**Failure/offline:** covered concretely in §17.

## 15. HealthKit privacy model

**Granular, purpose-scoped requests only** — the brief's own instruction, made concrete: the app requests exactly three read types (`HKQuantityTypeIdentifierStepCount`, `HKCategoryTypeIdentifierSleepAnalysis`, `HKQuantityTypeIdentifierRestingHeartRate`) and nothing else. No write access is requested at all in v1 (this app never writes health data anywhere). No "request everything, ask forgiveness" pattern.

**Apple's own denial-ambiguity design, and why it drives a specific UI decision (§8):** per Apple's current HealthKit documentation, an app cannot distinguish "user denied this read scope" from "no matching data exists" — this is intentional, to prevent an app from inferring sensitive information (e.g., a specific diagnosis-linked data type's mere presence/absence) from denial patterns. The consequence for this app: Insights' Apple Health card must never say anything that implies "you denied access" — only ever "not connected yet" (before first request) or a neutral "no data for this period" (after, regardless of the real reason). This is stated here as a **hard UI requirement**, not a nice-to-have, because getting it wrong actively leaks information the OS is specifically designed to protect.

**Apple's stated purpose-string and system-UI requirements** (Human Interface Guidelines, `developer.apple.com/design/human-interface-guidelines/healthkit`, current as of this research): request access only in context (at first use of the Apple Health card, not at launch/onboarding — already reflected in §8), use short descriptive purpose strings explaining the specific benefit, never build a custom screen that replicates the system permission sheet's own UI, and never attempt to manage access outside the OS's own Settings surface. `NSHealthShareUsageDescription` in `Info.plist` is the one native-config surface this touches — deferred to Phase AA, not added now.

**App Store Review Guideline 5.1.3, made concrete for this app** (current guideline text, `developer.apple.com/app-store/review/guidelines/`): HealthKit-sourced data may never be used for advertising, marketing, or general data-mining, and may only be used for health-management purposes (or health research with separate explicit consent this app does not seek). This app's use — showing steps/sleep/RHR back to the same user who authorized them, and later summarizing them in an AI report the user themselves requested — sits squarely inside "improving health management" and requires no additional consent flow beyond the HealthKit system sheet itself. The Guideline's data-mining prohibition is the direct reason §14 keeps HealthKit data out of every non-health-purpose pipeline (analytics, ads, RevenueCat) without exception.

**Never sent off-device without a future, explicit review:** per the brief, and consistent with §14 — HealthKit values only ever enter the AI pipeline as already-averaged numbers (§12), never as raw per-sample data, and only as part of a user-initiated report/summary generation, never in the background.

## 16. Local-vs-cloud data boundaries

A single explicit boundary diagram, because this document is the first in this app's history where one is actually needed:

```
┌───────────────────────────── ON-DEVICE (SQLite, expo-sqlite) ─────────────────────────────┐
│                                                                                              │
│  daily_check_in · check_in_body_area · medication* · injection* · lab_result ·             │
│  appointment · user_preferences · onboarding_state          [existing, Product 2.0]         │
│                                                                                              │
│  + is_high_symptom_day marker — resolved in Phase W per Amendment 2 (§19)      [Phase W/Y]  │
│  + hasRequestedHealthKitAuthorization flag (§8)                [new, Phase AA]              │
│  + Apple Health samples, read live from HealthKit on demand — never persisted into           │
│    this app's own SQLite (avoids a second, staler copy of Apple's own data)  [Phase AA]      │
│                                                                                              │
└──────────────────────────────────────┬───────────────────────────────────────────────────┘
                                        │  ONLY on an explicit user tap:
                                        │  "Generate" (weekly summary / Copilot / Ask My Data)
                                        │  → structured, numeric/categorical DoctorVisitReport
                                        │    / TimelineEvent[] JSON only (§14) — never notes,
                                        │    never raw HealthKit samples, never entitlement data
                                        ▼
                        ┌───────────────────────────────────────┐
                        │  Server-side AI gateway / Edge Function │   [new boundary — Phase AC only —
                        │  (Amendment 1 — stateless where          Amendment 1: the ONLY component
                        │   practical; no health payload logging;  that ever holds a provider key;
                        │   no cloud health-record DB; schema+      mobile client never calls the
                        │   whitelist validation; rate limiting;    provider directly]
                        │   output validation boundary)             │
                        └───────────────────┬─────────────────────┘
                                        │  provider-formatted request
                                        ▼
                              ┌─────────────────────┐
                              │   LLM provider API   │   [Phase AC/AD — provider chosen in Phase AC]
                              │  (stateless request)  │
                              └─────────┬────────────┘
                                        │  provider response
                                        ▼
                        gateway output-validates (§13) → validated text response
                                        │
                                        ▼
                              back on-device, rendered, not persisted (§14)
```

Everything above the "on-device" boundary line is unchanged by this specification's own new data (High-Symptom Day, HealthKit) — it is still 100% on-device, same as every existing table. Only the AI features cross the line, only on explicit request, only with the minimized payload in §14, and only through the gateway — never client-to-provider directly (Amendment 1).

## 17. Offline / failure states

| Scenario | Behavior |
|---|---|
| Doctor Visit Report, offline | Fully available — pure on-device computation, no network dependency in v1 (no AI, no PDF-export network step) |
| My AS Timeline, offline | Fully available — same reason |
| High-Symptom Day entry, offline | Fully available — a normal check-in write |
| HealthKit card, HealthKit unavailable (e.g. iPad, or authorization not yet granted) | Card shows its pre-connection "Connect Apple Health" state; never an error — absence of HealthKit is an expected, common state, not a failure |
| AI Weekly Summary / Copilot, offline or request fails | Falls back to the plain deterministic sentence (§9) — the user never sees a bare error state or a blank card for a feature that has a perfectly good non-AI version of the same information available locally |
| AI response fails validation (§13) | Same fallback as above — a safety rejection and a network failure are indistinguishable to the user, both degrade to the same safe, useful state |

## 18. Entitlement / paywall implications

**Recommendation: no new paywall tier, no per-feature gating, in Product 2.1.** All five features sit inside the same all-in hard paywall Product 2.0 already established (`docs/PAYWALL_AND_ENTITLEMENT_SPECIFICATION.md`) — an entitled user gets all of them, a non-entitled user (per the existing `RouteGate`) reaches none of the app, including these. This preserves the single-tier simplicity that's already shipped and avoids a second monetization decision layered on top of an already-recent one.

**The one real cost consideration this introduces:** unlike every other Product 2.0/2.1 feature, AI requests (§9/§10/§11) cost money per call to whichever LLM provider is chosen (§14) — this is new territory for a purely local-cost app. This is flagged here as an **engineering/ops requirement for Phase AC**, not a monetization decision for this document: a simple rate limit (e.g., a small number of "Generate" actions per day), enforced at the Amendment 1 gateway rather than trusted to client-side logic alone (a client-only limit is trivially bypassed by reinstalling or editing local state), is the recommended mitigation — framed to the user as a normal product limit ("generate again tomorrow"), not as a premium-vs-free distinction, because everyone using the app is already a paying, entitled user under the current model.

## 19. Data / schema impact analysis

Every schema change below is additive — no existing column removed or repurposed, matching the same rule Product 2.0's `onboardingVersion` migration already established (`src/db/schema/preferences.ts`'s own doc comment) and Tech Arch's own additive-migration principle.

**High-Symptom Day — RESOLVED in Phase W. A new column, `daily_check_in.is_high_symptom_day`, not a reuse of `flagged_important`.**

The Phase W investigation this section originally required is complete:

1. **`flagged_important`'s original semantics, recovered from the historical record.** It has existed since the very first schema commit (Phase 3, `9114f45`) — not "added in Phase 12" as this document first assumed — and `docs/TECHNICAL_ARCHITECTURE.md` documents its intended meaning explicitly and unambiguously: *"surfaces this check-in's note in Appointment Preparation"* (§"DailyCheckIn"), added specifically because "the already-approved UX spec requires Appointment Preparation to surface 'relevant user notes'" (same section), with its intended query pattern spelled out in §J step 7 ("Query `DailyCheckIn` rows in range where `flaggedImportant = true` for their notes"). This is a **note-curation flag** — "I want this note shown to my doctor" — a concept that has nothing to do with symptom intensity. A mild day with a noteworthy comment ("started a new supplement") and a severe day with no note at all are both coherent, common states under this real meaning; neither is coherent under "high-symptom day."
2. **Every existing reference enumerated** (full-repo search, not just the one already-known comment): `src/db/schema/checkIn.ts` (declaration), `src/db/migrations/0000_initial_schema.sql` (original migration), `src/repositories/checkInRepository.ts` / `.web.ts` (plumbing), `src/repositories/web/store.ts` (mock seed), `src/features/appointmentPreparation/useAppointmentPreparation.ts` (the one call site that discusses it, explaining why it deliberately does *not* gate on it today), `docs/TECHNICAL_ARCHITECTURE.md`, and `PROJECT_MEMORY.md`. No reference contradicts the note-curation reading above; none suggests it was ever intended as a symptom-intensity marker.
3. **Decision: a new column.** Given (1), this is squarely the "historically unrelated" case Amendment 2's decision rule names, not an ambiguous one — reuse would conflate two real, distinct, independently-useful concepts (a still-unbuilt "surface this note to my doctor" feature, and High-Symptom Day) under one boolean, with no way to later tell them apart. `daily_check_in.is_high_symptom_day` (boolean, `NOT NULL DEFAULT false`) was added via an additive migration (`0003_daily_prism.sql`, Phase W) — `flagged_important` is untouched and remains reserved for its own original, still-unbuilt purpose.
4. **The invariant holds exactly as specified:** the new column is set only by explicit user action, wired only as far as repository plumbing in Phase W (no UI) — no part of the system infers it from `pain`/`fatigue`/`morningStiffnessBucket`, and the domain layer's own `computeHighSymptomDays` reads the marker as recorded, never derives it.

Phase Y (the High-Symptom Day UI) is unblocked by this decision and may proceed when scheduled.

**My AS Timeline — no schema change.** Purely a derived, read-only presentation over six existing repositories (§7/§12) plus the new High-Symptom Day marker. This is the single largest confirmation in this document that the brief's own instinct ("investigate architecture before proposing persistence... should preferably be a derived presentation") was correct for this codebase specifically — every event type it needs already has a queryable date and a stable identity.

**Doctor Visit Report — no schema change.** A pure function output (§12), never persisted — regenerated on demand from the same range, always reflecting current data. (If PDF export ships later, the generated *file* may be cached to the filesystem for sharing, but the report's *content* remains unstored/regenerable — a caching decision, not a data-model one.)

**HealthKit — one new column.** `user_preferences.has_requested_healthkit_authorization` (boolean, default false) — the minimum state needed for §8/§15's UI rule. No Apple Health sample data is ever written into this app's own schema (§16) — it's read live from HealthKit each time the Insights card needs it, avoiding a second, potentially-stale copy of data Apple already owns and manages.

**AI features — no schema change.** Nothing AI-related is persisted (§14).

**Net schema impact for all of Product 2.1:** one new boolean column (HealthKit), one repurposed-or-added boolean column (High-Symptom Day), zero new tables. This is a deliberately small footprint for five features — a direct consequence of the "derived, not duplicated" design running through §7/§12/§16.

## 20. Accessibility considerations

- **High-Symptom Day is an accessibility feature as much as a product one.** Its entire premise — fewer fields, on the days a user has the least capacity — directly serves users with fatigue, pain-limited fine motor control, or low spoons on a given day. Large tap targets (reuse the existing `AccessibleTouchable` ≥44pt convention) and the shortest possible path from "tap the entry point" to "done" are treated as core requirements here, not polish.
- **Timeline** is a straightforward reverse-chronological list — VoiceOver reading order is the natural DOM order already used by every other list in the app (`GroupedList`/`ListRow`), no new pattern needed.
- **Doctor Visit Report** must remain fully readable by VoiceOver end-to-end (it's explicitly meant to be read/shared, so screen-reader parity is a functional requirement, not just a compliance one) — plain sectioned text and existing `ListRow`/`GroupedList` primitives, no chart-only information (every number that appears must also appear as text, matching the existing `TrendChart` "required text-equivalent summary" rule from Phase 12).
- **HealthKit tiles and AI summary text** are plain text, inheriting existing Insights/MetricCard accessibility behavior — no new pattern required.
- **This web dev environment cannot simulate VoiceOver or Dynamic Type** (confirmed limitation, restated from this session's own Phase S QA) — real device/VoiceOver verification for all five features is deferred to Phase AE, the same way it already is for the rest of the app.

## 21. EN/TR localization considerations

- Every new string (High-Symptom Day copy, Timeline event labels, Doctor Visit Report section headers/body, HealthKit card copy, AI card chrome) ships in both `en.json` and `tr.json` together, per the app's existing zero-orphan-key discipline (confirmed 466/466 parity as of Phase S).
- **AI-generated prose must be produced in the user's active locale**, not translated after the fact — the structured input to the LLM (§12/§14) includes the target locale, and the system prompt instructs generation directly in that language. This avoids a second translation step (cost, latency, and a second place for meaning to drift) and matches how the rest of the app already treats locale as an input to rendering, not a post-processing step.
- **Numbers themselves are never AI-generated text** — every number in an AI response must trace back to a field already formatted by this app's own `formatDate`/`formatShortDate`/numeric-formatting utilities before being handed to the LLM as a string, so decimal separators, date formats, and unit words ("dk"/"min") stay consistent with the rest of the app regardless of what the model does with surrounding prose. This is also enforced by §13's validation layer (no unattributed numbers).
- **"Flare" terminology risk is bilingual, not just an English content rule** — Turkish medical/lay vocabulary around "alevlenme" (flare) carries the same diagnostic-sounding weight the brief flags for English; the TR copy for High-Symptom Day needs the same "user-reported, not diagnosed" framing as the EN copy, reviewed as its own content-QA item in Phase Y, not assumed to inherit safety from the English string alone.

## 22. Release risks

| Risk | Severity | Mitigation |
|---|---|---|
| AI response contains diagnosis/efficacy/progression language despite the safety contract | High | §13's two-layer enforcement (prompt + deterministic validator with a maintained denylist) — treated as a shipping-blocking test category, not a review checklist item |
| HealthKit denial-ambiguity mishandled, app implies it knows a user declined access | Medium-high (a real privacy leak pattern, not just a UX rough edge) | §8/§15's explicit "never say 'denied,' only 'not connected' or 'no data'" rule, verified in code review before Phase AA ships |
| "Flare" language creeps back in (EN or TR) via a future contributor unaware of this document's framing | Medium | Content-QA step explicitly checking both locales' High-Symptom Day and Timeline copy against the brief's exact language rule, each time that copy changes |
| AI provider cost scales unexpectedly with usage | Medium | §18's rate-limit requirement, specified before Phase AC's provider selection, not after |
| ~~High-Symptom Day persistence decision skipped or rushed~~ — **closed in Phase W** | — | §19's investigation is complete and recorded; `is_high_symptom_day` is a new, separate column, `flagged_important` untouched |
| HealthKit cannot be validated in this project's usual dev-web-preview workflow | Medium (process risk, not a product risk) | §23 explicitly schedules Phase AA around native dev-client + physical-device QA, not this session's browser-only tooling — flagged now so it isn't discovered as a surprise mid-phase |
| AI feature is the first to send any user content off-device — a scope users may not expect from a "local-first" app | Medium | §9's visible "What data is used for this?" explanation at the point of first use, plus §14's minimized payload, so the actual scope is small and disclosed at the moment it matters |
| Doctor Visit Report or Timeline is misread as a clinical/diagnostic document despite its framing | Medium | §5's explicit non-goal list enforced as UI constraints (no scores, no color zones, no trend arrows) rather than relying on a disclaimer alone |
| The Amendment 1 gateway itself becomes a new attack surface or single point of failure (this app has never operated server-side infrastructure before) | Medium | Scoped deliberately small and mostly stateless (§14) — a validation/rate-limit/proxy layer, not a service holding its own data store; hosting-platform choice made in Phase AC against this requirement, not decided speculatively here |

## 23. Proposed implementation phases

Broadly the brief's own suggested ordering, adjusted where this session's research/codebase reading found a reason to reorder or split:

- **Phase S.1** — Finish/commit the existing, already-QA'd Phase S work (unchanged from the brief).
- **Phase W** — Product 2.1 architecture + data contracts: the `src/domain/reporting/` module (§12), the `DoctorVisitReport`/`TimelineEvent` types, and their unit tests — built and tested *before* any UI, so Phases X/Y/Z all consume an already-correct layer. **Also the phase that resolves Amendment 2**: investigate `flagged_important`'s original semantics and every existing reference (`useAppointmentPreparation.ts` and any other call site), and produce an explicit, recorded persistence decision for High-Symptom Day (§19) *before* Phase Y's UI work starts — Phase Y does not begin until this decision exists.
- **Phase X** — My AS Timeline (UI over Phase W's `buildTimelineEvents`) — no schema change, lowest-risk feature, ships first to validate the aggregation layer against a real screen.
- **Phase Y** — High-Symptom Day (schema decision from §19, reduced check-in flow, Timeline event type wiring) — small schema footprint, direct product value, no native/AI dependency.
- **Phase Z** — Doctor Visit Report (UI over Phase W's `buildDoctorVisitReport`, copy-as-text action) — the PDF-export affordance is added as a visible-but-disabled "Coming soon" state here, not built.
- **Phase AA** — HealthKit read-only integration — **gated on a native dev-client build**, since Expo Go cannot validate real HealthKit data (confirmed in this document's research, §26) and this session's tooling is browser-only; requires a physical iPhone QA pass this session explicitly cannot perform. EAS/signing remain out of scope per the brief even for this phase's own build needs — a local dev-client build is sufficient and is a distinct, smaller step from an EAS release build.
- **Phase AB** — Fold HealthKit context into Phase W's aggregation layer and into the Doctor Visit Report's Apple Health section (§5) — kept as its own phase rather than merged into AA so the native-integration risk (AA) and the reporting-logic risk (AB) aren't debugged together.
- **Phase AC** — AI privacy/backend architecture: **build the Amendment 1 server-side gateway** (schema/whitelist validation, rate limiting, the §13 output-validation boundary, generic error handling — the full responsibility list in §14), select a provider against §14's retention-terms criterion, and define the gateway's request/response contract — explicitly a design-and-infrastructure phase with no user-facing AI output yet, matching the brief's own instruction not to implement an AI API before this review exists. This is also where Phase AC's own hosting choice (a specific Edge Function/serverless platform) is made — an open decision, §25.
- **Phase AD** — AI Weekly Summary + Appointment Copilot (UI + prompts, built against Phase AC's already-reviewed architecture).
- **Phase AE** — Product 2.1 cross-app QA / feature freeze — same discipline as Phase S (full-flow audit, responsive QA, localization/accessibility pass, health/privacy safety re-scan extended to cover the five new features and the new AI data flow specifically).

**Then, unchanged from the brief:** resume dependency alignment (Phase L), native device QA, RevenueCat sandbox, EAS / Apple release preparation.

**One reordering worth flagging explicitly:** the brief's own ordering places HealthKit (AA) before the deterministic aggregation engine (AB, "Phase AB" in the brief's list). This document instead builds the *general* aggregation layer in Phase W — before Timeline/High-Symptom Day/Doctor Visit Report even start — because those three earlier phases already need it; HealthKit-specific aggregation (steps/sleep/RHR averages) is a small, later addition (Phase AB here) to an already-existing layer, not the layer's own foundation. Net effect is the same total scope, reordered so nothing in Phases X–Z is built on a not-yet-existing aggregation module.

## 24. Research sources

- Apple, *App Review Guidelines* §5.1.3 (Health and Health Research) — advertising/marketing/data-mining prohibition on HealthKit-sourced data, false-data-writing prohibition, no personal health information in iCloud, informed consent for human-subject research. `developer.apple.com/app-store/review/guidelines/`
- Apple, *Human Interface Guidelines — HealthKit* — context-sensitive permission requests, purpose-string requirements, prohibition on custom permission screens replicating the system sheet, Settings-only access management. `developer.apple.com/design/human-interface-guidelines/healthkit/`
- Apple Developer Documentation, `HKHealthStore.authorizationStatus(for:)` and related HealthKit authorization behavior — confirms read-access denial is indistinguishable from absent data by design, a privacy-preserving mechanism this document's §8/§15 UI rules are built directly around.
- Apple Developer Documentation, `restingHeartRate` (`HKQuantityTypeIdentifier`) and general HealthKit sleep-analysis (`HKCategoryTypeIdentifier.sleepAnalysis`) reference — confirms the three requested data types' availability and that basic sleep analysis does not require an Apple Watch.
- `react-native-health` (`agencyenterprise/react-native-health`) and `@kingstinct/react-native-healthkit` — current Expo-compatible HealthKit bindings, both requiring a custom dev client (`expo-dev-client`/prebuild), confirming Expo Go cannot validate this feature and grounding §23's Phase AA gating.
- Bearable, Flaredown, and Flura (chronic-illness symptom trackers) — competitive confirmation that "structured doctor-visit report" and "pattern-summary for an appointment" are validated, existing product categories in this space, not a novel or unusual feature to build; used here only to confirm demand and rough shape, not copied structurally.
- This repository's own `docs/PRODUCT_2_0_UX_SPECIFICATION.md`, `docs/PAYWALL_AND_ENTITLEMENT_SPECIFICATION.md`, `docs/TECHNICAL_ARCHITECTURE.md`, and `PROJECT_MEMORY.md` — the primary grounding for every architectural claim in this document; read directly, not assumed.

## 25. Open decisions

| # | Decision | Recommendation | Owner |
|---|---|---|---|
| 1 | ~~Does `daily_check_in.flagged_important` semantically match "high-symptom day," or does it need a fresh column?~~ | **Resolved in Phase W: a new column, `is_high_symptom_day`.** Investigation found `flagged_important`'s real, documented meaning is unrelated note-curation, not symptom intensity (§19) | Closed |
| 2 | LLM provider selection | Deferred to Phase AC against §14's retention-terms criterion — not a decision for this document | Furkan, at Phase AC |
| 3 | Whether free-text notes are ever included in AI input | Excluded by default in this document (§14); revisit only as its own explicitly-scoped decision | Furkan, post-launch at earliest |
| 4 | PDF export timing | Build only on real post-launch demand signal, not speculatively (§5) | Furkan, post-Phase Z |
| 5 | AI usage rate limit shape (count vs. time-window vs. none) | A simple daily count limit recommended, enforced at the Amendment 1 gateway (§18); exact number is a Phase AC implementation detail | Furkan, at Phase AC |
| 6 | Gateway hosting platform (Amendment 1) — e.g. a serverless/Edge Function provider | Not decided in this document; chosen in Phase AC against the statelessness, cost, and no-health-data-logging requirements in §14 | Furkan, at Phase AC |
| 7 | Gateway request authentication/authorization shape (Amendment 1) | Likely a lightweight app-level check rather than a full account system, given this app's existing single-tier, already-entitled-only user model (§18) — not finalized here | Furkan, at Phase AC |

---

**End of specification. No implementation performed. `docs/PRODUCT_2_1_SPECIFICATION.md` is the only file this document creates or modifies.**
