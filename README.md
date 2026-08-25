# Ankilozanapp

An iOS-first mobile companion for people living with ankylosing spondylitis (AS) / axial spondyloarthritis (axSpA). The app remembers what happens between rheumatology appointments — medications, injections, symptoms, lab history, and appointments — in one calm, organized place.

This project is in the **initialization phase**: no application code, dependencies, or Expo scaffolding exist yet. See `PROJECT_CONTEXT.md` for full product scope and `PROJECT_MEMORY.md` for the decision log.

## Product OS

This project uses [`furkan-ai-product-os`](../furkan-ai-product-os) (sibling directory) as its **Product OS** — the shared product, design, engineering, growth, QA, and release framework for this project.

**The Product OS repository is read-only from this project.** It must never be copied wholesale into this repository, and it must never be modified from within this project. It is referenced in place, not duplicated.

### How AI agents should use it

- Read `AGENTS.md`, `CLAUDE.md`, and `CODEX.md` in this repository first — they define the shared constitution and per-agent role for this project.
- Read `PROJECT_CONTEXT.md` for current product scope, technology direction, and constraints, and `PROJECT_MEMORY.md` for durable decisions and open risks.
- When a task requires framework guidance (design, engineering, growth, release, product-craft, etc.), read only the specific file(s) in `../furkan-ai-product-os` relevant to that task — following the routing approach described in `../furkan-ai-product-os/15_AI_ROUTER/ROUTER.md` — rather than the whole Product OS repository.
- Do not edit, move, or delete anything under `../furkan-ai-product-os`.
- Do not copy entire Product OS directories into this repository. Instantiate only the specific templates a task calls for (e.g. a feature spec from `01_PRODUCT/FEATURE_SPEC_TEMPLATE.md`), as a new file in this repository.

## Status

Greenfield. No Expo scaffolding, no dependencies, no UI, and no application features have been implemented. The exercise/physiotherapy system is deliberately deferred and out of scope for the current phase.
