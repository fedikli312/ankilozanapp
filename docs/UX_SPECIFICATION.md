# UX Specification — V1

Status: **Approved.** This is the UX architecture and interaction design phase. It authorizes the Visual Design phase; it does not by itself authorize Expo scaffolding or engineering.

Built under Product OS Design Mode from `docs/PRD.md` (approved), `PROJECT_CONTEXT.md`, `PROJECT_MEMORY.md`, `02_DESIGN/*`, `11_PRODUCT_CRAFT/*`, `14_DECISION_ENGINE/CRAFT_DECISION_TREES.md`, and `02_DESIGN/APPLE_HIG_REVIEW.md` / `02_DESIGN/ACCESSIBILITY_CHECKLIST.md` in `../furkan-ai-product-os`.

Design intent throughout: calm personal health companion, not a hospital dashboard or a SaaS analytics tool. One primary purpose per screen. Hierarchy before decoration. No streaks, no gamification, no decorative scores, no alarming color, no invented AI flourish.

---

## A. Final information architecture

**Approved, superseding the PRD's tentative 5-tab structure.** The PRD listed Today / Track / Appointments / Insights / Profile as five peer tabs, explicitly marked not final pending UX validation. Final decision: **drop Profile from the tab bar.**

Profile is low-frequency (settings, language, privacy, disclaimer) and doesn't compete for daily attention the way the other four do. Apple's own pattern — and this OS's own "avoid dashboard clutter" and "one dominant action" principles — favor reserving the tab bar for what a user actually returns to repeatedly, and promoting infrequent destinations to a persistent icon instead of a full tab. A 4-item tab bar also reads calmer than 5 on a small iPhone with Dynamic Type at larger sizes.

**Approved navigation:**

- Tab bar: **Today · Track · Appointments · Insights**
- **Profile** reachable via a persistent icon in the top-right corner of Today's navigation bar (and consistently available from any tab's nav bar, not just Today) — always one tap away, never competing with the four primary destinations.

```
Today (tab)
Track (tab)
 ├─ Symptoms (check-in history)
 ├─ Medications
 ├─ Injections
 └─ Labs
Appointments (tab)
 ├─ Upcoming / Past
 └─ Appointment Preparation (entered from a rheumatology appointment)
Insights (tab)
 ├─ Pain over time
 ├─ Morning stiffness over time
 ├─ Fatigue over time
 ├─ Medication adherence history
 ├─ Injection history
 └─ CRP / ESR history
Profile (icon, not a tab)
 ├─ Reminder settings
 ├─ Notification privacy
 ├─ Language
 ├─ Privacy & data (export direction, delete account/data)
 ├─ Medical disclaimer
 └─ About
```

`Track` is a landing screen with four clearly separated sections (Symptoms / Medications / Injections / Labs), each showing a one-line most-recent-entry summary and drilling into its own list + add flow — not a segmented control switching between four dense views, and not four separate tabs.

## B. Screen inventory

| Area | Screens |
|---|---|
| Onboarding | Welcome · Privacy & trust · What to remember · Add first medication/injection (or skip) · Optional upcoming appointment (or skip) |
| Today | Today (single screen, sectioned) |
| Track | Track landing · Symptoms history · Add/Edit medication · Medication detail/history · Add/Edit injection · Injection detail/history · Add CRP result · Add ESR result · Labs history (per marker) |
| Check-in | Check-in sheet (default fields) · Check-in sheet expanded (optional fields) |
| Appointments | Appointments list (Upcoming/Past) · Add/Edit appointment · Appointment detail |
| Appointment Preparation | Appointment Preparation summary |
| Insights | Insights landing · Insight detail (per trend, shared template) |
| Profile | Profile landing · Reminder settings · Notification privacy · Language · Privacy & data · Delete account/data confirmation · Medical disclaimer · About |

## C. Complete onboarding flow

Goal: reach first value (§D of the PRD) with minimal friction, no forced account creation before value, no upfront notification permission request.

