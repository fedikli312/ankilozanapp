# V1 Implementation Plan

Status: **Approved.** This is the Product OS Engineering Mode "plan" phase that follows `docs/TECHNICAL_ARCHITECTURE.md` (approved) and precedes Expo scaffolding and application code. Per the Safe AI Change Workflow (`06_AI_WORKFLOWS/SAFE_CHANGE_WORKFLOW.md`) this document is the "Plan" step — Inspect → **Plan** → Isolate → Implement. Approved for execution of Phases 0–7 only (foundation); Phase 8 onward (product feature implementation) requires a separate explicit approval before starting.

Built from `PROJECT_CONTEXT.md`, `PROJECT_MEMORY.md`, `docs/PRD.md`, `docs/UX_SPECIFICATION.md`, `docs/VISUAL_DESIGN_SPECIFICATION.md`, `docs/TECHNICAL_ARCHITECTURE.md`, and `../furkan-ai-product-os`'s `06_AI_WORKFLOWS/SAFE_CHANGE_WORKFLOW.md`, `03_ENGINEERING/BRANCH_AND_ROLLBACK.md`, `03_ENGINEERING/DEPENDENCY_POLICY.md`, `03_ENGINEERING/TESTING_STRATEGY.md`, `09_CHECKLISTS/NATIVE_SDK_INTEGRATION.md`.

No application code, dependencies, or Expo scaffolding are created by this document. It defines the sequence in which they will be created, once approved.

---

## 1. Recommended project folder structure

Adopts `docs/TECHNICAL_ARCHITECTURE.md` §S as final, unchanged:

```
app/                          # Expo Router routes — thin, compose feature screens
src/
  features/                   # feature-scoped UI + application-service hooks
  domain/                     # pure logic: constants, scheduling, insights, appointment-prep, notification policy
  repositories/               # the only layer that imports src/db — one module per entity
  db/                         # schema, migrations, client
  notifications/              # expo-notifications wrapper, reconciliation, copy templates
  localization/                # en.json / tr.json, Intl formatting helpers
  design-system/              # tokens + shared components
  shared/                     # types, utils
```

No change proposed here — restated because every phase below is defined in terms of which of these directories it populates, in order.

## 2. Expo scaffold strategy

- Managed workflow, Expo Router, TypeScript strict — per Tech Arch §B.
- Scaffold produces **structure only**: routing skeleton, `tsconfig.json`, EAS project linkage, empty directories from §1 with placeholder index files. No feature logic, no database, no notifications in this step.
- Confirm current Expo SDK / React Native / TypeScript versions against `docs.expo.dev` immediately before running the scaffold command — not from this plan's memory (versions here are directional, per Tech Arch's own disclaimer).
- Do not commit a package manager choice speculatively — confirm npm vs pnpm vs yarn compatibility with the current Expo CLI at scaffold time; default to `npm` if no constraint is found.

## 3. Dependency plan

Dependencies are introduced **just-in-time, per phase**, not all upfront — per Dependency Policy ("add a dependency only when its value exceeds maintenance/build/bundle cost") and to keep each phase's diff reviewable and attributable.

| Phase introduced | Dependency | Reason |
|---|---|---|
| Scaffold | `expo`, `expo-router`, TypeScript | App framework baseline |
| DB foundation | `expo-sqlite`, then `drizzle-orm` + `drizzle-kit` **only if** P0 confirms compatibility | Local database; conditional per Tech Arch §C |
| Notification foundation | `expo-notifications` | Local reminder scheduling |
| Localization foundation | `expo-localization`, `i18n-js` | Locale detection + string translation |
| Never | Redux/MobX/Zustand, analytics SDK, crash-reporting SDK, Supabase client | Explicitly excluded from V1 per Tech Arch §K, §M, §T |

Each dependency addition is its own reviewable commit within its phase's branch, stating the exact capability needed (Dependency Policy step 1) before the `package.json` diff.

## 4. SQLite/Drizzle initialization sequence

1. Confirm drizzle-orm/expo-sqlite compatibility against official docs (Phase 0 — decision only, no code).
2. Install `expo-sqlite` (+ `drizzle-orm`/`drizzle-kit` if confirmed).
3. `src/db/client.ts` — open the on-device database connection.
4. `src/db/schema/` — table definitions for every entity in Tech Arch §D (drizzle schema, or hand-written table/type defs under the raw-SQL fallback).
5. Migration runner keyed on `PRAGMA user_version` (Tech Arch §Q) — applies pending migrations sequentially on launch, before any UI reads the database.
6. First migration (`0001_initial_schema`) creates all V1 tables in one migration — there is no existing data to preserve, so V1's entire schema ships as a single initial migration rather than an incremental sequence.
7. Dev-only "reset local database" debug action (never present in production builds).

