# Project Context

## Identity

- Product name: Ankilozanapp (working title — final name not yet decided)
- Platforms: iOS-first; Android compatibility deferred
- Production status: Greenfield — no application code exists yet
- Current version: N/A
- Repository default branch: main
- Paying users or existing entitlements: None

## User and problem

- Primary user: Adults diagnosed with ankylosing spondylitis (AS) or axial spondyloarthritis (axSpA)
- Triggering situation: Managing recurring treatment, symptoms, and medical follow-up in the period between rheumatology appointments
- Core problem:
  - Users forget medication or injection schedules.
  - Users struggle to remember how pain and stiffness changed over weeks or months.
  - Blood test results are scattered across different systems and documents.
  - Users often arrive at rheumatology appointments without a clear summary of the period since their previous visit.
  - Appointments, lab checks, injections, and medications each run on different schedules.
  - Existing generic health trackers are not designed around the AS/axSpA patient journey.
- Desired outcome: The user always knows what's due, can see how they've been trending, and arrives at each appointment with a clear, organized summary.
- Current alternatives: Generic health trackers, spreadsheets, paper notes, memory.
- Product promise: "The app remembers what happens between rheumatology appointments."

## Scope

### Core flow
Today (daily command center) → daily symptom check-in → medication/injection/appointment/lab tracking → insights → appointment preparation.

### Current features (V1)

1. **Today** — daily command center: symptom check-in, today's medications, next injection, upcoming reminders, upcoming medical appointment, important pending health tasks.
2. **Daily symptom tracking** — pain intensity (0–10), morning stiffness duration, fatigue, optional general wellbeing, optional affected body area. Intentionally short.
3. **Medication management** — name, dose, frequency, schedule, optional notes; recurring reminders; taken/not-taken logging.
4. **Injection management** — treatment name, dose, interval, last/next injection, reminder schedule, completed/missed status; system calculates future injection dates from interval.
5. **Medical appointments** — rheumatology, laboratory, imaging, other; type, doctor/institution, date, time, notes, reminder timing; surfaced on Today when relevant.
6. **Laboratory results** — manual entry, initially CRP and ESR; architecture must allow additional user-defined/future markers; chronological view and trends, no diagnosis.
7. **Disease activity tracking** — BASDAI as a structured periodic questionnaire; never presented as a diagnosis or medical conclusion. ASDAS may come later; does not block V1.
8. **Insights** — understandable historical summaries: pain trend, morning stiffness trend, fatigue trend, medication adherence history, injection history, CRP/ESR history. May describe observed changes; must not diagnose progression, flare, treatment failure, or treatment response.
9. **Appointment preparation** — pre-appointment summary of recent symptom trends, medication history, injection history, recent labs, notable user notes. Future direction: shareable doctor summary or PDF (not V1).
10. **Reminders** — local notifications for medication, injections, appointments, blood tests, and user-created health tasks.

### Explicitly out of scope (current phase)
- Exercise or physiotherapy functionality (deliberately deferred)
- Nutrition functionality
- Community/social features
- Gamification (including streaks)
- Medical diagnosis
- Automatic flare diagnosis
- Medication recommendations
- Treatment recommendations
- Doctor replacement
- AI-generated medical advice
- Wearable integrations
- Doctor portal

### Current priority
Define and validate V1 scope above at the product/UX level before any implementation. Exercise system explicitly deferred beyond V1.

### Primary metric
**Unresolved.** Candidate directions (not yet chosen): daily check-in completion rate, activation (first meaningful Today-screen use), or appointment-preparation usage. Needs explicit decision before instrumentation.

### Guardrail metrics
**Unresolved.** Should be defined alongside the primary metric — likely candidates include reminder reliability (missed/late notifications) and data-entry abandonment, given the "calm, not alarming" principle.

## Technology

- Expo SDK: Not yet installed — to be confirmed at scaffolding time (current stable release)
- React Native version: Not yet installed
- TypeScript version: Strict mode required; exact version TBD at scaffolding
- Package manager: Not yet decided
- Backend: Supabase (planned)
- Authentication: Not yet decided (Supabase Auth presumed; exact method — email/password, magic link, Sign in with Apple — unresolved)
- Subscription provider: RevenueCat — architecture must remain compatible; not implemented, no paywall in V1
- Analytics: **Unresolved** — no provider selected; must be chosen under the minimal-stack and data-minimization rules given sensitive health data
- Error monitoring: Not yet decided
- Build/release system: EAS Build (planned)
- Native folders committed: Not yet decided (managed workflow expected by default)

## Product rules

- Free value: All V1 functionality (medication, injection, appointment, and symptom tracking) is free; no essential tracking feature may be gated behind payment.
- Premium value: **Unresolved** — business model undecided; do not design V1 around a paywall.
- Existing subscriber behavior that must be preserved: N/A — no subscribers exist.
- Data and privacy constraints: Treat as sensitive — symptoms, medication usage, injection history, laboratory values, medical appointments, personal health notes. Avoid unnecessary data collection. No advertising SDKs or unnecessary third-party tracking.
- Localization requirements: **Unresolved** — not specified in product brief.
- Accessibility requirements: High priority from the start — plain language, readability, and standard accessibility support (Dynamic Type, VoiceOver, contrast) per `02_DESIGN/ACCESSIBILITY_CHECKLIST.md`.

## Design direction

- Brand qualities: Calm, modern, premium but restrained, highly readable, native iOS feeling, clear hierarchy, minimal cognitive load.
- Existing design tokens/components: None yet.
- Visual references: None specified in brief.
- Patterns to avoid: Overly clinical/hospital aesthetics, excessive cards and dashboard clutter, decorative gamification, streaks, alarming visuals or urgency-driven UI.

## Known risks and debt

- Known crashes/bugs: None — no code exists yet.
- Fragile integrations: None yet.
- Pending migrations: None.
- Areas agents must not modify without approval:
  - Exercise system (deliberately deferred — do not implement).
  - Any copy or UX that could imply diagnosis, clinical certainty, disease-progression prediction, treatment efficacy, treatment failure, or medication changes.
  - Monetization/paywall model (undecided — do not introduce gating).
  - Assistant-layer behavior (if/when built): must only organize, retrieve, summarize, and contextualize user-entered data — never invent medical conclusions or recommend treatment changes.

## Definition of success

For this initialization phase: `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `PROJECT_CONTEXT.md`, `PROJECT_MEMORY.md`, and `README.md` exist, accurately reflect the approved product brief, and pass the `09_CHECKLISTS/NEW_PROJECT.md` checklist for every item that is currently answerable. Decisions that remain open must be explicitly recorded here as unresolved — not silently assumed — before any Expo scaffolding, dependency installation, or feature implementation begins.
