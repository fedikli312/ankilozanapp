/**
 * Motion tokens — docs/VISUAL_DESIGN_SPECIFICATION.md §28-29, extended for
 * Design System 2.0 (Phase Design-B) with named roles matching
 * `docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §10's motion philosophy
 * ("quick, functional, confirmatory — never decorative, never
 * celebratory on symptom data"). Duration ranges in milliseconds;
 * consumers pick a concrete value within the named tier's range.
 * Reduced-motion handling lives in `useReducedMotion`
 * (src/design-system/useReducedMotion.ts) — when enabled, `standardTransition`/
 * `contentReveal` collapse to an instant change, never removed
 * information (status/progress stays expressed in text/icon regardless).
 * No screen-specific decorative animation is defined here — this is
 * shared vocabulary only (Design-B brief §23); a Today/Check-in-specific
 * motion moment is a later phase's decision, not this file's.
 *
 * `tier1Feedback`/`tier2Transition`/`tier3Moment` are kept at their
 * original keys (two existing consumers: `AccessibleTouchable`,
 * `BodyRegionMap`) — `quickFeedback`/`standardTransition`/`contentReveal`
 * are the same values under the names this phase's brief asks for; new
 * code should reach for the named roles.
 */
export const motion = {
  tier1Feedback: { minMs: 80, maxMs: 180 },
  tier2Transition: { minMs: 180, maxMs: 320 },
  tier3Moment: { minMs: 300, maxMs: 600 },

  /** A tap/selection registering — the numeral in a Check-in scale gaining weight, a Chip's checkmark appearing. Same range as `tier1Feedback`. */
  quickFeedback: { minMs: 80, maxMs: 180 },
  /** A range switch, a tab change, a section expanding — same range as `tier2Transition`. */
  standardTransition: { minMs: 180, maxMs: 320 },
  /** Timeline content settling into view, a completed-check-in state appearing — same range as `tier3Moment`. Never a celebratory/bouncy moment (Design-A2 §10) — a quiet settle, not a burst. */
  contentReveal: { minMs: 300, maxMs: 600 },

  /**
   * Art Direction 3.0 (`docs/VISUAL_ART_DIRECTION_3_0.md` §14) — five
   * semantic roles for the evolved visual system's own motion vocabulary.
   * These sit alongside, not instead of, the tiers above: `micro` and
   * `selection` are narrower slices of `tier1Feedback`'s existing range
   * (a press response needs to feel instant, not just "quick"),
   * `contentEnter` is a narrower slice of `tier2Transition` (an editorial
   * paragraph fading in wants less lag than a full section reveal), and
   * `surfaceTransition`/`heroEnter` reuse `tier2Transition`/`tier3Moment`
   * directly under names that read clearly at their call sites (a hero
   * illustration "entering" vs. generic "content reveal"). No new
   * duration philosophy — same quick/functional/never-celebratory rule,
   * same Reduce-Motion collapse-to-instant handling.
   */
  micro: { minMs: 100, maxMs: 140 },
  selection: { minMs: 140, maxMs: 200 },
  contentEnter: { minMs: 220, maxMs: 320 },
  surfaceTransition: { minMs: 180, maxMs: 320 },
  heroEnter: { minMs: 300, maxMs: 600 },
} as const;

export type MotionTokens = typeof motion;