1. **Welcome** — value promise only: *"Ankilozanapp remembers what happens between your rheumatology appointments."* One primary CTA: **Continue**. No marketing carousel, no multi-slide feature tour.
2. **Privacy & data trust framing** — one short screen: *"Your health information is stored on this device. It's yours — you can export or delete it anytime."* One CTA: **Continue**. This is the only trust-building screen in onboarding; it exists to shift the user from skeptical to trusting before any data entry (per `EMOTIONAL_DESIGN.md`), and to state plainly, once, that storage is local — not to present legal text.
3. **What do you want help remembering?** — multi-select chips: *Medications · Injections · Appointments · Symptoms* (all optional, none preselected). This single question determines which "add" prompts appear next — the only onboarding question that changes the experience, so it's the only one asked.
4. **Optional first treatment setup** — a short form scoped to whatever was selected in step 3 (skipped entirely if neither Medications nor Injections was chosen). Visible **Skip for now** at all times. Reminder toggle defaults on; if the user saves with the toggle on, the notification-permission system prompt fires immediately afterward — this is the *only* point in the app where permission is requested, framed by the screen's own copy ("We'll remind you when it's time") rather than a generic OS dialog with no context. Permission is never requested at app launch or anywhere else in onboarding.
5. **Optional appointment setup** — quick add (type, date) or **Skip**. Skipped entirely if Appointments wasn't selected in step 3.
6. **Today** — first arrival. If step 4 was completed, Today already shows a calculated next dose/injection (first value reached). If everything was skipped, Today shows a calm first-use empty state prompting the same action rather than a blank screen (see §M).

**Local-first, no account in onboarding.** Every onboarding step and all V1 core functionality — completing onboarding, adding medications, injections, appointments, daily check-ins, CRP/ESR results, using reminders, viewing history — works fully on-device without creating an account. Account creation is not part of onboarding; it is introduced later, from Profile, only when cloud backup/sync becomes available or necessary. Core tracking must never depend on an active internet connection.

**Explicitly not asked, anywhere in onboarding:** diagnosis history, disease duration, BASDAI, extensive demographics, account creation. Language is also not asked — the system locale (English/Turkish) is used automatically, with manual override available later in Profile.

Total onboarding: 3 fixed screens (Welcome, Privacy & data trust, "What to remember") + 0–2 conditional screens, each a single short action, every one after the trust/purpose framing skippable. Target: value promise understood in the first ~10 seconds; first data entered (for users who proceed) well under the PRD's "well under a minute" first-value target.

## D. Today hierarchy

Today answers, in order of visual weight: *Have I checked in? What needs doing today? When's my next treatment? Do I have an appointment coming up? What's coming later?*

**Approved priority order:**

1. **Daily check-in, if not completed** — the one dominant action. A single large card, one CTA ("How are you feeling today?"). Once completed, it collapses into a quiet completed row ("Checked in — Pain 3, Stiffness 20 min", tappable to edit) rather than remaining visually dominant.
2. **Something requiring action today** — medication doses due today and any due lab/task reminder, as a compact list; tap or swipe to mark taken. Taken items visually settle (fade/checkmark) rather than disappear, preserving the sense of a completed day.
3. **Next injection** — a single row when relevant (due today or within the next few days), with a **Log now** action if due today.
4. **Upcoming appointment** — a single row when one falls within the near window (proposed default: 14 days); tap opens the appointment (and Prepare, if rheumatology).
5. **Relevant future reminder** — any other reminder not covered above (e.g. a lab check reminder further out); shown only if genuinely relevant to surface today.

Rule, unchanged: a section renders only when it has real content. There is no "Upcoming appointment: none" placeholder row — the section is simply absent, keeping light days visually short instead of dashboard-dense. Exactly one section (check-in, while incomplete) ever carries dominant visual weight; everything else is a calm, equally-quiet list row.

**"Pending health tasks" is not a task-management system.** Every item that can appear in tiers 2 and 5 is derived strictly from existing product objects — a medication due, an injection due, an upcoming appointment, or a user-configured lab reminder. There is no freeform to-do list and no arbitrary productivity item.

## E. Check-in interaction specification

