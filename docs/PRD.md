# Product Requirements Document — V1

## Summary
- Product: Ankilozanapp (working title)
- Version: V1 (approved product definition)
- Owner: Furkan
- Status: **Approved.** Ready as the basis for UX design. Does not by itself authorize engineering or Expo scaffolding.

Instantiated from `../../furkan-ai-product-os/01_PRODUCT/PRD_TEMPLATE.md`, extended with the data-model and journey boundaries needed to fully bound V1.

---

## 1. Core user problem

People living with ankylosing spondylitis (AS) or axial spondyloarthritis (axSpA) manage a recurring, multi-track treatment life — medications, biologic injections, lab checks, and rheumatology appointments — each on its own schedule, with no single place that remembers all of it. Between visits they lose track of how symptoms have trended, and they arrive at appointments without a clear summary of the period since the last one. Generic health trackers aren't built around this specific journey.

## 2. Target user

Adults diagnosed with AS/axSpA who need a simple way to manage recurring treatment and understand how their symptoms are changing over time. Today they rely on memory, spreadsheets, paper notes, or generic trackers not designed for this condition.

## 3. Job to be done

When I'm living with AS/axSpA between rheumatology appointments, I want one place that remembers my medications, injections, symptoms, and labs and tells me what's due, so I can stay on top of my treatment and walk into my next appointment prepared.

## 4. Value proposition

**"The app remembers what happens between rheumatology appointments."**

Not a generic symptom tracker, not a fitness app repurposed for illness — a companion built specifically around the AS/axSpA treatment rhythm.

## 5. First-value moment

First value is reached when the user adds their **first medication or injection** during setup and immediately sees the **Today** screen correctly reflect it — a calculated next-dose or next-injection date, without needing days of accumulated history. This is the moment the app proves it "remembers" for them, not a moment that depends on waiting.

Target: reachable within the first session, in well under a minute of data entry.

Daily check-in is the *repeat*-value moment, not the *first*-value moment — it depends on nothing being tracked yet and stands on its own as a 10–15 second habit.

## 6. Primary user journey

```
Install / open
   → Minimal setup: add current medication(s) and/or injection(s),
     optionally next known appointment
   → Today populates immediately (next dose, next injection, upcoming
     appointment) — FIRST VALUE
   → Daily symptom check-in becomes a short recurring habit — REPEAT VALUE
   → Medication/injection taken-or-missed logging accumulates history
   → Lab values entered as results become available
   → Insights become meaningful once enough history exists
   → Before next rheumatology appointment: Appointment Preparation
     surfaces a summary of the period since the last visit
   → Cycle repeats after each appointment
```

No monetization step exists in this journey for V1 (see §9).

## 7. Scope

### Must have (V1)
1. Today (daily command center)
2. Daily symptom tracking
3. Medication management
4. Injection management
5. Medical appointments
6. Laboratory results (CRP, ESR as first-class predefined markers; extensible)
7. Disease activity tracking (BASDAI, provisional — see §10.6)
8. Insights (descriptive trends only)
9. Appointment preparation (in-app summary view)
10. Reminders (local notifications, privacy-preserving by default)

### Nice to have (not V1, direction approved — implementation deferred)
- Shareable doctor summary as a **human-readable PDF**.
- Personal data export as **structured CSV and/or JSON**.
- ASDAS scoring.
- Additional lab markers beyond CRP/ESR.

### Explicitly out of scope (current phase)
Exercise or physiotherapy functionality, nutrition functionality, community/social features, gamification (including streaks), medical diagnosis, automatic flare diagnosis, medication recommendations, treatment recommendations, doctor replacement, AI-generated medical advice, wearable integrations, doctor portal, ASDAS, any paywall/premium tier, third-party analytics SDK, server-side push notifications (default assumption), export implementation (direction approved, not built yet).

## 8. Information architecture

Tentative top-level navigation — **not final until UX phase validates it**:

- **Today** — daily check-in entry point, today's medications, next injection, upcoming reminders, upcoming appointment, pending health tasks.
- **Track** — consolidated data entry/management: Symptoms (check-in history), Medications, Injections, Labs.
- **Appointments** — list, add/edit, and the Appointment Preparation view.
- **Insights** — trend views: pain, morning stiffness, fatigue, medication adherence, injection history, CRP/ESR history, BASDAI history (once implemented).
- **Profile** — account, data export/delete, reminder settings, language, non-diagnostic disclaimer / about.

This structure keeps recording (Track) separate from reflection (Insights) and preparation (Appointments), so the daily-use surface (Today) stays uncluttered. Final validation happens in the UX phase (see `docs/UX_SPECIFICATION.md`).

## 9. Monetization

**Undecided — not designed in V1.** All V1 functionality (medication, injection, appointment, and symptom tracking) is free with no gating. Architecture should remain compatible with RevenueCat if a model is introduced later, but no paywall, plan, or premium boundary exists in this phase.

## 10. Data / feature models

