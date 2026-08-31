/**
 * Corner-radius tokens — docs/VISUAL_DESIGN_SPECIFICATION.md §8, unchanged
 * by the redesign (docs/REDESIGN_SPECIFICATION.md §2.5 calls for 14-18pt
 * card radius — `standard` (16) already sits inside that range).
 * Intentionally small/restrained scale. `pill` is computed per-control from
 * its own height (height / 2), not a fixed number.
 */
export const radius = {
  small: 12,
  standard: 16,
  large: 20,
} as const;

/** Rounds only the top corners — sheets/modals (spec §8, §17). */
export const sheetTopRadius = {
  borderTopLeftRadius: radius.large,
  borderTopRightRadius: radius.large,
} as const;

/** Fully-rounded pill radius for a control of the given height. */
export function pillRadius(height: number): number {
  return height / 2;
}

export type RadiusTokens = typeof radius;