Target: 15–30 seconds for the default path.

Presented as a single sheet/modal (not a multi-step wizard — a wizard adds transitions that work against the speed target). Default (required) fields, always visible:

- **Pain (0–10)** — a stepped horizontal scale with large (≥44pt) tap targets per value, current value shown numerically above the control. Implemented as an accessibility *adjustable* element so VoiceOver users can swipe up/down to change the value, with each change announced ("Pain level, 4 out of 10"). Not a free-drag-only slider.
- **Morning stiffness duration** — preset duration chips (*None · <15 min · 15–30 min · 30–60 min · >60 min*) rather than a time-wheel picker, for speed.
- **Fatigue (0–10)** — final: the same stepped, accessible-adjustable control as pain, for interaction consistency — approved over free-drag interaction.

Optional fields, collapsed behind a single **"+ Add more"** disclosure (not shown by default):

- **General wellbeing** — 5-point labeled scale (*Very poor · Poor · Okay · Good · Very good*) — text-labeled, not emoji-only, so status is never color/emoji-dependent.
- **Body area affected** — final: a simple selectable chip list, not an anatomical body diagram. High-level regions: *Neck · Upper back · Lower back · Hips · Shoulders · Chest/ribs · Other.* Multi-select, optional, stays behind "+ Add more". Body-area selections are never used for diagnosis or automated interpretation — they exist only as descriptive context alongside pain/stiffness/fatigue.

One **Save** commits the whole check-in — no per-field confirmation steps. If the user dismisses the sheet before saving, partial entries are preserved locally and restored if they reopen the check-in the same day.

## F. Medication flows

- **Add** — name (free text; V1 does not depend on an external medication database, and does not offer medication recommendations or suggested dosing — the architecture may support autocomplete later, but nothing is sourced or built for V1), dose (numeric + unit), frequency (daily / specific days / custom interval), time(s) of day, optional notes, reminder toggle (default on).
- **Reminder default** — fires at the medication's scheduled time. Editable per medication; no aggressive or repeated reminders. A missed dose is never presented with guilt-inducing language (e.g. never "You forgot your medication" — instead a neutral "Missed — [medication] at [time]", tap to log late).
- **Edit schedule** — changes apply to future scheduled doses only. Per the PRD's historical-accuracy rule, previously logged doses are never rewritten.
- **Mark taken** — single tap from Today or from the medication's own list/detail.
- **Mark missed** — a scheduled dose that passes unlogged is shown as *Missed* in neutral (non-red, non-alarming) styling, paired with an icon and text label, not color alone; the user can retroactively mark it taken.
- **View history** — chronological log per medication showing taken / missed / skipped.
- **Pause / archive** — marks a medication inactive, stopping future reminders and expected doses, without deleting its history — supports a doctor changing the regimen while keeping the record accurate.

## G. Injection flows

- **Add** — treatment name (free text, same no-external-database rule as medications), dose, interval (e.g. every 2 / 4 weeks, or custom), last injection date (defaults to today, editable), reminder lead time.
- **Reminder default** — one reminder the day before the scheduled injection, and one on the scheduled day itself. Editable; no repeated or aggressive reminders beyond these two. Missed injections use the same neutral, non-guilt-inducing language as medications.
- **Recurrence configuration** — interval-based; next date = last injection + interval.
- **Next injection calculation** — shown on Today and on the injection's detail screen; recalculates forward each time a new injection is logged, per the PRD's historical-accuracy rule (past entries are never rewritten).
- **Completed** — marking today's/due injection done updates the last-injection date and recalculates the next one.
- **Missed** — an unlogged due date is shown as *Missed* (same neutral, icon+text styling as medications); logging it late recalculates the next date from the actual logged date, not the originally scheduled one.
- **Reschedule** — the user can move a single upcoming due date (e.g. appointment moved) without it being treated as missed; this affects only that one instance unless the user explicitly edits the recurring interval.
- **History** — chronological list of past injections with dates and status.

## H. Appointment flows