### 10.1 Daily check-in model
- Fields: pain intensity (0–10), morning stiffness duration, fatigue (scale), optional general wellbeing, optional affected body area.
- One check-in per calendar day; editable same-day.
- Skippable with no punitive UI — no streaks, no guilt copy. A missed day is simply a gap in the trend later, never flagged as failure.
- Target completion time: well under 30 seconds.

### 10.2 Medication model
- Fields: name, dose, frequency, schedule (time(s) of day / specific days), optional notes.
- Recurring reminders generated from schedule.
- Per-scheduled-dose logging: taken / not taken / skipped.
- **Historical accuracy rule**: historical administration records must remain historically accurate. Editing a medication's schedule must never retroactively rewrite previously logged doses. Schedule changes affect future expected events only.

### 10.3 Injection model
- Fields: treatment name, dose, interval, last injection date, next injection date, reminder lead time, per-scheduled-injection status (completed / missed / upcoming).
- Next injection date is system-calculated from `last injection + interval`, recalculated forward each time a new injection is logged.
- **Historical accuracy rule**: if the interval itself changes (e.g., doctor adjusts dosing), recompute future dates only. Previously logged injection history must never be retroactively rewritten.

### 10.4 Appointment model
- Fields: type (rheumatology / laboratory / imaging / other), doctor or institution, date, time, notes, reminder timing.
- Surfaces on Today when within a configurable upcoming window (proposed default: 7 days).

### 10.5 Laboratory tracking model
- V1 provides CRP and ESR as **first-class predefined markers**.
- Fields per entry: marker type, value, unit, date recorded, optional institution, optional notes.
- Architecture must store marker type as an extensible field (not one hardcoded column per marker) so additional markers can be added later without a schema migration. The user-facing mechanism for adding markers beyond CRP/ESR is not designed in V1.
- Presentation: chronological list plus a simple trend view. **No unrestricted medical interpretation of lab values** — no reference-range diagnosis, no automated "high/low/abnormal" clinical judgment beyond displaying the recorded number against the user's own history.

### 10.6 Disease activity tracking (BASDAI)
- Structured periodic questionnaire, presented on its own schedule (not daily).
- **Kept out of implementation** until questionnaire usage rights, attribution/licensing requirements, exact questionnaire wording, and scoring accuracy are verified against the original instrument. This is a hold on building it, not just a UI caveat.
- **Must not block the rest of V1** — every other feature in §7 ships independent of BASDAI's status.
- When implemented, result is shown as a self-reported score with its own history — never labeled a diagnosis or medical conclusion.
- ASDAS explicitly excluded from V1 entirely.

### 10.7 Insights boundaries
Shown: trend summaries for pain, morning stiffness, fatigue, medication adherence history, injection history, CRP/ESR history (BASDAI history once implemented).

Never shown: automated flare labels, correlation presented as causation, predictive statements about disease course, treatment-efficacy or treatment-failure scoring, causal claims between treatment and symptom changes. All language must stay descriptive and tied directly to what the user entered (e.g., "your average pain this week was higher than last week" — not "your AS appears to be worsening").

### 10.8 Appointment preparation experience
- **Lookback rule**: if a previous rheumatology appointment exists in the app, summarize the period since that appointment. If no previous rheumatology appointment exists, summarize the previous 90 days. The exact date range being summarized must always be clearly displayed on the screen.
- Entry: from an upcoming rheumatology appointment, or opened manually.
- Content: symptom trends within the resolved date range, medication adherence summary, injection history since last visit, recent lab values, user notes flagged as important.
- V1 is an in-app read-only summary view. PDF export is an approved future direction, not built in V1 (see §10.9 Export direction).

### 10.9 Reminder behavior and notification privacy
- **Local, on-device notifications** for medication, injection, appointment, and lab/user-created health tasks — no server-side push in V1 unless a concrete requirement later proves it necessary.
- Notification permission requested contextually (at the point reminders become relevant), with a working experience if denied — reminders support core tracking, they never gate it.
- **Default notification copy is privacy-preserving** and must not expose medication or injection names on the lock screen. Example default: *"You have a health reminder."*
- Showing detailed content (e.g., medication name) in notifications may become an explicit, user-controlled setting later — off by default.
- Symptom values, lab values, and health notes must never appear in a notification payload, regardless of the detail setting.

### 10.10 Export direction (approved, not implemented in V1)
- **Doctor-sharing output**: human-readable PDF summary (future).
- **Personal data export**: structured CSV and/or JSON (future).
- No export mechanism is built in V1; this is a direction to design toward, not a V1 deliverable.

### 10.11 Localization
- V1 target languages: **English and Turkish**.
- Architecture and UX must be localization-ready from the beginning — externalized strings, no logic keyed on English text.
- Layouts must not depend on fixed English string lengths (Turkish strings commonly run longer); this is a binding UX constraint carried into `docs/UX_SPECIFICATION.md`.

## 11. Empty / loading / error / offline expectations