This is Phase 3 below. It ships with zero UI and is validated entirely by automated tests — no real device needed yet.

## 5. Migration strategy

- Unchanged from Tech Arch §Q: additive migrations, `PRAGMA user_version`, transactional application on launch, no destructive rewrites without an explicit backup-and-transform step.
- For V1 specifically: because there are no existing users or data, the *only* migration risk during initial build-out is a schema mistake caught before release — not a real user's data. Full migration-safety discipline (backup-and-transform, fixture-based apply-chain tests) becomes load-bearing starting with the **first post-launch schema change**, not before. This plan does not relax the architecture — it just notes which risk is theoretical today versus real later.
- Each subsequent phase that adds fields to an already-created table (if any turn out to be needed) adds its own numbered migration rather than editing migration `0001` in place, even pre-release — so the migration history itself is exercised and tested from the start.

## 6. Domain/entity implementation order

Pure logic only, no repositories, no UI, fixture-driven tests — this is Tech Arch §W.3's "highest-risk logic, prove first" step, broken into its own phase (Phase 4):

1. `src/domain/constants.ts` — `CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE = 8`, `UPCOMING_APPOINTMENT_WINDOW_DAYS = 14`, Insights minimum-data thresholds (Tech Arch §I).
2. Medication schedule generation (daily / specific-days / custom-interval).
3. Medication schedule versioning (`effectiveFrom`/`effectiveUntil` transition logic).
4. Historical-accuracy invariant (editing a schedule never rewrites past administrations) — as an explicit, named test, not an incidental side effect of another test.
5. Injection next-date calculation (derived from last logged administration + interval).
6. Appointment lookback resolution (previous rheumatology appointment vs. 90-day fallback).
7. Insights pure computation functions (`computePainHistory`, `computeFatigueHistory`, `computeStiffnessHistory`, `computeMedicationAdherence`, `computeInjectionHistory`, `computeLabHistory`) plus their copy templates.

Order follows dependency and risk: scheduling before anything that reads a schedule; historical-accuracy proven before any repository can be trusted to preserve it; Insights last since it consumes the others' outputs.

## 7. Repository/data layer order

One module per entity (Tech Arch §A, §S), each repository built and tested against a real (not mocked) test SQLite instance:

1. `medicationRepository` + `medicationScheduleRepository` (depends on domain scheduling logic, Phase 4)
2. `injectionRepository` + `injectionScheduleRepository`
3. `appointmentRepository`
4. `labResultRepository` + `labReminderRepository`
5. `checkInRepository`
6. `scheduledNotificationRepository`

Order matches the order features consume them (§10 below), so no repository is built speculatively ahead of the feature that needs it, and each repository's tests can reuse the domain fixtures from Phase 4.

## 8. Notification foundation

Built once, before any feature wires reminders to it (Phase 6), so every feature integrates against a stable interface:

1. `src/notifications/client.ts` — thin wrapper over `expo-notifications` (schedule, cancel, permission request/check).
2. `src/notifications/copy.ts` — the approved privacy-preserving default copy ("You have a health reminder"), with the opt-in detailed-content path stubbed but off by default.
3. `src/notifications/reconciliation.ts` — the reconciliation pass skeleton (Tech Arch §G): rolling-window top-up, timezone-change detection, permission re-check, `ScheduledNotification` bookkeeping reconciliation. Built once here against fixtures/mocks; wired to real launch/foreground/edit triggers incrementally as each feature (medication, injection, appointment, lab reminder) is implemented.

This phase requires the **first real-device checkpoint**: confirming a manually-triggered local notification actually fires, before any feature depends on the mechanism.

## 9. Localization foundation

Built before any screen exists, so no hardcoded string is ever written even temporarily (per the approved decision that localization applies "from the beginning"):

