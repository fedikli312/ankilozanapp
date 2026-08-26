/**
 * Spacing tokens — docs/VISUAL_DESIGN_SPECIFICATION.md §7.
 * 4-point base; 8/12/16/24/32 are the approved standard increments.
 */
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export type SpacingTokens = typeof spacing;
