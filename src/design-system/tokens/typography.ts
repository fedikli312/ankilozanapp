/**
 * Typography tokens — Design System 2.0 (Phase Design-B), built on the
 * same system-typography foundation as before (SF Pro via iOS Dynamic
 * Type, no custom/bundled font — `docs/DESIGN_DIRECTION_2_0.md` §6's own
 * explicit decision, reaffirmed in `docs/DESIGN_DIRECTION_VALIDATION_2_0.md`
 * §6's serif rule: an editorial character is achieved with weight/
 * spacing/layout, never a bundled font). `fontSize`/`lineHeight` are the
 * approximate point sizes; OS-level Dynamic Type scaling is provided by
 * React Native's default font-scaling behavior (`allowFontScaling`), not
 * reproduced here.
 *
 * Every existing tier (`display`, `metricLarge`, `title`, `headline`,
 * `body`, `caption`, `micro`) is kept at its original key so the ~70
 * existing screens using `typography.title.fontSize` etc. keep working
 * unchanged — this file only ADDS the new named roles the Design-B brief
 * asks for, mapped onto the existing scale where a tier already fits
 * rather than duplicating it:
 *
 *   Display      → `display`     (unchanged)
 *   ScreenTitle  → `title`       (unchanged — kept at its original key)
 *   SectionTitle → `sectionTitle` (NEW — the uppercase small-caps style
 *                                  `SectionLabel` already hand-rolls,
 *                                  now a real, reusable token)
 *   Body         → `body`        (unchanged)
 *   Callout      → `callout`     (NEW — secondary emphasis, between body
 *                                  and caption)
 *   Caption      → `caption`     (unchanged)
 *   Metadata     → `metadata`    (NEW — tertiary text: dates, counts;
 *                                  same size as `micro`, kept as its own
 *                                  named role since "Metadata" is a
 *                                  distinct semantic use, not just "a
 *                                  smaller size")
 *   Button       → `button`      (NEW — button label weight/size)
 *   TabLabel     → `tabLabel`    (NEW — bottom-tab label size)
 *   MetricLarge  → `metricLarge` (unchanged — the hero-numeral tier)
 *   MetricMedium → `metricMedium` (NEW — secondary numerals, e.g. two
 *                                  side-by-side values on Appointment
 *                                  Summary)
 *   MetricSmall  → `metricSmall` (NEW — inline numerals, e.g. Timeline
 *                                  entries)
 *
 * `tabular` marks the tiers that MUST render with `fontVariant:
 * ["tabular-nums"]` wherever a real logged health value is shown — the
 * one deliberate typographic signature this system commits to (Design
 * Direction §6, Design Research §9/§12's "3 visual signatures").
 * Components rendering a numeral in one of these tiers are responsible
 * for applying `fontVariant`; this token only marks the intent so it
 * isn't left to per-screen judgment. `letterSpacing`/`textTransform`
 * cover `sectionTitle`'s uppercase-small-caps treatment so screens don't
 * hand-roll it (as `SectionLabel` currently does).
 */

export type TypographyToken = {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "600" | "700";
  /** Render with `fontVariant: ["tabular-nums"]` — every real logged health value uses a tabular tier. */
  tabular?: boolean;
  letterSpacing?: number;
  textTransform?: "uppercase";
};

export const typography = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: "700" },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "600" },
  sectionTitle: { fontSize: 13, lineHeight: 18, fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase" },
  headline: { fontSize: 18, lineHeight: 23, fontWeight: "600" },
  body: { fontSize: 17, lineHeight: 22, fontWeight: "400" },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  metadata: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
  micro: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
  button: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  tabLabel: { fontSize: 10, lineHeight: 13, fontWeight: "600" },
  /**
   * MetricDisplay — the hero-numeral tier, one confident step above
   * `metricLarge`. Added in the Visual Craft Pass 3.1 (`docs/VISUAL_CRAFT_PASS_3_1.md`
   * §15) for the one place a screen leads with a value the way a
   * consumer-health reference does: the paywall's example-record preview,
   * and available to Labs/Value-Reveal if a future pass wants it. The
   * companion unit (e.g. "/10") stays deliberately small — the number
   * carries the confidence, the unit whispers.
   */
  metricDisplay: { fontSize: 46, lineHeight: 50, fontWeight: "700", tabular: true },
  metricLarge: { fontSize: 32, lineHeight: 38, fontWeight: "700", tabular: true },
  metricMedium: { fontSize: 24, lineHeight: 29, fontWeight: "700", tabular: true },
  metricSmall: { fontSize: 17, lineHeight: 22, fontWeight: "600", tabular: true },
} satisfies Record<string, TypographyToken>;

export type TypographyTokens = typeof typography;
