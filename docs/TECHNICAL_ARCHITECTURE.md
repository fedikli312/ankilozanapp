# Technical Architecture Specification — V1

Status: **Approved.** This is the Engineering Mode / technical architecture phase. It does not by itself authorize Expo scaffolding, dependency installation, or application code — a separate explicit approval is required before scaffolding begins.

Built from `docs/PRD.md`, `docs/UX_SPECIFICATION.md`, `docs/VISUAL_DESIGN_SPECIFICATION.md`, `PROJECT_CONTEXT.md`, `PROJECT_MEMORY.md` (source of truth for product decisions) and `03_ENGINEERING/*`, `06_AI_WORKFLOWS/SAFE_CHANGE_WORKFLOW.md`, `09_CHECKLISTS/NATIVE_SDK_INTEGRATION.md`, `12_REFERENCE_LIBRARY/*`, `10_TOOLS/TOOL_REGISTRY.md` in `../furkan-ai-product-os`.

Version numbers referenced below (Expo SDK, RN, TypeScript) are **directional, not pinned** — per `12_REFERENCE_LIBRARY/OFFICIAL_SOURCES_POLICY.md`, exact current versions must be confirmed against `docs.expo.dev` and the Expo/EAS CLI output at scaffolding time, not taken from this document from memory.

---

## A. Architecture overview

**Local database → repositories → domain logic → feature/application services → UI**, with cloud sync explicitly deferred. Four layers, strict one-way dependency, each layer talking only to the one directly beneath it — this is what lets a future sync layer slot in without rewriting feature UI (§T).

```
┌─────────────────────────────────────────────────────────┐
│  UI (app/ — Expo Router screens, src/features/*/screens)  │
│  Renders design-system components. Never imports          │
│  src/repositories or src/db directly.                      │
└───────────────▲─────────────────────────┬────────────────┘
                 │ typed data / actions    │ user actions
┌───────────────┴─────────────────────────▼────────────────┐
│  Feature / application services (src/features/*/hooks)     │
│  useTodayData(), useMedications(), useCheckIn(date), etc.  │
│  Orchestrate domain calls, expose loading/error/data state.│
└───────────────▲─────────────────────────┬────────────────┘
                 │                         │
┌───────────────┴─────────────────────────▼────────────────┐
│  Domain logic (src/domain/*)                               │
│  - Scheduling (historical-accuracy rules, next-date calc)  │
│  - Insights engine (pure, deterministic functions)          │
│  - Appointment Preparation aggregation                      │
│  - Notification scheduling policy (what/when to schedule)   │
│  Calls repositories only — never src/db directly.           │
└───────────────▲─────────────────────────┬────────────────┘
                 │ domain-shaped calls     │
┌───────────────┴─────────────────────────▼────────────────┐
│  Repositories (src/repositories/*)                          │
│  One module per entity (MedicationRepository, etc.).        │
│  The ONLY layer that imports src/db. Hides whether the       │
│  underlying access is drizzle or raw expo-sqlite (§C).       │
└───────────────▲─────────────────────────┬────────────────┘
                 │ typed queries           │ writes (transactional)
┌───────────────┴─────────────────────────▼────────────────┐
│  Local database (src/db/* — SQLite, on-device)              │
│  Source of truth for all V1 domain data.                    │
└─────────────────────────────────────────────────────────┘
                 │
                 ▼ (OS-level side channel, not app data flow)
┌─────────────────────────────────────────────────────────┐
│  expo-notifications (local, on-device scheduling)           │
└─────────────────────────────────────────────────────────┘

Future, not built now:
┌─────────────────────────────────────────────────────────┐
│  Sync engine (not designed) ↕ Supabase (optional account,  │
│  backup, multi-device) — see §T. Would sit beside/behind     │
│  the repository layer without the UI or domain layer          │
│  changing at all.                                             │
└─────────────────────────────────────────────────────────┘
```

The device-local SQLite database is the single source of truth for V1. No layer in this diagram requires network connectivity, an account, or Supabase to function. UI components and screens never query SQLite directly — the repository layer is the sole, explicit data-access boundary.

## B. Dependency decisions

