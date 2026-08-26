# Project Memory

## Stable product facts
- Product: Ankilozanapp (working title)
- Target user: Adults diagnosed with ankylosing spondylitis (AS) or axial spondyloarthritis (axSpA)
- Core job: Remember and organize what happens between rheumatology appointments — medications, injections, symptoms, labs, appointments, and reminders in one place
- Business model: Undecided (see PROJECT_CONTEXT.md)

## Current architecture
- Expo SDK: Not yet installed (Expo Router + TypeScript strict + EAS approved direction; exact versions confirmed at scaffold time — see `docs/TECHNICAL_ARCHITECTURE.md`)
- React Native: Not yet installed
- Navigation: Expo Router approved
- Local database: expo-sqlite approved as V1 source of truth (local-first); drizzle-orm used if compatibility confirmed at scaffold time, else raw-expo-sqlite fallback — not yet installed
- Data access: strict layering approved — UI → feature/application services → domain logic → repositories → SQLite; UI/screens never query SQLite directly
- Backend: Supabase explicitly deferred — no auth, sync engine, cloud schema, remote repositories, or account UI in V1
- Localization: expo-localization + i18n-js + native Intl, locales en/tr, approved — not yet installed
- Subscriptions: None in V1; architecture to remain RevenueCat-compatible
- Analytics: None in V1 — no analytics or crash-reporting SDK