1. `src/localization/en.json`, `src/localization/tr.json` — seeded with a small set of shared/common keys (app-level actions, not yet feature copy).
2. `src/localization/format.ts` — `Intl.DateTimeFormat`/`Intl.NumberFormat` wrappers parameterized by active locale.
3. `expo-localization` wiring for system-locale detection + `UserPreferences.languageOverride` read (repository for `UserPreferences` is part of Phase 5/7's early repositories).

Each subsequent feature phase adds its own screen's keys to `en.json`/`tr.json` as part of that feature's own commit — localization is never a separate retrofitting pass at the end.

## 10. Feature implementation order

Follows the PRD's primary user journey and the UX spec's Today-first hierarchy, each phase a complete vertical slice (UI + domain + repository + localization + notifications where relevant):

1. **Onboarding** (empty-state Today at the end) — proves the full stack wires together before any data-bearing feature.
2. **Medications** — first data-bearing feature; delivers the PRD §5 first-value moment (Today reflects next dose).
3. **Injections** — next-injection-date + reschedule-on-log behavior.
4. **Appointments** — 14-day upcoming window surfacing on Today.
5. **Daily check-in** — one-per-day constraint, draft preservation, Today's check-in priority slot.
6. **Labs (CRP/ESR)** — chronological + trend list.
7. **Insights** — consumes all prior features' data; last by necessity.
8. **Appointment Preparation** — aggregates everything above; last by necessity (Tech Arch §J).
9. **Profile** — settings, privacy/data disclosure (including the device-backup disclosure required by Tech Arch §M), reminder settings, language override, medical disclaimer.

Design-system components (Button, Chip, SteppedScale, ListRow, Sheet) are built **just-in-time** with the first feature that needs each one (starting with Onboarding), not as a speculative upfront component library.

## 11. Testing order

Mirrors Tech Arch §R's approved priority order exactly, mapped to the phase that produces each piece of logic:

1. Schedule generation — Phase 4
2. Schedule versioning — Phase 4
3. Historical administration integrity — Phase 4
4. Injection next-date calculation — Phase 4
5. DST/timezone behavior (unit-testable parts) — Phase 6/17
6. Appointment lookback calculation — Phase 4
7. Insights aggregation thresholds — Phase 4/14
8. Notification reconciliation logic — Phase 6/17

Repository-layer tests (Phase 5/7) and feature-level integration tests (Phase 8 onward) are additive to this list, not a replacement for it — the eight items above must be green before the corresponding feature phase is considered startable.

## 12. Real-device QA checkpoints

Per Tech Arch §R, "real-device QA remains mandatory, not merely preferred," for notification delivery, timezone/DST, accessibility, and reduced motion. Checkpoints:

| Phase | Real-device check |
|---|---|
| Expo scaffold | App launches on a real iOS device (baseline sanity, not exhaustive) |
| Notification foundation | A manually-triggered local notification actually fires and displays the privacy-preserving default copy |
| Medications | Regular-schedule reminder fires at the correct wall-clock time; custom-interval rolling window replenishes correctly across app relaunches |
| Injections | Logging an injection cancels the old reminder and schedules a new one — confirmed via device notification center, not just a mock assertion |
| Daily check-in | VoiceOver + Dynamic Type pass on the pain/fatigue stepped-scale controls specifically (highest interaction-density screen) |
| Reconciliation hardening (Phase 17) | Timezone change, extended backgrounding, and notification-permission revoke/regrant all produce correct reconciliation |
| Release readiness (Phase 18) | Full VoiceOver, Dynamic Type, and Reduced Motion pass across every screen; EN/TR visual string-length check |

## 13. Branch/commit strategy per phase

Per `03_ENGINEERING/BRANCH_AND_ROLLBACK.md`: `main` stays releasable and protected; every phase is its own branch; no native/database/notification work begins directly on `main`.

| Phase | Branch | Notes |
|---|---|---|
| 0. Scaffold readiness verification | `chore/scaffold-readiness` | Docs-only decision record; no app code |
| 1. Expo scaffold | `chore/expo-scaffold` | Structure only |
| 2. Design tokens | `chore/design-tokens` | No components yet |
| 3. Database foundation | `feature/db-foundation` | Commit checkpoint before/after the initial migration lands (database work, per Safe Change Workflow's high-risk-change rule) |
| 4. Domain/scheduling logic | `feature/domain-scheduling` | Pure functions; safest phase to iterate on |
| 5/7. Repository layer | `feature/repository-layer` | One commit per entity repository, reviewed as a single small PR |
| 6. Notification foundation | `feature/notifications-foundation` | Commit checkpoint before requesting notification permission for the first time (native-adjacent) |
| 7. Localization foundation | `feature/localization-foundation` | |
| 8. Onboarding | `feature/onboarding-flow` | First vertical slice touching every layer |
| 9. Medications | `feature/medications` | Delivers PRD Activation moment |
| 10. Injections | `feature/injections` | |
| 11. Appointments | `feature/appointments` | |
| 12. Daily check-in | `feature/check-in` | |
| 13. Labs | `feature/labs` | |
| 14. Insights | `feature/insights` | |
| 15. Appointment Preparation | `feature/appointment-preparation` | |
| 16. Profile | `feature/profile` | |
| 17. Reconciliation hardening | `feature/notification-reconciliation-hardening` | Cross-cutting; touches all reminder-producing entities |
| 18. Release readiness | `chore/release-readiness` | Gate before any EAS build |

Each branch merges to `main` only after its own phase's tests pass and (where listed in §12) its device checkpoint is confirmed — never batching two phases into one merge.

## 14. Risks and rollback points

Carries forward Tech Arch §U plus phase-specific additions:

- **Drizzle/Expo compatibility (Phase 0)** — resolved by decision, not code; no rollback needed, only a choice between two already-approved paths (Tech Arch §C).
- **Database foundation (Phase 3)** — no real user data exists during initial build-out, so the rollback is simply deleting the branch; migration-safety discipline becomes load-bearing starting with the first post-launch schema change, not before.
- **Notification foundation (Phase 6)** — if `expo-notifications` proves unstable in the managed workflow, the fallback is delaying real scheduling behind the already-built policy layer (`src/domain/notifications`) without blocking feature UI — screens still record data; only the reminder side effect is deferred.
- **iOS pending-notification ceiling** — unverified until Phase 9 (multiple regular medication schedules exist); confirm against current Apple documentation before that phase, not assumed from Tech Arch's own caveat.
- **No field-level encryption** — accepted V1 risk (Tech Arch §M); no phase in this plan changes that; revisit triggers unchanged.
- **Turkish pluralization correctness** — real risk starting at Phase 8 (first real UI strings); spot-check against `i18n-js`'s actual rule support at that point rather than assuming.
- **Reconciliation correctness (Phase 17)** — hardest phase to fully unit-test; budget real-device time here specifically rather than treating it as a formality.
- **General rollback rule** (`BRANCH_AND_ROLLBACK.md`): prefer reverting the smallest change over layering a fix on an unknown state — since every phase above is intentionally small, a bad phase is always revertable on its own without touching prior phases.

---

## Complete implementation sequence (for approval)

| # | Phase | Branch | Device QA? | Depends on |
|---|---|---|---|---|
| 0 | Scaffold readiness verification (confirm Expo/RN/TS/drizzle versions against official docs; decide drizzle vs. raw-SQL fallback) | `chore/scaffold-readiness` | No | Tech Arch approval |
| 1 | Expo scaffold (structure only) | `chore/expo-scaffold` | Baseline launch check | 0 |
| 2 | Design tokens (colors/spacing/type from Visual Design Spec) | `chore/design-tokens` | No | 1 |
| 3 | Database foundation (schema, migration runner, initial migration) | `feature/db-foundation` | No | 0, 1 |
| 4 | Domain/scheduling logic (constants, schedule gen/versioning, injection dates, appointment lookback, Insights functions) | `feature/domain-scheduling` | No | none (pure) |
| 5 | Repository layer (one module per entity) | `feature/repository-layer` | No | 3, 4 |
| 6 | Notification foundation (client, copy, reconciliation skeleton) | `feature/notifications-foundation` | **Yes** — first real notification fires | 1 |
| 7 | Localization foundation (en/tr skeleton, Intl formatting) | `feature/localization-foundation` | No | 1 |
| 8 | Onboarding (empty-state Today) | `feature/onboarding-flow` | Accessibility spot check | 2, 5, 6, 7 |
| 9 | Medications (first data-bearing feature; Activation moment) | `feature/medications` | **Yes** — reminder timing + rolling window | 5, 6, 7, 8 |
| 10 | Injections | `feature/injections` | **Yes** — cancel/reschedule on log | 9 |
| 11 | Appointments | `feature/appointments` | No | 9 |
| 12 | Daily check-in | `feature/check-in` | **Yes** — VoiceOver/Dynamic Type on steppers | 8 |
| 13 | Labs (CRP/ESR) | `feature/labs` | No | 9 |
| 14 | Insights | `feature/insights` | No | 9–13 |
| 15 | Appointment Preparation | `feature/appointment-preparation` | No | 9–14 |
| 16 | Profile (settings, privacy/data disclosure, disclaimer) | `feature/profile` | No | 6, 7 |
| 17 | Notification reconciliation hardening (all triggers, all entities) | `feature/notification-reconciliation-hardening` | **Yes** — timezone/backgrounding/permission | 9, 10, 11 |
| 18 | Release readiness (full accessibility/localization/lint/test pass) | `chore/release-readiness` | **Yes** — full device pass | all above |

Nothing in this plan authorizes starting Phase 0. It requires its own explicit approval, per this document's own status line.