Full state-by-state specification is carried forward into `docs/UX_SPECIFICATION.md`. Boundaries fixed at this phase:

- **Today, no data yet**: prompts the user toward the first setup action (add a medication/injection) rather than showing a blank screen.
- **Insights, insufficient history**: explains that more data is needed, never renders an empty or misleading chart.
- **Offline**: core recording (check-in, marking medication/injection taken, adding a lab value or appointment) must never be blocked by lack of connectivity. Already-loaded data remains viewable offline; sync happens on reconnect. The specific offline/sync architecture is an engineering decision for a later phase.
- **Errors**: plain-language, recoverable, preserve whatever the user already entered — per `03_ENGINEERING/ERROR_HANDLING_AND_LOGGING.md`.

## 12. Privacy-sensitive user journeys

- Onboarding — any consent/disclosure moment for health data collection.
- Data export flow (direction approved in §10.10; not built in V1).
- Account and data deletion flow — deleting the account must delete associated health data.
- Appointment Preparation summary — aggregates multiple sensitive categories on one screen; screenshot/exposure risk is a UX-phase consideration.
- Reminder/notification content — governed by §10.9; must not leak health values via lock-screen previews.

## 13. Medical-safety boundaries

- No diagnosis, no automated flare declaration, no medication or treatment recommendation, no claim of treatment efficacy or failure, no causal claims between treatment and symptom changes.
- BASDAI stays out of implementation until verified (§10.6); when built, it is a self-reported score with history, never a clinical conclusion.
- ASDAS excluded from V1 entirely.
- No AI-generated medical interpretation anywhere in V1.
- A future assistant layer, if built, may only organize, retrieve, summarize, and contextualize user-entered data (e.g., *"Your recorded morning stiffness has been higher than your recent average for the past several days"*) — never diagnose or recommend treatment changes (e.g., never *"Your AS is flaring. Increase your medication."*).

## 14. Remaining open decisions

All eight decision areas raised at the end of Product Discovery have been resolved at the direction level (see §10 and §15). What remains genuinely open, to be resolved in later phases:

1. **BASDAI cadence** — moot while BASDAI stays out of implementation (§10.6); revisit once verification is complete.
2. **Analytics provider and event list** — intentionally deferred; no SDK selected. Per §16, health data must never be sent to analytics regardless of provider chosen later.
3. **Future lab-marker-addition mechanism** — CRP/ESR are fixed for V1; how a user would add a marker beyond these is not designed.
4. **Export implementation timing** — direction is approved (§10.10) but no implementation date or trigger is set.

## 15. Success metrics — Approved

Per `01_PRODUCT/SUCCESS_METRICS.md`: one primary metric per release, supporting metrics explain why it moved.

### Primary metric — Activation (approved)
**% of new users who add at least one medication, injection, or appointment and see Today correctly reflect it during their first session.**

### Guardrail metrics (approved)
- **7-day check-in engagement**: % of activated users who log at least one daily check-in within days 2–7.
- **Check-in abandonment rate**: rate of started-but-not-completed check-ins — should stay near zero given the "intentionally short" design.
- **Notification permission denial / opt-out rate**: guards against a design that makes reminders feel necessary rather than supportive.

These remain **product metrics only** for now. No analytics SDK is selected or installed; these are not instrumented yet.

## 16. Analytics and data-handling constraints

- No analytics SDK is selected in V1. Selection is deferred to a later, dedicated decision (per `03_ENGINEERING/ANALYTICS_SDK_CONTROL.md`).
- When an SDK is eventually selected, symptom, medication, laboratory, appointment, and health-note *values* must never be sent as analytics properties — only structural/behavioral events (e.g., "check-in completed") without underlying health content.
- Health values must never be embedded in analytics events, crash logs, or notification payloads (see §10.9).

## 17. Risks

- **Product/trust**: any drift toward diagnostic-sounding language in Insights or BASDAI would break the core safety boundary and user trust.
- **Privacy**: this is special-category health data; consent, export, and deletion flows are directionally defined but not yet designed in detail.
- **Clinical**: BASDAI questionnaire licensing/attribution unverified — held out of implementation until resolved.
- **Operational**: local-only reminders mean reliability depends entirely on OS-level notification behavior; no server-side fallback in V1.
- **Localization**: Turkish string length and pluralization/date-format differences must be designed for from the start, not retrofitted.
- **App Review**: health-adjacent apps draw extra scrutiny; non-diagnostic disclaimer and privacy-answer accuracy will matter at submission.

## 18. Acceptance criteria for this phase

This document bounds V1 to the ten features in §7 with explicit non-goals, defines a first-value moment independent of accumulated history, defines data-level boundaries (§10) including historical-accuracy, notification-privacy, export-direction, and localization rules, states medical-safety and privacy boundaries explicitly, and leaves only genuinely open items in §14. It does not authorize engineering or Expo scaffolding — those follow after UX design (`docs/UX_SPECIFICATION.md`) is itself approved.
