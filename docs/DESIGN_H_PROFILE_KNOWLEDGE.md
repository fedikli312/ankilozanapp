# Design-H — Profile + Settings + Knowledge + IA Cleanup

Phase Design-H, built on Design System 2.0 foundation commit `56ef9be` and
Design-G (`7198623`). UX/presentation work only — no schema, migration,
repository, health-domain, notification-policy, RevenueCat, or RouteGate
change. Status: **implemented, uncommitted**, pending review per the
brief's explicit instruction.

## 1. Final Profile hierarchy

A deliberate hierarchy (brief §4), not one flat list — five boxless
`Section`s, in this fixed order:

1. **Preferences** — Language (current selection shown as caption).
2. **Reminders** — Reminder settings, Notification privacy (with its
   current on/off state as caption).
3. **Support** — Knowledge's new final home (§5), Privacy & data.
4. **About** — Medical information (disclaimer), Terms, About
   (app/version).

**No Subscription section** and **no separate top-level Data section** —
both deliberate omissions, reasoned below (§13, §16).

## 2. Profile entry point

Unchanged: the persistent top-right gear icon on every tab's header
(`app/(tabs)/_layout.tsx`'s `ProfileHeaderButton`), already restrained —
one small `settings-outline` glyph in `brandPrimary`, no avatar, no
fabricated identity. Live-verified it doesn't visually compete with
Today's own primary check-in action (different region of the screen,
much smaller). No change was needed here; brief §21's requirements were
already satisfied by the existing Design-B implementation.

## 3. What was removed from old Profile/Settings

- All 4 `GroupedList` boxes on the index screen — replaced by boxless
  `Section`s.
- The "Export your data — Coming later" placeholder row (`privacy-data.tsx`)
  — deleted entirely (brief §16/§22: never a "coming soon" row for an
  unimplemented capability; "No fake 'download my data' placeholder").
  Its now-orphaned translation keys (`profile.exportData`,
  `profile.exportDataComingLater`, `profile.dataManagementTitle`) were
  deleted from both locales after confirming zero remaining references.
- The stale pre-rebrand "Ankilozanapp" text on the About screen —
  replaced with the real `Wordmark` component (matching the same fix
  already made on Welcome/Paywall in Design-C).
- `GroupedList` usage on Language and Reminder Settings — both moved to
  boxless `Section`.

## 4. Settings row grammar

Not every row carries an icon (brief §10). Icons kept only where they
meaningfully improve scanning — Language, Reminder settings, Notification
privacy, Privacy & data. Knowledge and every About-group row (Medical
information, Terms, About) are plain text rows — deliberate variation,
not a blanket icon-removal or icon-per-row rule. Chevrons remain on every
navigational row (the standard affordance, not a decorative element).

## 5. Knowledge final home

`Profile → Support → Knowledge` — live-verified reachable (`/knowledge`
route, its content, and its 12 articles are completely unchanged). Not
put back into Health Record's primary hierarchy, not given a tab, not
duplicated anywhere else. The row uses `knowledge.title`/`knowledge.subtitle`
directly (no new translation keys needed) and carries no icon, matching
the row-grammar decision above.

## 6. Knowledge landing structure

Rebuilt as an editorial article index (brief §6): the featured article
and each of the 5 categories now render as boxless `Section`s (title +
hairline-separated `ListRow`s) instead of 6 separate `GroupedList` boxes.
The featured article's icon-in-a-colored-box hero treatment was removed;
every article row lost its leading category `Ionicons` glyph — article
identity now comes from title + summary + read-time alone. Same 5
categories, same 12 articles, same sources, same non-diagnostic
disclaimer — nothing in the corpus itself changed, only the container/row
presentation.

## 7. Article-detail structure

Reordered around reading (brief §7): title → concise context (summary +
read time) → key points (now plain "—" prefixed lines instead of
per-item `checkmark-circle-outline` icons) → sections (unchanged
heading/body composition, comfortable 22px line height) → an optional tip
callout (kept — the article's one legitimate emphasis moment — but its
heading text no longer colors itself in the accent, trimming "excessive
accent color" while keeping the callout itself) → sources (now separated
by a `Hairline` between entries, still calm/quiet — organization name in
primary text, title in `brandPrimary`) → review date → disclaimer. The
48×48 decorative hero icon box at the top of every article was removed
entirely — no giant hero treatment, no decorative medical icon anywhere
on the screen.

## 8. Substantive Knowledge copy changes

**None.** No article title, summary, key point, section body, tip, source,
or review date was reworded. `KnowledgeArticle.icon` and the per-category
`icon` field in `categories.ts` were left in the type/content files
completely untouched (still valid, still typed) — they are simply no
longer rendered by either screen. This was a deliberate choice over
deleting the field from the large content files: presentation changed
first, per brief §8's own instruction, with zero risk to the reviewed
medical corpus.

