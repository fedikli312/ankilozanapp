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

## Rejected decisions
| Date | Decision | Why rejected | Revisit condition |
|---|---|---|---|
| 2026-08-25 | Designing V1 around a specific monetization/paywall model | Business model explicitly undecided in product brief | When monetization strategy is defined |

## Known risks
| Risk | Severity | Mitigation | Status |
|---|---|---|---|
| App handles special-category health data (symptoms, medication, injections, labs, appointments, notes) | High | Data minimization, no unnecessary third-party tracking/ads, explicit consent and deletion flow to be designed before backend implementation | Open — needs explicit approval (see PROJECT_CONTEXT.md unresolved decisions) |
| Product copy could unintentionally imply diagnosis, prediction, or treatment efficacy/failure | High | Product principles mandate descriptive, non-diagnostic language; UX copy review required before shipping insights/BASDAI features | Open — copy standards to be written before Insights/BASDAI implementation |
| BASDAI is a standardized clinical questionnaire | Medium | Confirm licensing/attribution/scoring accuracy before implementation | Open |
| App Store review risk for health-adjacent apps | Medium | Follow 05_RELEASE/APP_STORE_REVIEW_CHECKLIST.md; add explicit non-diagnostic disclaimer | Open |

## Known bugs
| Bug | Reproduction | Workaround | Status |
|---|---|---|---|

None — no application code exists yet.

## Protected behavior
None yet — greenfield project, no existing users, entitlements, or shipped flows.

Once defined, protect: medication/injection reminder accuracy, laboratory data integrity, appointment reminder delivery, and any future account/data-deletion flow.

## Session handoff
- Completed: Product OS initialization files created (AGENTS.md, CLAUDE.md, CODEX.md, PROJECT_CONTEXT.md, PROJECT_MEMORY.md, README.md). NEW_PROJECT checklist run against the resulting context.
- Files changed: See above; no application code.
- Tests run: None (no code to test).
- Open questions: See "Unresolved decisions" in PROJECT_CONTEXT.md and "Known risks" above.
- Next safe step: Await explicit approval of the initialized Product OS context before any Expo scaffolding.

## Rules
- Record durable decisions, not chat history.
- Never store secrets or personal user data.
- Update after every approved architectural, monetization or SDK decision.
