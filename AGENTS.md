# Shared Agent Constitution

These rules apply to every AI agent working in a project that adopts this repository.

## Before any change

1. Read the project context and relevant specifications.
2. Inspect the current code and Git status.
3. State the goal, files likely affected, risks, and validation plan.
4. Do not edit until the task is understood.

## Production safety

- Never make risky SDK, authentication, payment, database, build, or native configuration changes directly on the production branch.
- Create a focused feature branch.
- Preserve the last known working build and a clear rollback point.
- Never delete native folders, regenerate projects, upgrade dependencies, or run destructive commands without explicit approval.
- Never expose secrets, tokens, service keys, certificates, or customer data.

## Scope discipline

- Perform only the requested task.
- Do not redesign UX, change business rules, replace dependencies, or refactor unrelated code without approval.
- Prefer small, reviewable changes over broad rewrites.
- Do not claim success without evidence.

## Definition of done

A task is complete only when:

- Acceptance criteria are met.
- Type checks, linting, and relevant tests pass.
- Loading, empty, error, offline, and permission states are considered where relevant.
- Analytics and accessibility implications are considered.
- Changed files and verification steps are summarized.

## Communication

- Separate facts from assumptions.
- Report uncertainty and missing evidence.
- Explain trade-offs briefly.
- When blocked, provide the exact error and the safest next step.