## Approved decisions
| Date | Decision | Reason | Owner |
|---|---|---|---|
| 2026-08-25 | Adopt furkan-ai-product-os as the governing Product OS for this project | Reuse validated product/design/engineering/release process instead of re-deriving it | Furkan |
| 2026-08-25 | V1 scope defined: Today, daily symptom tracking, medication management, injection management, medical appointments, laboratory results (CRP/ESR), disease activity tracking (BASDAI), insights, appointment preparation, reminders | Product brief approved for initialization | Furkan |
| 2026-08-25 | Exercise/physiotherapy functionality deliberately deferred out of current phase | Explicit instruction to keep V1 scope minimal | Furkan |
| 2026-08-25 | No paywall or premium gating designed into V1; essential tracking features must remain free | Business model undecided; avoid designing around monetization prematurely | Furkan |
| 2026-08-25 | Assistant layer (if built) may only organize, retrieve, summarize, and contextualize user-entered data; must not generate medical conclusions or treatment recommendations | Product-safety requirement — this is a self-management companion, not a diagnostic device | Furkan |
| 2026-08-25 | Initialization files (AGENTS.md, CLAUDE.md, CODEX.md, PROJECT_CONTEXT.md, PROJECT_MEMORY.md, README.md) committed and pushed to origin/main as the first project commit | Approved initialization phase | Furkan |
| 2026-08-25 | No analytics SDK selected in V1; symptom, medication, laboratory, appointment, and health-note data must never be sent to analytics | Data minimization for sensitive health data | Furkan |
| 2026-08-25 | Local, on-device notifications preferred for medication/injection/appointment reminders unless a concrete requirement later proves server scheduling necessary | Minimize backend exposure of sensitive scheduling data | Furkan |
| 2026-08-25 | BASDAI remains provisional until questionnaire usage rights, attribution/licensing, and scoring requirements are verified | Clinical-instrument compliance risk | Furkan |
| 2026-08-25 | ASDAS explicitly excluded from V1 | Scope discipline | Furkan |
| 2026-08-25 | No AI-generated medical interpretation anywhere in V1; future assistant restricted to summarizing user-entered data only | Product-safety boundary | Furkan |
| 2026-08-25 | Privacy architecture must assume: minimal data collection, eventual user export/delete, account deletion cascades to health data, and no health values in analytics/crash logs/notification payloads unnecessarily | Sensitive health data handling | Furkan |
| 2026-08-25 | `docs/PRD.md` approved as the V1 Product Definition (scope, journey, IA, data models, metrics) | Product Discovery/Definition phase complete | Furkan |
| 2026-08-25 | Appointment preparation lookback: summarize since previous rheumatology appointment if one exists, otherwise previous 90 days; date range always shown on screen | Resolves open decision from PRD §14 | Furkan |
| 2026-08-25 | CRP and ESR are first-class predefined lab markers for V1; architecture stays extensible; no unrestricted medical interpretation of lab values | Resolves open decision from PRD §14 | Furkan |
| 2026-08-25 | Medication/injection historical accuracy rule: logged doses/injections are immutable; schedule edits affect only future expected events | Resolves open decision from PRD §14 | Furkan |
| 2026-08-25 | Default notification copy is privacy-preserving and generic (e.g. "You have a health reminder"), never exposes medication/injection names on the lock screen by default; detailed content may become an explicit opt-in setting later; symptom/lab/note values never in payloads | Resolves open decision from PRD §14 | Furkan |
| 2026-08-25 | Export direction approved: doctor-sharing as human-readable PDF, personal data export as CSV/JSON; not implemented in V1 | Resolves open decision from PRD §14 | Furkan |
| 2026-08-25 | BASDAI stays out of implementation until usage rights, attribution/licensing, exact wording, and scoring accuracy are verified; must not block the rest of V1 | Resolves open decision from PRD §14 | Furkan |
| 2026-08-25 | V1 target languages: English and Turkish; architecture and UX must be localization-ready from the start; layouts must not depend on fixed English string lengths | Resolves open decision from PRD §14 | Furkan |
| 2026-08-25 | Approved primary metric (Activation) and guardrail metrics (7-day check-in engagement, check-in abandonment rate, notification denial/opt-out rate) as product metrics only — no analytics SDK installed | Resolves open decision from PRD §14 | Furkan |
| 2026-08-25 | Product Definition documents committed and pushed to origin/main; Product OS Design Mode phase begun | Approved by Furkan | Furkan |
| 2026-08-25 | `docs/UX_SPECIFICATION.md` approved as the V1 UX architecture (final IA, screen inventory, onboarding, Today hierarchy, all feature flows, states, notification UX, accessibility, trust/safety copy strategy) | UX Design phase complete | Furkan |
| 2026-08-25 | V1 is local-first: onboarding and all core V1 features (medication, injection, appointment, check-in, labs, reminders, history) work without an account; account creation deferred to Profile for future cloud backup/sync; core tracking must not depend on an active internet connection | Resolves UX open decision — auth/backend timing | Furkan |
| 2026-08-25 | Body area uses a selectable chip list (Neck, Upper back, Lower back, Hips, Shoulders, Chest/ribs, Other), not an anatomical diagram; stays optional behind "+ Add more"; never used for diagnosis/interpretation | Resolves UX open decision — body area | Furkan |
| 2026-08-25 | Fatigue uses a 0–10 stepped, accessible-adjustable scale consistent with pain | Resolves UX open decision — fatigue scale | Furkan |
| 2026-08-25 | Medication/injection name entry is free-text only in V1, no external medication database dependency, no medication recommendations or suggested dosing; autocomplete may be added later | Resolves UX open decision — medication entry | Furkan |
| 2026-08-25 | Reminder defaults approved (all user-editable): medication at scheduled time; injection one day before + day-of; appointment one day before. No aggressive/repeated reminders; missed-reminder copy is never guilt-inducing | Resolves UX open decision — reminder defaults | Furkan |
| 2026-08-25 | Today's "pending health tasks" strictly derives from existing objects only (medication due, injection due, upcoming appointment, user-configured lab reminder) — no generic to-do system | Resolves UX open decision — pending health tasks | Furkan |
| 2026-08-25 | Today priority order approved: (1) daily check-in if incomplete, (2) something requiring action today, (3) next injection, (4) upcoming appointment, (5) relevant future reminder; empty sections never shown; check-in collapses to a quiet state once completed | Resolves UX open decision — Today priority | Furkan |
| 2026-08-25 | Onboarding finalized: Welcome → Privacy/data trust (states data is stored on-device) → "What would you like help remembering?" → optional first treatment setup → optional appointment setup → Today; every step after trust/purpose framing is skippable; never asks diagnosis history, disease duration, BASDAI, demographics, or account creation; notification permission requested only after the user's first reminder is explicitly enabled | Resolves UX open decision — onboarding scope | Furkan |
| 2026-08-25 | 4-tab navigation approved as final (Today, Track, Appointments, Insights); Profile/Settings accessible via a persistent top-right control, not a fifth tab | Resolves UX open decision — Profile access | Furkan |
| 2026-08-25 | Insights never renders a chart from insufficient history; uses calm progressive copy instead (e.g. "Keep checking in to see how your symptoms change over time.") | Resolves UX open decision — Insights empty state | Furkan |
| 2026-08-25 | `docs/UX_SPECIFICATION.md` committed and pushed to origin/main; Product OS Visual Design phase begun | Approved by Furkan | Furkan |
| 2026-08-25 | `docs/VISUAL_DESIGN_SPECIFICATION.md` approved as the V1 visual system (warm-neutral palette with single muted teal accent, no color-coded symptom severity, SF Symbols/system typography, restrained component language, "continuity thread" motif, no logo/app icon/product name finalized) | Visual Design phase complete | Furkan |
| 2026-08-25 | Visual Design Specification committed and pushed to origin/main; Product OS Technical Architecture (Engineering Mode) phase begun | Approved by Furkan | Furkan |
| 2026-08-25 | `docs/TECHNICAL_ARCHITECTURE.md` approved as the V1 technical architecture | Technical Architecture phase complete | Furkan |
| 2026-08-25 | Local-first architecture confirmed: expo-sqlite is the V1 source of truth; UI/screens never query SQLite directly — a strict layered boundary (UI → feature/application services → domain logic → repositories → SQLite) is required, with repositories as the sole data-access layer, so a future sync layer can be added without rewriting feature UI | Resolves Technical Architecture decision — repository boundary | Furkan |
| 2026-08-25 | drizzle-orm (expo-sqlite driver) used only if current official Expo/Drizzle compatibility is confirmed at scaffold time; otherwise fall back to a small typed repository layer over raw expo-sqlite. Drizzle is never forced if it introduces instability | Resolves Technical Architecture decision — database access | Furkan |
| 2026-08-25 | Local application database participates in standard iOS device/iCloud backups by default; no custom backup service built in V1; this must be documented in the product's privacy/data disclosure copy | Resolves Technical Architecture decision — device backup | Furkan |
| 2026-08-25 | Localization uses expo-localization + i18n-js + native Intl APIs only, no hand-written localization framework; initial locales en/tr; every user-facing string must go through localization from the beginning | Resolves Technical Architecture decision — localization | Furkan |
| 2026-08-25 | No custom field-level database encryption in V1 — accepted risk. Revisit if: cloud sync is added, regulatory requirements change, highly sensitive free-text data expands, or an external security review requires it | Resolves Technical Architecture decision — field-level encryption | Furkan |
| 2026-08-25 | Irregular (custom-interval) medication reminders use a rolling window of exactly 8 future occurrences, replenished on launch/foreground reconciliation, stored as a named domain constant (`CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE`), never a magic number | Resolves Technical Architecture decision — irregular reminder window | Furkan |
| 2026-08-25 | "Upcoming appointment" on Today uses a 14-day window, stored as a named domain constant (`UPCOMING_APPOINTMENT_WINDOW_DAYS`), not hardcoded per screen | Resolves Technical Architecture decision — appointment window | Furkan |
| 2026-08-25 | Reminder architecture confirmed: regular medication schedules use recurring local calendar notifications; injections use one-off notifications recalculated after each logged administration; appointments and lab reminders use one-off notifications; irregular custom medication schedules use the rolling 8-occurrence window. Reconciliation runs on launch, on foreground, after reminder-configuration changes, after detectable timezone changes, and after medication/injection schedule edits | Resolves Technical Architecture decision — reminder architecture | Furkan |
| 2026-08-25 | Versioned schedule architecture approved: MedicationSchedule/InjectionSchedule changes create new schedule versions; administration records are never rewritten and preserve their original scheduledFor and taken/missed state when a future schedule changes | Resolves Technical Architecture decision — historical correctness | Furkan |
| 2026-08-25 | Automated-testing priority order approved: schedule generation, schedule versioning, historical administration integrity, injection next-date calculation, DST/timezone behavior (where unit-testable), appointment lookback calculation, Insights aggregation thresholds, notification reconciliation logic. Real-device QA remains mandatory for notification delivery, timezone/DST, accessibility, and reduced motion | Resolves Technical Architecture decision — testing priorities | Furkan |
| 2026-08-25 | Project engineering standard: no analytics SDK, no crash-reporting SDK, no backend in V1, no health data transmission, generic notification content by default, and sensitive health values must never be written to console logs in production builds | Resolves Technical Architecture decision — privacy | Furkan |
| 2026-08-25 | Supabase remains explicitly future scope; V1 scaffolding/implementation must not create authentication, a sync engine, a cloud schema, remote repositories, or account UI — the repository/data architecture only avoids blocking that future direction | Resolves Technical Architecture decision — future sync | Furkan |
| 2026-08-25 | `docs/TECHNICAL_ARCHITECTURE.md` committed and pushed to origin/main | Approved by Furkan | Furkan |
| 2026-08-26 | `docs/IMPLEMENTATION_PLAN.md` approved as the V1 engineering execution plan (folder structure, scaffold strategy, dependency plan, DB/migration sequence, domain/repository/notification/localization order, feature order, testing order, device QA checkpoints, branch/commit strategy, risks) | Engineering plan phase complete; authorizes Phases 0–7 (foundation) only — Phase 8+ (product features) requires separate approval | Furkan |