| Dependency | Purpose | Why this one | Alternatives considered | Risk |
|---|---|---|---|---|
| Expo (managed workflow) | App framework, build tooling | Official, first-party, matches Product OS default stack | Bare React Native — rejected: no justified need for custom native code in V1 | Low |
| Expo Router | Navigation | File-based routing, official, integrates with tab bar + stacks + modals needed for the approved IA | React Navigation directly — viable but Expo Router is the current Expo-recommended default and reduces boilerplate | Low |
| TypeScript (strict) | Type safety | Required by Product OS engineering standards | — | None |
| expo-sqlite | Local relational database | See §C | WatermelonDB, op-sqlite, Realm — see §C | Low (first-party) |
| drizzle-orm (`drizzle-orm/expo-sqlite`) — **conditional** | Typed schema, queries, migration tooling over expo-sqlite | Lightweight, TypeScript-first, has an official expo-sqlite driver — **used only if current official Expo/drizzle compatibility is confirmed at scaffold time**; otherwise the repository layer (§A, §C) is implemented directly over raw `expo-sqlite` with hand-written types and a small migration runner | Raw SQL + hand-rolled migration runner (the approved fallback, not just a rejected alternative); Prisma (no practical React Native/Expo runtime support) | Medium, mitigated by the fallback — drizzle is never forced if it introduces instability |
| expo-notifications | Local reminder scheduling | Official Expo module for local notifications | react-native-push-notification (community, less Expo-integrated) | Low |
| expo-localization | System locale detection | Official, pairs with the localization library below | — | Low |
| i18n-js | String translation (EN/TR) | Lightweight, commonly paired with expo-localization in Expo docs/examples | react-i18next (heavier, React-context-based — more than V1's two-language, moderate string count needs); hand-rolled JSON lookup (viable zero-dependency fallback if string count stays small) | Low |
| Native `Intl` API (built into Hermes) | Date/number formatting | Already available at runtime, no dependency needed | date-fns / dayjs — rejected for V1: adds a dependency for formatting `Intl` already covers | None |
| EAS Build | Build/release | Product OS default, required for any real-device or store build | — | Low |

No Redux, MobX, Zustand, or other global state framework is introduced (see §K). No dependency-injection framework or ORM beyond the single typed data-access layer (drizzle, or its raw-`expo-sqlite` fallback, §C) is introduced. The one deliberate exception is the **repository layer** (§A, §S) — a thin, explicit data-access boundary (one module per entity, no generic/dynamic repository abstraction) required specifically so UI and domain logic never touch SQLite directly and a future sync layer can be introduced without rewriting feature code; this is architecture the product's own local-first/future-sync requirements demand, not abstraction for its own sake.

## C. Local database decision

**Recommended: `expo-sqlite`**, accessed through `drizzle-orm`'s expo-sqlite driver for typed schema definitions, typed queries, and migration tooling.

Explicit comparison:

| | expo-sqlite | WatermelonDB |
|---|---|---|
| Maintainer | First-party Expo module | Community-maintained |
| Setup | Minimal — works in managed workflow with a dev client | Heavier — adapters, native linking, more boilerplate |
| Query model | SQL (raw, or via a typed layer like drizzle) | Reactive observables over a model layer |
| Reactivity | Not built-in — screens re-fetch on focus/mutation (see §K) | Built-in — UI auto-updates on data change |
| Designed for | General local-relational storage | Apps built around eventual multi-device sync from day one |
| Fit for V1 | Strong — V1 needs reliable relational storage and historical-accuracy guarantees, nothing more | Overkill — its main advantages (reactivity, sync-ready model layer) solve problems V1 doesn't have yet, since sync is explicitly deferred (§T) |

Also considered and rejected: **op-sqlite** (community high-performance binding — no first-party backing, adds maintenance risk for a performance need V1's data volume doesn't have); **Realm** (heavier native footprint, object-database paradigm mismatched to this relational domain, ownership/long-term status less certain than an Expo first-party module).

**Decision rationale**: `expo-sqlite` is the simplest reliable option that is officially supported, keeps native build risk low, and satisfies the migration-readiness and historical-accuracy requirements without introducing unnecessary architecture.

**Approved fallback plan**: `drizzle-orm`'s expo-sqlite driver is used **only if** current official Expo/Drizzle compatibility is confirmed against official documentation at scaffold time. If compatibility is unclear, unsupported, or introduces instability, the fallback is a small, hand-written **typed repository layer directly over raw `expo-sqlite`** (parameterized SQL strings behind typed functions, plus a hand-written migration runner keyed on `PRAGMA user_version`, §Q). Either way, the repository boundary (§A) stays identical from the domain layer's perspective — swapping drizzle for raw SQL is an internal change to `src/repositories`/`src/db`, invisible above that layer. Drizzle is a convenience, never a forced dependency.

## D. Complete V1 data model

All entities use **app-generated UUIDs** as primary keys (not auto-increment integers), so records remain stable and mappable if a future account/sync layer is introduced (§N, §T).

### UserPreferences (singleton row)
`id` (fixed `'default'`) · `languageOverride` (`'en' | 'tr' | null`, null = follow system) · `notificationDetailOptIn` (boolean, default `false`) · `createdAt` · `updatedAt`

### OnboardingState (singleton row)
`id` (fixed `'default'`) · `completed` (boolean) · `whatToRemember` (string[] — informational record of onboarding step 3's selection, e.g. `['medications','appointments']`) · `completedAt` (nullable timestamp) · `createdAt` · `updatedAt`

### DailyCheckIn
`id` · `date` (date-only, `YYYY-MM-DD`, **unique** — one row per calendar date) · `pain` (int 0–10) · `fatigue` (int 0–10) · `morningStiffnessBucket` (enum: `none | under_15 | 15_30 | 30_60 | over_60`) · `wellbeing` (nullable enum 1–5) · `notes` (nullable text) · `flaggedImportant` (boolean, default `false` — surfaces this check-in's note in Appointment Preparation) · `createdAt` · `updatedAt`

*(`notes`/`flaggedImportant` are additions beyond the literal minimum list, added because the already-approved UX spec requires Appointment Preparation to surface "relevant user notes" — there was otherwise no field to hold them.)*

### CheckInBodyArea (join table)
`checkInId` (FK) · `region` (enum: `neck | upper_back | lower_back | hips | shoulders | chest_ribs | other`)

### Medication
`id` · `name` (free text) · `dose` (free text) · `notes` (nullable) · `active` (boolean, default `true`) · `createdAt` · `updatedAt` · `archivedAt` (nullable)

### MedicationSchedule (versioned)
`id` · `medicationId` (FK) · `frequencyType` (enum: `daily | specific_days | custom_interval`) · `intervalDays` (nullable int, for `custom_interval`) · `reminderEnabled` (boolean, default `true`) · `effectiveFrom` (date) · `effectiveUntil` (nullable date — set when superseded) · `createdAt`

### MedicationScheduleDay (join table, for `specific_days`)
`medicationScheduleId` (FK) · `dayOfWeek` (0–6)

### MedicationScheduleTime (join table)
`medicationScheduleId` (FK) · `timeOfDay` (`HH:mm`, local wall-clock)

### MedicationAdministration (immutable historical record)
`id` · `medicationId` (FK) · `medicationScheduleId` (FK, nullable — traceability only) · `scheduledFor` (datetime — **immutable once created**) · `status` (enum: `pending | taken | missed | skipped`) · `actualTime` (nullable datetime) · `createdAt` · `updatedAt` (only `status`/`actualTime` are ever mutated — see §F)

### InjectionTreatment
`id` · `name` (free text) · `dose` (free text) · `active` (boolean, default `true`) · `createdAt` · `updatedAt` · `archivedAt` (nullable)

### InjectionSchedule (versioned)
`id` · `injectionTreatmentId` (FK) · `intervalDays` (int) · `reminderLeadDays` (int, default `1`) · `reminderOnScheduledDay` (boolean, default `true`) · `effectiveFrom` (date) · `effectiveUntil` (nullable date) · `createdAt`

### InjectionAdministration (immutable historical record)
`id` · `injectionTreatmentId` (FK) · `injectionScheduleId` (FK, nullable — traceability) · `scheduledFor` (date — **immutable once created**) · `status` (enum: `pending | completed | missed`) · `actualDate` (nullable date) · `createdAt` · `updatedAt`

### Appointment
`id` · `type` (enum: `rheumatology | laboratory | imaging | other` — coded, localized at render time) · `doctorOrInstitution` (nullable free text) · `date` (date) · `time` (nullable, `HH:mm`) · `notes` (nullable) · `reminderLeadDays` (int, default `1`) · `status` (enum: `scheduled | completed | cancelled`) · `createdAt` · `updatedAt`

Today's "upcoming appointment" surfacing (§ UX spec) uses a named domain constant, `UPCOMING_APPOINTMENT_WINDOW_DAYS = 14` (`src/domain/constants.ts`) — read by any screen/query that needs it, never a value re-typed per screen.

### LabResult
`id` · `marker` (enum: `CRP | ESR` — extensible enum, adding a marker is a code change, not a schema change) · `value` (numeric) · `unit` (text, pre-filled default per marker — `mg/L` for CRP, `mm/hr` for ESR — but stored per-row) · `recordedDate` (date) · `institution` (nullable) · `notes` (nullable) · `createdAt` · `updatedAt`

### LabReminder (user-configured, not tied to a specific past result)
`id` · `label` (free text, e.g. "CRP check") · `marker` (nullable enum) · `dueDate` (date) · `reminderLeadDays` (int, default `0`) · `status` (enum: `pending | completed | dismissed`) · `createdAt` · `updatedAt`

### ScheduledNotification (system bookkeeping — not a product-facing entity)
`id` · `sourceType` (enum: `medication | injection | appointment | lab_reminder`) · `sourceId` (FK, polymorphic by `sourceType`) · `notificationIdentifier` (string, returned by `expo-notifications`, used to cancel) · `scheduledFor` (datetime) · `isRepeating` (boolean) · `createdAt`

Not modeled in V1, per explicit scope: BASDAI, exercise, nutrition, gamification (streaks/badges).

## E. Schema relationships

```
Medication 1───* MedicationSchedule 1───* MedicationScheduleDay
     │                    │
     │                    └──────────* MedicationScheduleTime
     │
     └──────────────────* MedicationAdministration (references MedicationSchedule optionally, for traceability)

InjectionTreatment 1───* InjectionSchedule
     │
     └──────────────────* InjectionAdministration (references InjectionSchedule optionally)

DailyCheckIn 1───* CheckInBodyArea

Appointment  (standalone — rheumatology-type appointments are looked up by date for §J, not FK-linked to a "previous appointment")

LabResult    (standalone — queried by marker + date range)

LabReminder  (standalone)

{Medication | InjectionTreatment | Appointment | LabReminder} 1───* ScheduledNotification (polymorphic via sourceType/sourceId)
```

Deliberately **no** foreign key from `Appointment` to a "previous appointment" — the Appointment Preparation lookback (§J) resolves the previous rheumatology appointment by querying `Appointment` for the latest row with `type = 'rheumatology'` and `date < currentAppointment.date`, computed at read time. This avoids a fragile ordering field and stays correct even if appointments are added out of chronological order.

## F. Historical-accuracy invariants

This is the domain's most important guarantee, and it is enforced structurally, not just by convention:

1. **`MedicationAdministration.scheduledFor` and `InjectionAdministration.scheduledFor` are write-once.** The application layer never issues an `UPDATE` against this column. Only `status` and `actualTime`/`actualDate` are ever updated after creation — recording an outcome is not the same as rewriting history.
2. **Schedules are versioned, never mutated in place.** Editing a medication's schedule does not `UPDATE` the existing `MedicationSchedule` row. It sets that row's `effectiveUntil` to the effective date of the change, then `INSERT`s a new `MedicationSchedule` row with `effectiveFrom` starting from that date. The same pattern applies to `InjectionSchedule`.
3. **Expected-dose/administration generation always reads the schedule version that was effective on the date in question.** Regenerating or displaying past administrations never re-reads "the current schedule" — it reads whichever `MedicationSchedule`/`InjectionSchedule` row's `[effectiveFrom, effectiveUntil)` range contains that historical date.
4. **Archiving never deletes.** Setting `Medication.active = false` (or the equivalent for `InjectionTreatment`) stops future schedule generation and reminder scheduling; it never deletes `MedicationAdministration`/`InjectionAdministration` history.
5. **Next-injection-date is always derived, never stored as a separately-editable field.** `nextInjectionDate = lastLoggedAdministration.actualDate (or scheduledFor if on time) + currentInjectionSchedule.intervalDays`, computed by a pure function, recalculated after every new `InjectionAdministration` is logged.

Example walked through: a medication scheduled for Mondays is changed to Wednesdays on August 20. The existing `MedicationSchedule` row (Mondays) gets `effectiveUntil = 2026-08-20`. A new row (Wednesdays) gets `effectiveFrom = 2026-08-20`. Every `MedicationAdministration` already created for past Mondays keeps its original `scheduledFor` value untouched; only administrations generated for dates on/after August 20 use the new Wednesday schedule.

## G. Reminder architecture

Local notifications only (`expo-notifications`), scheduled and reconciled entirely on-device.

**Scheduling strategy differs by recurrence shape, chosen specifically to avoid unbounded notification counts:**

- **Regular medication schedules (`daily` or `specific_days`)** use **repeating calendar triggers** (one trigger per time-of-day × weekday combination) — e.g. a medication taken Mon/Wed/Fri at 08:00 registers 3 repeating weekly triggers, not one row per future date. iOS fires these indefinitely without consuming additional pending-notification slots per occurrence, and this is also what makes "app not opened for an extended period" a non-issue for regular schedules — the OS handles repetition without the app's involvement.
- **`custom_interval` medications** (schedules that don't map to a native repeat unit) use a **bounded rolling window** of exactly **8 future occurrences** — a named domain constant, `CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE = 8` (defined once in `src/domain/constants.ts`, never a magic number inline), topped up during the launch/foreground reconciliation pass (below) — never an unbounded future series.
- **Injections** are never scheduled as a repeating trigger, deliberately: because the next injection date is recalculated from the actual logged date (which can drift from the "ideal" schedule if logged early/late — see §F), a fixed repeating interval would silently drift out of sync with reality. Instead, exactly the next occurrence's two reminders (`reminderLeadDays` before, and day-of) are scheduled at a time, and are cancelled and rescheduled fresh every time a new `InjectionAdministration` is logged.
- **Appointments and lab reminders** are inherently one-off — a single concrete notification per reminder, tied to that record's `ScheduledNotification` row.

This keeps a typical user's total pending-notification count in the low double digits at most (a handful of repeating medication triggers + 1–2 injection reminders + a few upcoming appointment/lab reminders), comfortably under iOS's documented pending-local-notification ceiling — the exact current figure should be confirmed against Apple's current documentation at implementation time rather than assumed from memory.

**Reconciliation runs on every one of these triggers** (approved, exhaustive for V1):
1. App launch.
2. Returning to foreground.
3. After any reminder configuration change (e.g. toggling a medication's reminder, changing `notificationDetailOptIn`).
4. After a detectable timezone change (persisted last-known timezone compared to current on each run above).
5. After a medication or injection schedule edit (§F) — the new schedule version's future reminders are (re)scheduled immediately, not deferred to the next launch/foreground event.

Each run performs:
- Topping up the rolling 8-occurrence window (`CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE`) for any `custom_interval` medications.
- If a timezone change was detected: cancelling and rescheduling affected notifications so wall-clock expectations stay correct.
- Re-checking notification permission status (`Notifications.getPermissionsAsync()`) — if revoked, the app stops attempting new scheduling calls and updates in-app UI to reflect "reminders off"; it does not need to manually cancel already-OS-scheduled notifications, since a permission revocation is handled by the OS itself.
- A safety-net pass reconciling `ScheduledNotification` bookkeeping rows against what domain data currently implies should be scheduled, correcting any drift.

**DST behavior**: deliberately avoided as a risk by construction — nothing in this design uses a fixed-elapsed-seconds repeating trigger (which would drift across DST). All triggers are calendar/wall-clock based (specific weekday+time, or a specific date+time), which is the correct, DST-safe trigger type for "remind me at 8am" style reminders. This should still be verified against current `expo-notifications`/iOS documentation at implementation time.

**Event-driven cancellation/rescheduling** — each of the following triggers an explicit reconciliation of that entity's `ScheduledNotification` rows (cancel old, schedule new):
- Medication/injection schedule changed → cancel notifications tied to the superseded schedule version, schedule from the new one.
- Medication/injection archived → cancel all future notifications for it; past history untouched.
- Appointment edited → cancel and reschedule its single reminder.
- Appointment deleted → cancel its reminder.
- Notification permission denied at the point of creation → the domain write still succeeds (§P); scheduling is simply skipped and the UI shows the "reminders are off" state from the UX spec.

**Notification content**, per the approved UX spec: default payload is the generic, privacy-preserving string ("You have a health reminder.") with no medication/injection name unless the user has explicitly opted in via `UserPreferences.notificationDetailOptIn`; symptom values, lab values, and personal notes are never included in a payload under any configuration.

## H. Time/date conventions

Three distinct kinds of values, deliberately not conflated:

1. **Date-only values** (`DailyCheckIn.date`, `*.scheduledFor`/`*.actualDate` for injections, `Appointment.date`, `LabResult.recordedDate`, schedule `effectiveFrom`/`effectiveUntil`) — stored as plain `TEXT` `YYYY-MM-DD`, timezone-agnostic by design. This avoids the classic bug where storing a calendar date as a UTC midnight timestamp shifts it to the previous/next day in some timezones.
2. **Local wall-clock times** (`MedicationScheduleTime.timeOfDay`, appointment `time`) — stored as `TEXT` `HH:mm`, interpreted relative to the device's *current* local timezone at the moment a reminder is computed, not a fixed offset. This is intentional: "take your medication at 8am" is a wall-clock commitment, not a fixed instant in UTC.
3. **True timestamps** (`createdAt`, `updatedAt`, `MedicationAdministration.actualTime` when time-of-day matters as a precise instant) — stored as ISO 8601 UTC text, where UTC is correct because these represent actual instants, not recurring wall-clock commitments.

This distinction is the direct fix for the requirement to avoid "naively storing every scheduling concept as a UTC timestamp," and is documented here so it isn't accidentally collapsed into one convention later.

## I. Insights engine

Pure, deterministic, fully local functions — no LLM, no remote call, no diagnostic logic anywhere in this layer.

| Function | Input | Output |
|---|---|---|
| `computePainHistory` | check-ins, date range | `{ average, previousPeriodAverage, direction, dataPoints, sufficientData }` |
| `computeFatigueHistory` | check-ins, date range | same shape as pain |
| `computeStiffnessHistory` | check-ins, date range | descriptive bucket counts (e.g. "days over 30 minutes: 4 of 7"), **not** a numeric average — averaging ordinal buckets (`15_30`, `over_60`, etc.) would fabricate false precision, so this function reports counts/most-common-bucket instead |
| `computeMedicationAdherence` | administrations, medication id (optional), range | `{ takenCount, missedCount, skippedCount, adherencePercentage, sufficientData }` |
| `computeInjectionHistory` | administrations, range | chronological list + completed/missed counts |
| `computeLabHistory` | lab results, marker, range | `{ values, min, max, mostRecent, sufficientData }` |

**Minimum-data thresholds** (constants, not user-configurable in V1):
- Pain / fatigue trend comparison: requires ≥ 3 check-ins in the selected range; below that, `sufficientData = false`.
- Lab trend line: requires ≥ 2 recorded values for the same marker; a single value renders as "most recent reading," not a trend.
- Medication adherence percentage: requires ≥ 3 scheduled doses to have passed in range.
- Injection history: requires ≥ 1 completed injection.

**Copy templates** are deterministic string templates filled only with the user's own computed numbers/dates — never a claim of causation, diagnosis, or comparison to an external "normal" range:

- Allowed: *"Your recorded pain averaged 5.2 this week and 4.6 the previous week."*
- Allowed: *"Your CRP has ranged from 4 to 12 mg/L over the last 6 months; most recent value 6 mg/L on [date]."*
- Not allowed, and structurally impossible to produce from this function set: *"Your condition appears to be getting worse,"* any flare/treatment-efficacy/progression language, or any causal attribution.

When `sufficientData` is `false`, the UI renders the approved calm empty-state copy ("Keep checking in to see how your symptoms change over time") instead of calling a chart-rendering path at all.

## J. Appointment Preparation aggregation

A single local read function, `buildAppointmentPreparation(appointmentId)`, assembled at view time — **not persisted as its own table**, per explicit instruction; it is always derived fresh from canonical records.

1. Load the target `Appointment`.
2. **Resolve lookback range**: query `Appointment` for the most recent row with `type = 'rheumatology'` and `date < target.date`. If found, `rangeStart = thatAppointment.date`. If not found, `rangeStart = target.date - 90 days`. `rangeEnd = target.date`.
3. Run `computePainHistory` / `computeFatigueHistory` / `computeStiffnessHistory` scoped to `[rangeStart, rangeEnd)`.
4. Run `computeMedicationAdherence` per active medication in range.
5. Run `computeInjectionHistory` in range.
6. Run `computeLabHistory` per marker in range.
7. Query `DailyCheckIn` rows in range where `flaggedImportant = true` for their `notes`.
8. Return an in-memory `AppointmentPreparationSummary` object containing the resolved range plus each section's data, for the UI to render per `docs/UX_SPECIFICATION.md` §K.

No caching of this result beyond in-memory, request-scoped use — re-derived each time the screen is opened, since the underlying data can change (e.g. a check-in logged the same day) and staleness here would be a trust problem, not just a UX inconvenience.

## K. State management

The smallest architecture that covers the actual need — **no Redux, MobX, or Zustand global store.**

- **Persistent domain data** — lives only in SQLite (§D), accessed exclusively through the domain layer, which in turn calls the repository layer (`src/repositories/`, §A) — never `src/db` directly from anywhere above it.
- **Feature/application-service hooks** — each feature exposes its own hooks (e.g. `useTodayData()`, `useMedications()`, `useCheckIn(date)`) that call domain functions and expose loading/error/data state via plain React state (`useState`/`useReducer`), not a global store.
- **Freshness strategy** — screens re-fetch on focus (Expo Router's focus-effect equivalent) and after any mutation they themselves perform. Cross-screen staleness (e.g. Today needs to reflect a check-in saved from its own sheet) is handled by the mutating hook calling a shared "data changed" signal (a minimal event emitter or React Context invalidation counter) that dependent hooks listen to — not a full reactive database layer.
- **UI-only state** (in-progress form values, sheet open/closed) stays local component state; the check-in sheet's draft-preservation behavior (§ UX spec) persists to a small local draft record, not global state.
- **Derived insight data** is computed on demand by the pure functions in §I and memoized in-memory only (e.g. via `useMemo`) — never written back to the database, consistent with §J's "derive, don't duplicate" principle.
- **Notification scheduling state** lives in the `ScheduledNotification` table (§D) — the one piece of "state" that legitimately needs persistence outside the core domain tables, because it bridges domain data to an external OS system.

If this proves insufficient as the app grows (e.g. cross-feature cache invalidation becomes genuinely complex), the documented escalation path is adopting a lightweight query-caching library (e.g. TanStack Query) — **not introduced now**, since V1's entirely-local, single-user data doesn't yet demonstrate the need.

## L. Offline behavior

There is no "offline mode" — offline is simply normal operation. Every core V1 feature (§ PRD/UX) reads and writes exclusively to the on-device database; nothing in the primary read/write path calls the network. The only features that will ever have a network dependency are explicitly future and out of scope for V1: optional account creation, cloud backup/sync (§N, §T). No loading spinner, retry banner, or degraded state exists anywhere in V1 for "no connection," because connection is never a precondition for any V1 action.

## M. Privacy/security model

- **Minimal data collection** — only the fields in §D are collected; no analytics SDK exists in V1 (per `PROJECT_MEMORY.md`), so no health data is transmitted anywhere, ever, in this version.
- **Local storage boundary** — all health data lives in the app's sandboxed SQLite file. iOS provides automatic file-level encryption at rest for app sandbox data by default while the device is locked (standard Data Protection behavior); the exact protection class applied to the SQLite file's location should be confirmed against current Expo/iOS documentation at implementation time rather than assumed — this document does not claim a stronger guarantee than the platform actually provides.
- **No field-level app encryption in V1 — approved, accepted risk.** No additional encryption (e.g. SQLCipher) beyond the OS default is built now. If a device is unlocked or otherwise compromised, on-device data is as exposed as any other locally-stored app data. **Revisit triggers**, any of which reopens this decision: cloud sync is added; regulatory requirements change; highly sensitive free-text data (e.g. notes) expands in scope or volume; an external security review requires it.
- **Secrets** — V1 has none. A fully local, no-backend app has no API keys or service credentials to protect on-device, which is a genuine security advantage of the local-first approach.
- **Device backups — approved: included.** The local application database participates in standard iOS device/iCloud backups by default, unless the platform itself requires otherwise. No custom backup service is implemented in V1. Rationale: V1 has no other backup mechanism, and excluding the database from backups would mean device loss equals total loss of a user's health history — a worse outcome than relying on Apple's own encrypted-backup protections. This behavior is documented here as the canonical technical record and must also be reflected in the product's privacy/data disclosure copy (Profile → Privacy & data, per `docs/UX_SPECIFICATION.md` §L) so users aren't surprised by it.
- **No health values in logs, crash reports, or analytics** — enforced structurally by having no analytics SDK and no crash-reporting SDK in V1; error logging (§P) is designed to log entity type and operation, never field values. **Explicit engineering standard for this project**: sensitive health values (pain/fatigue/stiffness scores, medication/injection names and doses, lab values, appointment notes, check-in notes) must never be written to console logs in production builds, in addition to never appearing in analytics, crash reports, or notification payloads.
- **No health values in notification payloads** — enforced by the notification content design in §G.
- **Account/data deletion** — not applicable to build in V1 since there is no account; when introduced (§N), deletion must cascade to all locally-synced health data, a requirement to carry into that future design, not solved here.
- **Future export boundary** — CSV/JSON personal export and PDF doctor-summary export (approved direction, PRD §10.10) would read through the same repository/domain layers used by Insights/Appointment Preparation; no export code exists in V1.

## N. Authentication boundary

No authentication exists in V1, and none is required for onboarding or any core feature. All entities use app-generated UUIDs (§D) specifically so they need no renumbering if a future account layer is introduced. A future optional account/cloud-sync feature would add a separate mapping (e.g. a `remote_user_id` reference introduced via a migration, §Q) associating local records to a remote account — this is a additive change to the schema, not a redesign, because nothing in V1's domain or UI logic assumes or requires a `user_id`.

## O. Localization architecture

**Approved, final**: `expo-localization` + `i18n-js` + native `Intl` APIs — no hand-written localization framework. Initial supported locales: **`en`, `tr`**. Every user-facing string must go through this localization layer from the first screen built — no hardcoded English string is acceptable, even temporarily, since retrofitting localization later is exactly the kind of rework this decision exists to avoid.

- **Locale detection**: `expo-localization` reads the system locale on launch; `UserPreferences.languageOverride` allows a manual override from Profile, defaulting to `null` (follow system).
- **String organization**: flat JSON dictionaries per locale (`src/localization/en.json`, `src/localization/tr.json`) loaded through `i18n-js`, keyed by feature (e.g. `today.checkInPrompt`, `medication.markTaken`).
- **Domain values are never localized strings** — enums (`Appointment.type`, `LabResult.marker`, `DailyCheckIn.morningStiffnessBucket`, etc.) are stored as stable coded values (`"rheumatology"`, `"CRP"`, `"15_30"`) and translated only at render time via the string dictionaries. Example, exactly as specified: persist `appointment.type = "rheumatology"`; render `EN → "Rheumatology"`, `TR → "Romatoloji"`.
- **Date/time formatting**: the native `Intl.DateTimeFormat`/`Intl.NumberFormat` APIs, parameterized by the active locale, format all dates/numbers for display — the underlying stored values (§H) stay locale-agnostic.
- **Numeric formatting**: `Intl.NumberFormat` handles decimal-separator differences (`4.5` vs `4,5`) automatically per locale.
- **CRP/ESR unit presentation**: the unit itself (`mg/L`, `mm/hr`) is not translated (these are standard scientific unit abbreviations, identical in both languages) — only surrounding labels are.
- **Pluralization**: `i18n-js` (or the fallback hand-rolled approach) must support locale-aware pluralization rules for any count-based string (e.g. "3 doses" / "1 dose"); Turkish pluralization rules differ from English and must be handled per-locale, not string-concatenated.

## P. Error handling

Categories: **validation** (bad input before it reaches the database), **local-database** (write/read failure), **notification-scheduling** (a secondary, non-blocking operation), and future **network** (not applicable in V1's core paths).

**Critical principle, enforced structurally**: a failed secondary operation must never destroy or roll back a successful primary health-record write. Concretely — saving a medication is a single database transaction (`INSERT Medication` + `INSERT MedicationSchedule` [+ related rows], committed together); notification scheduling is a **separate step attempted only after that transaction has committed**. If scheduling throws, the medication record is already safely saved; the user sees a recoverable "couldn't set up your reminder — tap to retry" state, never a rolled-back save.

```
try {
  await db.transaction(insertMedicationAndSchedule)   // primary write
} catch (e) {
  throw new DomainError('medication_save_failed')      // nothing saved; user retries the whole action
}

try {
  await scheduleNotifications(medicationId)             // secondary, independent
} catch (e) {
  reportRecoverable('reminder_setup_failed', medicationId)  // medication stays saved
}
```

**User-facing behavior**: plain-language messages, preserved input, a clear retry action, never a raw error/stack trace surfaced to the user — per `03_ENGINEERING/ERROR_HANDLING_AND_LOGGING.md`.

**Logging**: structured, and — per the privacy model (§M) — logs entity type and operation/error code only, never a health field value (no pain score, medication name, or lab value in any log line).

## Q. Migration strategy

- **Schema versioning**: SQLite's built-in `PRAGMA user_version`, the idiomatic mechanism for this — one integer, incremented per migration.
- **Migration definition**: an ordered set of migration files (using `drizzle-kit`'s migration generation against the drizzle schema, or hand-written SQL files if that tooling doesn't fit at implementation time), applied sequentially on app launch whenever `PRAGMA user_version` is behind the app's expected version.
- **Migrations are additive by default** — adding tables/columns rather than destructive rewrites wherever possible. A destructive change (column removal/type change) requires an explicit backup-and-transform step in that migration, never a blind drop.
- **Development workflow**: migrations are authored and run against a disposable dev database before being included in a release; a dev-only "reset local database" debug action exists for fast iteration and is never present in production builds.
- **Production safety**: migrations run transactionally on launch, before any UI reads the database. If a migration fails, the app surfaces a clear, recoverable "couldn't prepare your data" state rather than proceeding against a broken schema or silently deleting/recreating the database — the local database is never treated as disposable in production, since it is V1's only copy of the user's data (§M backup note).

## R. Testing strategy

**Highest-priority automated tests, before any feature expansion beyond core V1** (approved order):

1. Schedule generation
2. Schedule versioning
3. Historical administration integrity
4. Injection next-date calculation
5. DST/timezone behavior where unit-testable
6. Appointment lookback calculation
7. Insights aggregation thresholds
8. Notification reconciliation logic

| Area | Unit | Integration | Manual (device) |
|---|---|---|---|
| Medication schedule generation | ✅ pure function | | |
| Medication schedule edits (versioning) | ✅ | ✅ (schedule row transitions) | |
| Historical administration preservation | ✅ (explicit invariant test: edit schedule, assert past rows unchanged) | | |
| Injection interval calculation | ✅ pure function | | |
| Injection interval changes | ✅ | ✅ | |
| Reminder scheduling/rescheduling | | ✅ (mocked `expo-notifications`) | ✅ (real delivery/content) |
| Notification reconciliation logic (§G triggers) | ✅ (unit-testable where logic is pure) | ✅ | |
| Timezone change reconciliation | ✅ (where unit-testable) | ✅ | ✅ |
| DST behavior | ✅ (where unit-testable) | | ✅ (fundamentally an OS/hardware behavior) |
| Appointment lookback resolution | ✅ pure function | | |
| Insights calculations | ✅ (fixture-driven) | | |
| Insufficient-data thresholds | ✅ (boundary cases: at threshold, one below) | | |
| Localization formatting | ✅ | | ✅ (visual string-length check, EN/TR) |
| Database migrations | | ✅ (apply chain against fixture DBs of each prior version) | |
| Notification permission flows | | | ✅ |
| Dynamic Type / VoiceOver / Reduce Motion | | | ✅ |
| App backgrounded for an extended period | | | ✅ |

**Real-device QA remains mandatory** — approved as non-negotiable, not merely preferred — for actual notification delivery, timezone/DST behavior, accessibility (VoiceOver, Dynamic Type), and Reduced Motion behavior, since none of these can be fully proven by unit or integration tests alone. Consistent with `03_ENGINEERING/TESTING_STRATEGY.md`: use the cheapest reliable layer first — most of the domain's critical correctness (the historical-accuracy invariant in particular) is verifiable with fast, deterministic unit tests.

## S. Project directory structure

```
app/                          # Expo Router routes — thin, compose feature screens
  (tabs)/
    today.tsx
    track/index.tsx, medications/, injections/, labs/
    appointments/index.tsx, [id].tsx, prepare.tsx
    insights/index.tsx, [metric].tsx
  onboarding/                 # welcome, trust, what-to-remember, first-treatment, appointment
  profile/                    # settings screens
  check-in.tsx                # modal/sheet route

src/
  features/                   # feature-scoped UI + application-service hooks
    today/ · check-in/ · medications/ · injections/ · appointments/
    appointment-prep/ · labs/ · insights/ · onboarding/ · profile/
    # each feature's hooks call src/domain only — never src/repositories or src/db directly

  domain/                     # pure logic, framework-agnostic
    constants.ts                # named domain constants — CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE (8),
                                 # UPCOMING_APPOINTMENT_WINDOW_DAYS (14), minimum-data thresholds (§I), etc.
    scheduling/                # medication/injection schedule generation, historical-accuracy rules
    insights/                  # pure computation functions + copy templates (§I)
    appointment-prep/          # aggregation function (§J)
    notifications/             # scheduling policy — what/when, not the expo-notifications calls themselves
    # calls src/repositories only — never src/db directly

  repositories/                # THE data-access boundary — one module per entity
    medicationRepository.ts · injectionRepository.ts · appointmentRepository.ts
    labResultRepository.ts · checkInRepository.ts · scheduledNotificationRepository.ts · ...
    # the ONLY layer that imports src/db; hides drizzle-vs-raw-expo-sqlite (§C) from everything above it

  db/
    schema/                    # drizzle schema definitions (or hand-written table defs if using the raw-SQL fallback, §C)
    migrations/                # generated/hand-written migration files
    client.ts                  # sqlite connection setup

  notifications/
    client.ts                  # thin wrapper over expo-notifications
    reconciliation.ts          # foreground/launch reconciliation pass (§G)
    copy.ts                    # privacy-preserving notification copy templates

  localization/
    en.json / tr.json
    format.ts                  # Intl-based date/number formatting helpers

  design-system/
    tokens.ts                  # colors/spacing/type/radius from docs/VISUAL_DESIGN_SPECIFICATION.md
    components/                 # Button, Chip, SteppedScale, ListRow, Sheet, etc.

  shared/
    types/
    utils/
```

Rationale: feature-oriented ownership (per `03_ENGINEERING/ARCHITECTURE.md`), with a clear one-way dependency direction — `app/` → `features/` → `domain/` → `repositories/` → `db/` (plus `notifications/`, `localization/`, `design-system/` as supporting, side-by-side concerns) — so no UI component ever queries SQLite directly, no domain logic ever imports `src/db` directly, and domain logic stays testable independent of both React Native and the specific database access technology chosen in `src/db`/`src/repositories` (§C).

## T. Future Supabase/sync boundary

Supabase remains **explicitly future scope**. During V1 scaffolding and implementation, this project must **not** create: authentication, a sync engine, a cloud schema, remote repositories, or any account UI. The repository/data architecture (§A) merely avoids *blocking* this future direction — it does not build toward it now.

```
UI / domain (unchanged) → src/repositories (unchanged interface)
                                │
                    [future] sync engine (not designed)
                                │
                          Supabase (future, optional)
```

A future sync engine would be a new module sitting *beside* `src/repositories`, not replacing it: it would read local changes (most simply, by watching `updatedAt` timestamps, or a change-log table added via a later migration), push them to Supabase, and pull remote changes into local tables — all while the UI and domain layers continue reading and writing through the exact same `src/repositories` interface they use today. Because every entity already has a stable UUID (§D, §N) and the domain layer never assumes a `user_id`, introducing this later is additive (new module + a migration adding remote-mapping columns), not a rewrite. No sync conflict resolution, change-log schema, authentication flow, or Supabase schema is designed in this document — that is explicitly deferred.

## U. Technical risks

- **`drizzle-orm`'s expo-sqlite driver compatibility** with whatever Expo SDK version is current at scaffold time is unverified as of this document — must be checked against official docs before adoption; the approved raw-`expo-sqlite` fallback (§C) mitigates this from being a blocking risk.
- **iOS pending-notification ceiling** — the architecture is designed to stay comfortably under it (§G), but the exact current figure should be confirmed against Apple's documentation rather than assumed.
- **No field-level encryption** beyond OS defaults (§M) — an approved, accepted V1 risk with explicit revisit triggers (cloud sync, regulatory change, sensitive free-text data expansion, external security review).
- **Turkish pluralization/formatting correctness** depends on `i18n-js`'s actual locale rule support — needs verification, not assumption, once implemented.
- **Reconciliation-pass correctness** (timezone/DST/permission changes) is inherently hard to fully unit-test and will lean more heavily on manual device testing (§R) than most of this architecture.

## V. Decisions requiring approval

All decisions previously listed here have been resolved and approved (see `PROJECT_MEMORY.md`): database access with an approved drizzle/raw-SQL fallback path (§C), device backups included by default (§M), `i18n-js`/`expo-localization`/`Intl` for localization (§O), field-level encryption deferred with named revisit triggers (§M), the custom-interval rolling window fixed at 8 occurrences (§G), and the upcoming-appointment window fixed at 14 days (§D) — both as named domain constants in `src/domain/constants.ts`, not values repeated per screen.

Nothing remains open at the architecture-decision level for V1. The only genuinely unresolved item is verifying `drizzle-orm`'s current compatibility against official documentation, which is a scaffold-time verification step (§W.1), not an open design decision.

## W. Recommended implementation sequence

1. Confirm current Expo SDK/React Native/TypeScript versions and `drizzle-orm` expo-sqlite driver compatibility against official documentation — decide drizzle vs. the raw-`expo-sqlite` fallback (§C) before writing `src/db`.
2. Scaffold the Expo project (Router, TypeScript strict, EAS project linkage) — no application code yet, structure only, per §S.
3. Implement `src/db` and `src/repositories` (schema, initial migration, client, one repository per entity) and the domain scheduling/historical-accuracy logic (§F) with the §R-priority-1–4 unit tests before any UI is built — this is V1's highest-risk logic and should be proven first.
4. Implement the design-system token/component layer from `docs/VISUAL_DESIGN_SPECIFICATION.md`.
5. Implement features in the order the UX spec's user journey suggests: onboarding → Today (empty state) → check-in → medications → injections → appointments → labs → Today (fully populated) → Insights → Appointment Preparation → Profile.
6. Implement `src/notifications` (scheduling + reconciliation) once the entities generating reminders exist.
7. Implement localization once enough real UI strings exist to populate the dictionaries meaningfully.
8. Device testing pass (§R's manual rows) before any release-readiness work begins.

This sequence itself requires your approval before step 2 (Expo scaffolding) begins.