- **Create** — type (rheumatology / laboratory / imaging / other), doctor or institution, date, time, notes, reminder timing.
- **Edit** — any field editable until the appointment date passes.
- **Reminder** — default one day before the appointment; configurable lead time; local notification with privacy-preserving copy (see §N).
- **Upcoming appointment** — surfaced on Today within the near window; full list in Appointments, soonest first.
- **Past appointment** — moves automatically to a Past section once its date passes; remains viewable as a historical record, never deleted.
- **Rheumatology appointment preparation** — a **Prepare** action appears on rheumatology-type appointments specifically (on the appointment detail, and proactively surfaced on Today as the date nears), opening the Appointment Preparation screen (§K).

## I. Laboratory results flows

- **CRP entry / ESR entry** — two distinct, clearly labeled rows on the Labs section (not a generic "add lab" form with a marker picker buried inside), since these are the only V1 markers. Each has its own **+ Add result** action.
- **Fields** — date, value, unit (pre-filled with the marker's standard unit — mg/L for CRP, mm/hr for ESR — to reduce entry error), optional institution, optional notes.
- **Chronological history** — simple most-recent-first list per marker.
- **Trend visualization** — a plain line chart of the user's own values over their own history. No color-coded "high/low" zones or reference-range shading — that would constitute medical interpretation, which V1 must not do. Every chart carries a text-equivalent summary alongside it (e.g. *"Your CRP has ranged from 4 to 12 mg/L over the last 6 months; most recent value 6 mg/L on [date]"*), per the accessibility requirement that scores and charts have text equivalents.

## J. Insights flows

Smallest useful V1 set (per PRD §10.7): Pain, Morning stiffness, Fatigue, Medication adherence history, Injection history, CRP/ESR history.

Insights landing is a **list of rows**, not a grid of small charts — each row shows the metric name plus a one-line plain-language summary (e.g. *"Pain — averaging 3.2 this week, down from 4.1 last week"*), tappable into a focused detail view. The detail view holds one chart, the same text-equivalent summary, and a simple time-range control (4 weeks / 3 months / 6 months / all time — a segmented control, not a custom date picker).

There is no combined "health score" or composite dashboard number anywhere in V1 — that would both look decorative and imply a clinical composite that doesn't exist.

**Empty state, final**: an insight with insufficient history never renders a chart from thin data or invents a trend. It shows calm, encouraging copy instead, e.g. *"Keep checking in to see how your symptoms change over time."* — never a blank view, never a misleading or fabricated line.

## K. Appointment Preparation flow

Entry: from Today (when a rheumatology appointment is near) or from that appointment's detail screen.

A single scrollable summary — not a multi-tab screen, since it needs to be read quickly during a live appointment:

1. **Header** — *"Preparing for [Doctor/Institution] — [Date]"* plus the resolved date range, always shown explicitly: *"Summarizing since your last appointment (March 3 – August 25)"* or *"Summarizing the last 90 days"* if no prior rheumatology appointment exists, per the PRD's lookback rule.
2. **Symptom trends** — compact sparkline or short summary line per metric (pain / stiffness / fatigue) within the resolved range.
3. **Medication history** — adherence summary in descriptive language (e.g. *"Naproxen — taken 85% of scheduled doses"*), never judgmental phrasing.
4. **Injection history** — dates logged within range; any missed doses noted neutrally.
5. **Recent lab values** — CRP/ESR entries within range, chronological.
6. **Relevant user notes** — notes the user flagged as important during entry.

No PDF export in V1 (direction approved for later, per PRD §10.10) — this screen is read live, in-app, during the visit. Favor short, scannable summary lines over dense charts here specifically, since it must be legible in under a minute.

## L. Profile / settings structure

- **Reminder settings** — per-category defaults and lead times for medication, injection, appointment, and lab/task reminders.
- **Notification privacy** — "Show details in notifications" toggle, **off by default** (see §N).
- **Language** — English / Turkish, defaults to system locale, manual override available.
- **Privacy & data** — plain-language explanation of what's collected and why, and an explicit statement that data is currently stored on-device; export direction (labeled as coming later, per PRD §10.10 — not built in V1); delete account/data entry point.
- **Account / backup (future entry point)** — V1 has no account and no onboarding sign-up. This is the single place an account, once cloud backup/sync becomes available, will be introduced later — never surfaced during onboarding or elsewhere in the app.
- **Delete account/data** — a separate, explicit confirmation screen (standard iOS destructive-action pattern); deletion must cascade to all associated health data per the approved privacy architecture.
- **Medical disclaimer** — the one canonical, complete disclaimer statement lives here in full (see §P).
- **About** — version and app information.

## M. Empty / loading / error / offline / permission states

| Screen | First-use / empty | Loading | Error | Offline | Permission / notification disabled |
|---|---|---|---|---|---|
| Today | Calm prompt to add first medication/injection (not blank) | Skeleton rows matching final layout | Inline retry, preserves any local data already shown | Fully usable from on-device data; no network required; no blocking spinner | If notifications denied, a single quiet inline note near reminders-affected rows, with a link to Settings — not repeated per-section |
| Check-in | N/A (always actionable) | N/A (local, instant) | Preserve entered values on save failure, offer retry | Fully functional offline — data is stored on-device, not dependent on connectivity | — |
| Medications / Injections list | "Nothing added yet" + one primary Add action | Skeleton rows | Inline retry, preserve any partially entered form data | Add/edit/mark-taken all work fully offline (on-device storage) | — |
| Labs | "No CRP/ESR results yet" per marker, with Add action | Skeleton rows | Inline retry | Add works fully offline | — |
| Appointments | "No appointments yet" + Add action | Skeleton rows | Inline retry | Add/edit work fully offline; list is on-device | If reminder permission denied, note on the Reminder field only, not a full-screen interruption |
| Insights | Calm progressive copy, e.g. "Keep checking in to see how your symptoms change over time." — never a blank view or a chart invented from insufficient history | Skeleton chart placeholder | Inline retry | Fully available from on-device data; no network dependency for core history | — |
| Appointment Preparation | N/A (only reachable once an appointment exists) | Skeleton summary | Inline retry, never silently omit a section — show it couldn't load | Shows most recently available local data with the same explicit date-range framing | — |
| Profile | N/A | N/A | Inline retry for account/data actions | Most settings work offline; anything requiring network (e.g. future sync) clearly marked | Notification privacy toggle always available regardless of permission state |

General rules (apply everywhere): never fake progress; explain long operations with specific status copy; preserve user input across errors; offline never blocks core recording (check-in, mark taken, add appointment/lab); missed/incomplete states use icon + text, never color alone.

## N. Notification UX

- Permission is requested **contextually** — the first time the user enables a reminder-bearing action (saving a medication/injection with its reminder toggle on, or an appointment with a reminder set), never speculatively during onboarding.
- **Denial handling** — the app remains fully usable. A single calm inline note appears wherever reminders would have applied ("Reminders are off — enable them in Settings to get notified"), linking to Settings. No repeated prompts, no nagging.
- **Default notification copy is privacy-preserving and generic**: *"You have a health reminder."* It does not name the medication or injection on the lock screen by default. Tapping opens the app to the relevant item.
- **Detailed content is opt-in** — the Profile "Show details in notifications" toggle (off by default) may allow medication/injection *names* to appear in notification text once explicitly enabled.
- **Regardless of that setting**, symptom values, lab values, and health notes never appear in a notification payload, under any configuration.
- **Approved reminder defaults** (all user-editable): medication — at the scheduled time; injection — one day before and on the scheduled day; appointment — one day before.
- **No aggressive or repeated reminders** beyond these defaults, and missed-reminder language is never guilt-inducing (e.g. never "You forgot" — always a neutral statement of what's due, with an easy way to log it late).

## O. Accessibility requirements

- **Dynamic Type** — all text uses semantic type styles; layouts (Today's rows, the check-in stepped control, Insight list rows) reflow rather than clip or truncate at the largest accessibility sizes.
- **Contrast** — text and controls meet accessible contrast in both light and dark mode; status indicators (taken/missed/upcoming/completed) are never color-only, always paired with icon + text.
- **VoiceOver labels** — every interactive control has a concise, purpose-describing label (e.g. the pain control announces "Pain level, adjustable, currently 4 out of 10"); mark-taken checkboxes announce their state; every chart ships a text-equivalent summary (§I, §J).
- **Touch targets** — ≥44×44pt throughout, including check-in stepped-scale segments, list-row checkboxes, and chips.
- **Slider accessibility** — pain and fatigue use a discrete, accessibility-*adjustable* control (VoiceOver swipe up/down to change value), not a free-drag-only slider; the numeric value is always shown as text, never conveyed by handle position alone.
- **Reduced Motion** — chart transitions, the check-in save confirmation, and Today's check-in-card collapse animation all have an instant, non-motion fallback when Reduce Motion is enabled.
- **Color-independent status** — taken / missed / upcoming / completed are always icon + text, never color-only.
- **Turkish/English string expansion** — all layouts use flexible containers, not fixed-width elements sized to English text; Turkish strings (typically 20–35% longer) must be checked against real screens, especially compact rows like Today's medication list and the check-in duration chips.

## P. Trust and safety UX — progressive, not repeated disclaimer blocks

Placement, each shown once and contextually rather than as a recurring interruption:

1. **Onboarding** — one calm sentence on the Privacy & trust screen: data stays private, is user-owned, and the app organizes information rather than diagnosing. Not a legal wall of text.
2. **First time viewing Insights** — a small, persistent (but unobtrusive) caption under the section header: *"These trends reflect what you've recorded. They're not a diagnosis."* A caption, not a modal or dismiss-once banner that then vanishes.
3. **Appointment Preparation** — a small persistent caption at the top: *"A summary of what you've recorded — for you to review with your doctor."*
4. **BASDAI, once implemented (post-verification)** — the same pattern: a short contextual note near the questionnaire, not a gate.
5. **Profile → Medical disclaimer** — the one place the complete, canonical disclaimer statement lives in full, available on demand.

Rule: no large disclaimer boxes scattered through the app. Safety framing is short, calm, and embedded exactly where it matters (Insights, Appointment Preparation, BASDAI); the complete statement exists in exactly one place.

## Q. Navigation recommendation

See §A. Recommendation: **4 tabs (Today, Track, Appointments, Insights) + Profile as a persistent icon**, not a 5th tab — reserving the tab bar for the destinations a user actually returns to daily/weekly, and keeping the bar calmer at large Dynamic Type sizes.

## R. UX risks / unresolved decisions

All UX-architecture-level decisions raised at the end of the previous phase are now resolved: local-first with no onboarding auth (§C), body-area chip list (§E), fatigue scale (§E), free-text medication entry (§F), reminder defaults (§F/§G/§H/§N), pending-health-tasks derivation rule (§D), Today priority order (§D), onboarding scope (§C), 4-tab navigation (§A/§Q), and Insights empty-state copy (§J).

What remains, deferred to the next phase by design, not because it's unresolved:

- **Missed-state visual treatment** — the principle (neutral, icon + text, never alarming color, never guilt language) is fixed here; the exact color/icon/typography is a Visual Design phase decision.
- **Engineering architecture for local-first storage** — this document specifies the UX must not depend on connectivity for core tracking; how that's implemented (on-device database, sync strategy when an account is later added) is explicitly an engineering decision for a later phase, not decided here.

## S. Recommended next Product OS phase

**Visual Design phase.** Instantiate `02_DESIGN/DESIGN_SYSTEM.md` and `02_DESIGN/VISUAL_FOUNDATIONS.md` into project-specific tokens (color, type scale, spacing) as a `docs/VISUAL_DESIGN_SYSTEM.md` (or equivalent), apply `11_PRODUCT_CRAFT/MOTION_SYSTEM.md` and `HAPTIC_LANGUAGE.md` to the specific interactions defined here (check-in save, mark-taken, injection logged, appointment reminder), then run an Apple HIG + Accessibility Checklist review pass on resulting high-fidelity mockups — before any Expo scaffolding or engineering begins.
