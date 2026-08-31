/**
 * Color tokens — docs/REDESIGN_SPECIFICATION.md §2.2 (supersedes the
 * original VISUAL_DESIGN_SPECIFICATION.md §2-5 warm-cream/muted-teal
 * palette as of the 2026-08-31 redesign approval).
 *
 * Three light-mode surface concepts, semantically distinct:
 *   backgroundWarm    — the overall screen canvas.
 *   surface            — true/near-white elevated content (cards, grouped
 *                         sections that need to read as "important container").
 *   surfaceSecondary   — light neutral gray for secondary grouped controls
 *                         (segmented-control track, input fill).
 *   surfaceHighlight   — pale mint, reserved for the ONE highlighted element
 *                         per screen (spec §2.2) — never a general card fill.
 *
 * `accentOnDark` was dropped: the redesign's accent value is identical
 * whether used as a fill or as foreground-on-background in both light and
 * dark mode, so the old fill/foreground split token has no purpose here
 * (it also had zero consumers under the previous palette).
 *
 * Status colors are reserved for their named purpose only — never used to
 * color-code symptom severity or medical values (spec §2.3).
 */

export type ColorTokens = {
  backgroundWarm: string;
  surface: string;
  surfaceSecondary: string;
  surfaceHighlight: string;
  textPrimary: string;
  textSecondary: string;
  borderHairline: string;
  accent: string;
  accentForeground: string;
  statusSuccess: string;
  statusWarning: string;
  statusDanger: string;
  statusNeutral: string;
};

export const lightColors: ColorTokens = {
  backgroundWarm: "#FBFAF8",
  surface: "#FFFFFF",
  surfaceSecondary: "#F5F4F1",
  surfaceHighlight: "#E8F5EF",
  textPrimary: "#1C1C1E",
  textSecondary: "#6E6E73",
  borderHairline: "#E5E3DF",
  accent: "#0A8F68",
  accentForeground: "#FFFFFF",
  statusSuccess: "#0A8F68",
  statusWarning: "#B7791F",
  statusDanger: "#C0392B",
  statusNeutral: "#8E8E93",
};

export const darkColors: ColorTokens = {
  backgroundWarm: "#1C1E1F",
  surface: "#202223",
  surfaceSecondary: "#232527",
  surfaceHighlight: "#16332A",
  textPrimary: "#F2F2F2",
  textSecondary: "#98999B",
  borderHairline: "#303233",
  accent: "#34C28C",
  accentForeground: "#0A2A1E",
  statusSuccess: "#34C28C",
  statusWarning: "#D9A441",
  statusDanger: "#E0685A",
  statusNeutral: "#8E8E93",
};
