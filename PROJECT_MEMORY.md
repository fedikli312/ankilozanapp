# Project Memory

## Stable product facts
- Product: Ankilozanapp (working title)
- Target user: Adults diagnosed with ankylosing spondylitis (AS) or axial spondyloarthritis (axSpA)
- Core job: Remember and organize what happens between rheumatology appointments — medications, injections, symptoms, labs, appointments, and reminders in one place
- Business model: Undecided (see PROJECT_CONTEXT.md)

## Current architecture
- Expo SDK: Not yet installed
- React Native: Not yet installed
- Navigation: Not yet decided (tentative Expo Router)
- Backend: Supabase (planned, not yet configured)
- Subscriptions: None in V1; architecture to remain RevenueCat-compatible
- Analytics: Not yet selected

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

## Known bugs
| Bug | Reproduction | Workaround | Status |
|---|---|---|---|

None — no application code exists yet.

## Protected behavior
None yet — greenfield project, no existing users, entitlements, or shipped flows.

Once defined, protect: medication/injection reminder accuracy, laboratory data integrity, appointment reminder delivery, and any future account/data-deletion flow.

## Session handoff
- Completed: Product OS initialization, Product Definition (`docs/PRD.md`), and UX Design (`docs/UX_SPECIFICATION.md`) phases all approved and committed to origin/main. All UX-architecture-level open decisions resolved (local-first/no onboarding auth, body-area chip list, fatigue scale, free-text medication entry, reminder defaults, pending-health-tasks derivation, Today priority order, onboarding scope, 4-tab navigation, Insights empty state). Visual Design phase begun next.
- Files changed: `docs/UX_SPECIFICATION.md`, `docs/PRD.md`, `PROJECT_CONTEXT.md`, `PROJECT_MEMORY.md`.
- Tests run: None (no application code exists).
- Open questions: None remaining at the UX-architecture level. Remaining deferred items: missed-state visual treatment (Visual Design phase) and local-first storage engineering architecture (Engineering phase).
- Next safe step: Produce the Visual Design Specification under Design Mode; stop for approval before Expo scaffolding or engineering.

## Rules
- Record durable decisions, not chat history.
- Never store secrets or personal user data.
- Update after every approved architectural, monetization or SDK decision.
