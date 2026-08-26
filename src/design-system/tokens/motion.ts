/**
 * Motion tokens — docs/VISUAL_DESIGN_SPECIFICATION.md §28-29.
 * Duration ranges in milliseconds; consumers pick a concrete value within
 * the named tier's range. Reduced-motion handling lives in
 * `useReducedMotion` (src/design-system/useReducedMotion.ts) — when enabled,
 * Tier 2/3 transitions collapse to an instant change, never removed
 * information (status/progress stays expressed in text/icon regardless).
 */
export const motion = {
  tier1Feedback: { minMs: 80, maxMs: 180 },
  tier2Transition: { minMs: 180, maxMs: 320 },
  tier3Moment: { minMs: 300, maxMs: 600 },
} as const;

export type MotionTokens = typeof motion;