## 9. Local-first / privacy wording

The existing `profile.privacyBody`/`profile.privacyBackup` pair was
already precise and was kept as-is in substance — "stored on this device
only... Nothing is sent to a server" is immediately paired with the
existing, honest backup caveat ("Your device's own backup, like iCloud,
may include this data, the same way it backs up any other app"),
already avoiding the "never leaves your device" absolutism brief §11
warns against. The **only** change was the stale brand name
("Ankilozanapp" → "Ilium") in both `privacyBody` and `disclaimerBody`,
plus the same fix applied to `notifications.defaultTitle` (the fallback
push-notification title, a presentation string, not notification policy)
for consistency across the whole app now that Ilium is the established
user-facing brand everywhere else (Welcome, Paywall, About).

## 10. Subscription placement

**No Subscription section was added to Profile.** Investigated
carefully (brief §12's "if applicable"): `useEntitlement()`
(`EntitlementContextValue`) exposes only a boolean-shaped status
(`unknown`/`loading`/`entitled`/`not_entitled`/`error`) and `restore()` —
no active-plan identifier, no renewal date, no price is tracked anywhere
in the entitlement/purchase layer. Combined with the fact that
`RouteGate` only allows an entitled user to reach Profile at all (a
not-entitled user is routed to onboarding/paywall before any tab,
including the header's Profile button, is reachable), a "Subscription"
row in Profile would be permanently, tautologically "active" — not a
real status a user could act on — and Restore's real use case (a user
who lost entitlement) is already fully served by the paywall's own
Restore action, which that user would in fact see. Adding a section here
would be inventing UI for data that doesn't exist, which brief §2
explicitly forbids ("Do not invent new settings merely to fill the
page"). Flagged as a deliberate, documented omission, not an oversight —
see §20 for the deferred product-policy note.

## 11. Reminders/settings presentation

`reminder-settings.tsx`: `GroupedList` → boxless `Section`, no other
change — still the same read-only reference view of the three approved
per-category reminder defaults (medication/injection/appointment), still
pointing users to each item's own form for the actual value, still a
permission-status check that never requests permission. `notification-privacy.tsx`
untouched (already boxless, already just one `ToggleRow` + explanatory
text).

## 12. Language behavior

Preserved exactly: a real, working in-app selector (System / English /
Türkçe) via `useProfile().setLanguageOverride`, backed by
`userPreferences.languageOverride` in the repository layer (unchanged).
Only the container changed (`GroupedList` → boxless `Section`); the
checkmark-based non-color-only selected state (already present) is
unchanged, just repointed from the legacy `colors.accent` alias to
`colors.brandPrimary` for consistency with new-code convention (no visual
difference — both resolve to the same token value).

## 13. Appearance behavior

**No appearance/theme setting exists anywhere in the app**, and none was
added. Dark mode follows the OS automatically via `useTheme` (verified
against its own doc comment: `Platform.OS === "web"` forces light mode in
the web preview only; native honors `systemScheme` with no in-app
override anywhere). Per brief §15's explicit instruction ("If appearance
follows system and there is no setting: do NOT add one"), Design-H adds
nothing here — documented as current, unchanged behavior.

## 14. Delete-account presentation

Completely unchanged: `useDeleteAllData`, the explicit
acknowledge-then-confirm flow (`ToggleRow` gate + disabled destructive
`Button` until acknowledged + a separate Cancel button), the exact
confirmation copy, and the post-delete `router.replace("/onboarding/welcome")`
routing. Live-verified up to the safe confirmation boundary (toggle left
off, no delete performed). No health-data export was added — brief §16's
explicit "no fake 'download my data' placeholder" instruction is
satisfied by removing the old placeholder entirely (§3) rather than
building a real export feature, which was out of scope.

## 15. Legal/about presentation

**New**: a "Terms" row was added to Profile's About section, opening
Apple's Standard EULA via the same `APPLE_EULA_URL` constant the paywall
already uses (`src/purchases/config.ts`, read-only import — the constant
itself was not touched). This gives Profile the "stable long-term access
point" brief §17 asks for, without duplicating the paywall's own Terms
action (a different screen, same real destination). **Privacy** was
deliberately **not** duplicated as a separate About-row — the existing,
richer "Privacy & data" entry (under Support) already serves that role
with real, specific content (`/profile/privacy-data`), matching brief
§17's "do not duplicate legal links excessively." "About" (app
name/version/tagline) and "Medical information" (the existing
disclaimer, unchanged) round out the group. Version display (`Constants.expoConfig?.version`)
is unchanged and remains the only "technical" data shown — no bundle ID,
no environment dump (brief §18).

## 16. Nutrition/Breathing final placement

**Unchanged — already correct.** Both already live exclusively in Health
Record's own subordinate "Daily support" section
(`app/(tabs)/track.tsx`, untouched in this phase per the brief's own
scope boundary). Design-H did not move or duplicate them into
Profile/Knowledge; the brief's own instruction ("Do NOT duplicate them in
multiple locations just to increase discoverability") is satisfied by
leaving them exactly where Design-E already placed them.

## 17. Navigation-cleanup result

Full visible-IA audit performed:

- Primary tabs confirmed unchanged and correct: Today / Health Record /
  Appointments (`app/(tabs)/_layout.tsx`, `href: null` on the Insights
  tab entry, untouched).
- Grep of every navigation pattern (`router.push`/`.replace`/`<Link>`/
  `href=`) across `app/` and `src/` found zero stale references to any
  removed Design-C onboarding route, and zero reference to Knowledge from
  `track.tsx` (confirmed already absent, per Design-E's own doc comment
  flagging this exact question as a "Design-H task").
- Two genuinely stale, unreferenced translation keys were found and
  removed: `tabs.track` ("Track") and `tabs.insights` ("Insights") — both
  leftover from before Design-B's tab relabeling, confirmed via grep to
  have zero live consumers (the actual tab labels have used
  `tabs.healthRecord`/`tabs.today`/`tabs.appointments` since Design-B).

## 18. Card/container reduction

Zero `GroupedList` usage remaining in any file touched this phase —
Profile's index, Language, Reminder Settings, both Knowledge screens all
now use boxless `Section`/plain rows. `Button variant="destructive"` (a
real button, not a card) is the only bordered/filled element introduced.

## 19. Icon reduction

Profile: icons kept on 4 of ~10 rows (the ones brief §10 explicitly names
as candidates). Knowledge landing: all category/article leading icons
removed — identity comes from title/summary/read-time typography alone.
Article detail: the hero icon box and the per-key-point checkmark icons
were both removed.

## 20. EN/TR decisions

All copy changes authored natively in both languages. Parity re-verified
after every edit (492 keys, identical set both languages, down from 496
— 5 orphaned keys deleted, 1 new group key added). The brand-name fix
(Ankilozanapp → Ilium) was applied consistently across `profile.privacyBody`,
`profile.disclaimerBody`, and `notifications.defaultTitle` in both
locales — never a partial fix in only one language.

## 21. Accessibility

- All settings rows remain `ListRow`'s existing 44pt-minimum pattern;
  `Button variant="destructive"` and the delete-confirmation `ToggleRow`
  are unchanged, already-verified accessible controls.
- Knowledge's source links keep their existing `accessibilityRole="link"`
  + full descriptive `accessibilityLabel` (organization + title).
- Long Turkish article titles confirmed wrapping correctly with no
  clipping at 390×844 (live-verified on "Aksiyel spondiloartrit ile AS
  arasındaki ilişki").
- No color-alone state anywhere: Language's selected-state checkmark is
  unchanged (icon + implicit bold-adjacent styling, not color alone);
  destructive actions use `variant="destructive"` (red text) but are
  never the sole way to identify them — label text always says
  "Delete"/"Sil" explicitly.

## 22. Dark mode

Design-B semantic tokens only — no custom hex values introduced anywhere
in this phase's changes (every color reference in the diff is a
`colors.*` token, verified by direct code review of every changed file).
**Native dark-mode live QA was not performed**, the same pre-existing
constraint recorded in every prior design phase (`useTheme` forces light
mode on web).

## 23. Live QA performed

Chrome web preview, 390×844, Turkish, `?entitlement=entitled`:

- **A. Profile default** — confirmed the full 4-section hierarchy
  (Preferences/Reminders/Support/About), correct row grammar, no card
  stacking.
- **C/D/E. Knowledge landing / category / article detail** — confirmed
  the editorial index (Başlangıç + 5 category sections), no icon-boxed
  hero, key points as plain dashes, sections/sources/disclaimer all
  rendering correctly.
- **F. Long Turkish article title** — confirmed no clipping.
- **K. Delete-account path** — confirmed up to the safe confirmation
  boundary (question, factual explanation, disabled destructive button
  until acknowledged, Cancel available) — **no data was actually
  deleted**.
- **L. Profile entry from Today** — confirmed the header gear icon
  navigates to `/profile` correctly, doesn't compete with Today's
  primary action.
- **M. Knowledge route from the final Profile home** — confirmed
  `Profile → Support → "Ankilozanı Anla"` navigates to `/knowledge`
  correctly.
- **N. No dead old Knowledge entry in Health Record** — confirmed via
  direct source read of `track.tsx` (untouched, unchanged from
  Design-E — no Knowledge row exists there).
- **O. Primary tabs** — confirmed Today / Health Record / Appointments,
  no "Track"/"Insights" tab visible anywhere.
- **About screen (Wordmark fix)** — confirmed "Ilium" wordmark replaces
  the stale "Ankilozanapp" text, version and tagline both render
  correctly.

No settings-menu sprawl, no card stack, Knowledge reads as a reference
library (not a content app), article reading is comfortable, no stale
visible "Track," no dead routes, legal (Terms) link wired to the correct
real destination, destructive actions remain clear. **430×932 and
English-locale live QA were not separately re-screenshotted this pass**
beyond what Design-C/E/F/G already established as safe patterns
(identical component vocabulary, same known web-preview tooling
limitation for English) — flagged honestly rather than claimed.

## 24. Visual self-critique (brief §27)

1. **Does Profile still look like generic iOS Settings?** No — a
   deliberate, varied hierarchy with selective icon use, boxless
   sections, and the same Paper & Ink typography as the rest of the app,
   not a uniform Settings.app clone.
2. **Is there too much icon/chevron repetition?** No — icons appear on
   only 4 of roughly 10 rows; chevrons remain (the standard navigational
   affordance) but no longer pair with a decorative icon on every row.
3. **Is Knowledge clearly subordinate to the core health record?** Yes —
   two taps from Today (Profile → Support → Knowledge), absent from
   Health Record's own hierarchy, no tab.
4. **Does Knowledge feel like a reference library rather than a content
   app?** Yes — editorial category headings, restrained rows, no
   icon-card grid, a document-composed article detail.
5. **Does Profile stay visually connected to Today/Timeline/
   Appointments?** Yes — the same `Section`/`Hairline`/`ListRow`
   vocabulary and Paper & Ink tokens throughout.
6. **Are destructive/account controls clear without dominating the
   page?** Yes — one real destructive `Button` on its own subpage, not a
   giant warning card on the main index.
7. **Is local-first/privacy wording precise rather than
   marketing-heavy?** Yes — the existing, already-honest device-only +
   backup-caveat pairing was kept verbatim; only the stale brand name was
   fixed.
8. **With logo hidden, does Profile still feel like the same product?**
   Yes — hairline-separated boxless sections, the same typography scale,
   and the same terracotta `brandPrimary` accent used everywhere else in
   the app.

All 8 answers came back strong on first review — nothing required a
second refinement pass.

## 25. Tests

No new tests were added. This phase introduced zero new pure
business-logic functions — it is IA reorganization and presentation
changes over already-existing, already-tested behavior
(`useProfile`, `useDeleteAllData`, `useKnowledgeArticles`/`useKnowledgeArticle`,
all untouched). The project has no component-rendering test library
(`@testing-library/react-native` is not a dependency), so the
established, sole testing pattern here is unit-testing extracted pure
presenter functions — and none were extracted or changed this phase.
The specific checks brief §29 asks for were instead verified by: a
repo-wide grep audit (Knowledge's absence from Health Record, zero stale
route references), live QA (the final route is reachable, primary tab
labels are correct, destructive actions render unchanged, settings state
presentation is correct), and the existing `i18n.test.ts` suite
(localization parity, already run as part of the full suite). Padding
this phase with tests that only re-assert static JSX would not have
caught anything the above didn't already verify.

## 26. Files changed

`app/profile/index.tsx` (rewritten), `app/profile/about.tsx` (Wordmark
fix), `app/profile/privacy-data.tsx` (placeholder row removed),
`app/profile/language.tsx` (container only), `app/profile/reminder-settings.tsx`
(container only), `app/knowledge/index.tsx` (rewritten),
`app/knowledge/[id].tsx` (rewritten), `src/localization/translations/en.json`/`tr.json`.
`app/profile/delete-data.tsx`, `app/profile/disclaimer.tsx`,
`app/profile/notification-privacy.tsx`, `src/features/profile/useProfile.ts`,
`src/features/knowledge/*`, and `app/(tabs)/track.tsx` were all read but
deliberately **not** modified.

## 27. Deferred / product-policy questions

- **Subscription status/management in Profile** — investigated and
  deliberately not added (§10). If a future phase wants this, the
  entitlement layer would first need to track which package was
  purchased and when it renews — currently not stored anywhere — which
  is a purchases-domain change outside this phase's scope and the deny
  list.
- **A public Privacy Policy URL** — still `null` in `src/purchases/config.ts`
  (unchanged, pre-existing blocker recorded since Phase Q; not
  addressed here, since Design-H does not touch purchases config).
- **English-locale and native dark-mode live QA** — not completed this
  pass, the same pre-existing web-preview tooling limitations recorded
  in every prior design phase.
