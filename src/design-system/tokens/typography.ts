/**
 * Typography tokens — docs/VISUAL_DESIGN_SPECIFICATION.md §6.
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
  title: { fontSize: 28, lineHeight: 34, fontWeight: "600" },
  headline: { fontSize: 20, lineHeight: 25, fontWeight: "600" },
  body: { fontSize: 17, lineHeight: 22, fontWeight: "400" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
} satisfies Record<string, TypographyToken>;

export type TypographyTokens = typeof typography;
