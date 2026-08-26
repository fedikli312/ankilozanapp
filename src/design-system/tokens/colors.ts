/**
 * Color tokens — docs/VISUAL_DESIGN_SPECIFICATION.md §2-5.
 *
 * Exact values are a proposal pending a contrast-validation pass during
 * implementation (spec §"Remaining visual decisions"), not pixel-final.
 * Status colors are reserved for their named purpose only — never used to
 * color-code symptom severity (spec §3).
 */

export type ColorTokens = {
  background: string;
  surfaceHighlight: string;
  textPrimary: string;
  textSecondary: string;
  borderHairline: string;
  accent: string;
  accentForeground: string;
  accentOnDark: string;
  statusSuccess: string;
  statusWarning: string;
  statusDanger: string;
  statusNeutral: string;
};

export const lightColors: ColorTokens = {
  background: "#FAF7F2",
  surfaceHighlight: "#E8F0EE",
  textPrimary: "#2B2926",
  textSecondary: "#6B665F",
  borderHairline: "#E4DED3",
  accent: "#3D6B66",
  accentForeground: "#FAF7F2",
  accentOnDark: "#7FB5AC",
  statusSuccess: "#5C8A72",
  statusWarning: "#B8863A",
  statusDanger: "#A14B3D",
  statusNeutral: "#8A8478",
};

export const darkColors: ColorTokens = {
  background: "#1E1B18",
  surfaceHighlight: "#24302C",
  textPrimary: "#F3EEE6",
  textSecondary: "#B2A99C",
  borderHairline: "#3A352E",
  accent: "#3D8078",
  accentForeground: "#F3EEE6",
  accentOnDark: "#7FB5AC",
  statusSuccess: "#7FAE8E",
  statusWarning: "#D3A25E",
  statusDanger: "#C97362",
  statusNeutral: "#9C9284",
};
