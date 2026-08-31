/**
 * Typography tokens — docs/REDESIGN_SPECIFICATION.md §2.4 (extends the
 * original VISUAL_DESIGN_SPECIFICATION.md §6 scale with a `metricLarge`
 * tier and a `micro` tier as of the 2026-08-31 redesign approval).
 *
 * System typography only (SF Pro via iOS Dynamic Type), no custom typeface.
 * `fontSize`/`lineHeight` are the approximate point sizes named in the spec;
 * actual OS-level Dynamic Type scaling is provided by React Native's default
 * font-scaling behavior (`allowFontScaling`), not reproduced here.
 */

export type TypographyToken = {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "600" | "700";
};

export const typography = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: "700" },
  metricLarge: { fontSize: 32, lineHeight: 38, fontWeight: "700" },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "600" },
  headline: { fontSize: 18, lineHeight: 23, fontWeight: "600" },
  body: { fontSize: 17, lineHeight: 22, fontWeight: "400" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  micro: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
} satisfies Record<string, TypographyToken>;

export type TypographyTokens = typeof typography;