| 2026-08-26 | Phase 0 (scaffold readiness) verified against official sources: Expo SDK 57.0.16, React Native 0.86, React 19.2.3, Node.js minimum 22.13.x (local Node 22.23.1 confirmed compatible), expo-router 57.0.16, expo-sqlite 57.0.1, expo-notifications 57.0.14, expo-localization 57.0.1, i18n-js 4.5.3, drizzle-orm 0.45.2 (stable, non-RC), drizzle-kit 0.31.10, eas-cli 22.4.0 | Verified via npm registry (`npm view <pkg> version`/`dist-tags`) and docs.expo.dev/orm.drizzle.team at scaffold time, per Tech Arch §C/§W.1 requirement to not rely on remembered versions | Furkan |
| 2026-08-26 | Drizzle decision: use `drizzle-orm` (stable `0.45.2`) with the `drizzle-orm/expo-sqlite` driver — confirmed compatible. The stable (non-RC) npm release already exports `expo-sqlite`, `expo-sqlite/query`, `expo-sqlite/driver`, `expo-sqlite/session`, `expo-sqlite/migrator` submodules, and `expo-sqlite`'s `next` dist-tag equals its `latest` (`57.0.1`), matching the current Expo SDK. Drizzle's own docs page shows an `@rc`-tagged quick-start (likely for a newer preview feature such as `useLiveQuery`/dev-tools), but core driver support is present in the stable release, so the RC packages are not needed. Raw-`expo-sqlite` fallback (Tech Arch §C) remains available if instability appears during Phase 3 implementation | Resolves Implementation Plan Phase 0 decision | Furkan |
| 2026-08-26 | EAS project linkage (`eas init`/`eas login`) deferred — requires the user's Expo account credentials, which this session does not have and should not attempt to acquire. `app.json`/`eas.json` are structured to be EAS-compatible; actual project linkage is a manual step for Furkan before the first EAS build | Resolves Implementation Plan Phase 1 scope boundary | Furkan |
| 2026-08-26 | Implementation Plan Phases 0–7 (foundation) executed and merged to main: Expo Router scaffold, design-system tokens, full 16-table SQLite schema + initial migration, pure domain scheduling/Insights logic, typed repository layer, local-notification infrastructure, and the en/tr localization foundation. Phase 8+ (product feature screens) explicitly not started | Approved scope for this execution session; matches Implementation Plan §"Complete implementation sequence" | Furkan |
| 2026-08-26 | Deviation from Tech Arch §Q: migrations are tracked via drizzle-kit's own bookkeeping table (`__drizzle_migrations`), not `PRAGMA user_version` as originally named. Functionally equivalent (ordered, idempotent, verified by a re-run-is-a-no-op test) but not literally the named mechanism — flagged per "do not silently change Product OS decisions," not silently substituted | Discovered during Phase 3 implementation; the approved drizzle-kit toolchain ships its own migrator rather than a PRAGMA-user_version-based one | Furkan (needs explicit acknowledgment) |
| 2026-08-26 | Testing substitutes `better-sqlite3` (via `drizzle-orm/better-sqlite3`) for `expo-sqlite` in all migration/repository tests — `expo-sqlite` is native-only and cannot run in Node/Jest. The identical generated SQL migrations and drizzle schema run through both drivers; `better-sqlite3` is a devDependency, never imported by application code | Real (non-mocked) SQLite behavior was required by Implementation Plan §7/§11 but is otherwise unreachable without a physical device or simulator in this environment | Furkan |
| 2026-08-26 | Notification-reconciliation wiring into actual app-lifecycle triggers (launch, foreground, config change, timezone change, schedule edit) is deferred to Implementation Plan Phase 17, not built in Phase 6. Phase 6 delivered the reconciliation logic itself (diffing, rolling-window top-up, timezone-change detection, permission gate) as pure, tested functions with no lifecycle listener registered yet, since no real screens exist to trigger from | Matches Implementation Plan's own phase boundary; avoids wiring notification side effects to an app that has no feature UI yet | Furkan |
| 2026-08-26 | Real iOS/Android device or simulator verification was not possible for Phases 1–7 in this session — no macOS/Xcode or Android SDK available on this Windows machine. Verification used `tsc --noEmit`, `expo lint`, `expo-doctor`, `expo install --check`, and 63 Jest unit/integration tests instead; the Expo web target was usable only through Phase 2 and stopped being viable once `expo-sqlite` was wired in (Phase 3), since its web implementation needs additional Metro wasm/COOP-COEP configuration this iOS-first app has no approved reason to carry | Environment constraint, not a scope decision | Furkan (real-device QA still required before Phase 8 ships anything user-facing) |

