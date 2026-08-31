/**
 * Spacing tokens — docs/REDESIGN_SPECIFICATION.md §2.5 (extends the
 * original VISUAL_DESIGN_SPECIFICATION.md §7 scale with `xxs` (4) and
 * `lgTight` (20) as of the 2026-08-31 redesign approval).
 * 4-point base; 4/8/12/16/20/24/32 are the approved standard increments.
 */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lgTight: 20,
  lg: 24,
  xl: 32,
} as const;

export type SpacingTokens = typeof spacing;
