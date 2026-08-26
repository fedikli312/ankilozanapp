/**
 * Layout/accessibility constants — docs/VISUAL_DESIGN_SPECIFICATION.md §27.
 */
export const layout = {
  /** Minimum interactive touch target, in points, both dimensions. */
  minTouchTarget: 44,
} as const;

export type LayoutTokens = typeof layout;