## Rejected decisions
| Date | Decision | Why rejected | Revisit condition |
|---|---|---|---|
| 2026-08-25 | Designing V1 around a specific monetization/paywall model | Business model explicitly undecided in product brief | When monetization strategy is defined |

## Known risks
| Risk | Severity | Mitigation | Status |
|---|---|---|---|
| App handles special-category health data (symptoms, medication, injections, labs, appointments, notes) | High | Data minimization, no unnecessary third-party tracking/ads, no health values in analytics/crash logs/notification payloads; explicit consent and account-deletion-cascades-to-health-data flow still to be designed | Open — direction approved, detailed consent/deletion UX not yet designed |
| Product copy could unintentionally imply diagnosis, prediction, or treatment efficacy/failure | High | Product principles mandate descriptive, non-diagnostic language; UX copy review required before shipping insights/BASDAI features | Open — copy standards to be written in UX phase |
| BASDAI is a standardized clinical questionnaire | Medium | Held out of implementation until licensing/attribution/scoring accuracy is verified; does not block V1 | Open — deferred by design |
| App Store review risk for health-adjacent apps | Medium | Follow 05_RELEASE/APP_STORE_REVIEW_CHECKLIST.md; add explicit non-diagnostic disclaimer | Open |
| No real iOS/Android device or simulator has run this codebase yet | Medium | tsc/lint/expo-doctor/unit+integration tests all pass; a real-device pass is a mandatory checkpoint before/with Phase 8 or 9 per the Implementation Plan | Open — environment constraint, not yet scheduled |
| Migrations tracked via drizzle's own bookkeeping table rather than the `PRAGMA user_version` mechanism named in Tech Arch §Q | Low | Functionally equivalent and test-covered (idempotent re-application); documented as a deviation requiring acknowledgment, not silently changed | Open — needs Furkan's explicit sign-off |
| `drizzle-orm`'s expo-sqlite driver has only been exercised against `better-sqlite3` in tests, never against the real `expo-sqlite` native module | Medium | Both are drizzle's synchronous SQLite driver family sharing the same schema/query-builder surface; still, first real-device run should specifically verify a write + migration succeeds against actual `expo-sqlite` | Open — first real-device checkpoint |
| EAS project not linked (`eas init`/`eas login` not run) | Low | Requires Furkan's Expo account; `eas.json` is ready, linkage is a manual step before the first EAS build | Open |

