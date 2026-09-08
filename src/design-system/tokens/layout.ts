import { spacing } from "./spacing";

/**
 * Layout/accessibility constants — extended for Design System 2.0
 * (Phase Design-B) with named screen-composition rules built from the
 * existing spacing scale (`docs/DESIGN_DIRECTION_2_0.md` §7's "layout
 * philosophy" made concrete). These are RULES, not new raw values — every
 * one below is one of the existing `spacing` tokens, given a semantic
 * name so a screen author reaches for "the horizontal page margin" rather
 * than picking a spacing value from memory each time. `minTouchTarget` is
 * unchanged from Product 2.0.
 */
export const layout = {
  /** Minimum interactive touch target, in points, both dimensions. */
  minTouchTarget: 44,
  /** Left/right screen margin — `ScreenContainer`'s own padding already uses this; named here so other layout math (e.g. a full-bleed Timeline rail) can align to the same edge without duplicating the number. */
  pageMargin: spacing.lg,
  /** Vertical gap between distinct sections on a screen (e.g. between the check-in module and the treatment row below it). */
  sectionSpacing: spacing.xl,
  /** Vertical gap between rows inside one section/list. */
  rowSpacing: spacing.sm,
  /** Gap around a metric's own label/value/context cluster. */
  metricSpacing: spacing.xs,
  /** The default "breathing room" between unrelated inline elements (an icon and its label, a value and its unit) — smaller than rowSpacing, deliberately tight. */
  contentRhythm: spacing.xxs,
  /** Extra bottom clearance so content never sits flush against the tab bar/home indicator — added on top of `SafeAreaView`'s own inset, not a replacement for it. */
  bottomClearance: spacing.xl,
} as const;

export type LayoutTokens = typeof layout;