## Known bugs
| Bug | Reproduction | Workaround | Status |
|---|---|---|---|

None found — 63/63 automated tests passing, tsc/lint/expo-doctor clean as of the Phase 0–7 foundation build (2026-08-26).

## Protected behavior
Established by the Phase 0–7 foundation build (2026-08-26), enforced by automated tests — must not regress:
- Medication/injection administration immutability: `scheduledFor`/history are never rewritten when a schedule changes (`src/repositories/__tests__/medication.test.ts`, `src/domain/scheduling/__tests__/scheduleVersioning.test.ts`).
- Schedule versioning: editing a schedule supersedes the old version and inserts a new one, never mutates in place.
- Injection next-date calculation anchors to the actual logged date, not the original schedule, so early/late logging doesn't silently drift.
- Notification default copy stays generic/privacy-preserving unless both `detailOptIn` and a detailed body are explicitly supplied.
- One check-in per calendar day, editable same-day via upsert.
- 14-day upcoming-appointment window and 8-occurrence custom-interval reminder window stay as named domain constants, not per-screen literals.

Still to be established once Phase 8+ builds real screens: appointment reminder delivery, any future account/data-deletion flow.

## Session handoff
- Completed (2026-08-26): Implementation Plan approved; Phases 0–7 (foundation) executed, verified, and pushed to origin/main across 7 commits (`54311b8`…`36dd8d0`, latest `36dd8d0`). Full V1 SQLite schema (16 tables) with initial migration, pure domain scheduling/Insights logic (32 tests), typed repository layer (9 integration tests against real SQLite via better-sqlite3), local-notification infrastructure (client/copy/reconciliation foundations), and the en/tr localization foundation retrofitted onto every string that existed before it landed. 63/63 tests passing, tsc/lint/expo-doctor/`expo install --check` all clean.
- Files changed: see commits `264ca7c` (Phase 1 scaffold) through `36dd8d0` (Phase 7 localization) on `main`; `docs/IMPLEMENTATION_PLAN.md` marked Approved.
- Tests run: 63 Jest tests (domain: 32, db/migrations: 3, repositories: 9, notifications: 12, localization: 10 — some overlap across categories), all passing. No real-device run performed (no macOS/Xcode/Android SDK in this environment).
- Open questions / deviations needing acknowledgment: (1) drizzle's own migration-bookkeeping table used instead of the literal `PRAGMA user_version` mechanism named in Tech Arch §Q — functionally equivalent, flagged not silently substituted; (2) real device verification against actual `expo-sqlite` (as opposed to the `better-sqlite3` test substitute) has not happened yet.
- Explicitly not started: Phase 8 onward — onboarding, Today, medications/injections/appointments/check-in/labs/Insights/Profile UI, and wiring notification reconciliation into real app-lifecycle triggers. No product screens exist.
- Next safe step: a first real-device build (EAS development client or a Mac with Xcode) to verify the foundation actually runs against real `expo-sqlite`/`expo-notifications`, before or alongside Phase 8 (onboarding) — still requires explicit approval to start Phase 8.

## Rules
- Record durable decisions, not chat history.
- Never store secrets or personal user data.
- Update after every approved architectural, monetization or SDK decision.
