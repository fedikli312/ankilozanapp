/**
 * Depth system — Visual Craft Pass 3.1 (`docs/VISUAL_CRAFT_PASS_3_1.md` §14).
 *
 * Exactly three depth tiers, no deeper hierarchy:
 *
 *   Tier 0 — canvas          the screen ground (`colors.background`). Nothing.
 *   Tier 1 — atmospheric     tonal separation only: a step-off surface
 *                            token (`colors.surfaceSecondary` / `colors.selected`)
 *                            and/or deliberate overlap of shapes. NO shadow,
 *                            NO border required. This is the default way
 *                            Ilium separates a focal block from the page.
 *   Tier 2 — focal           the ONE allowed soft shadow, for a genuinely
 *                            interactive focal object that needs to lift off
 *                            its track (the Check-in slider thumb; a future
 *                            active bottom-sheet). Rare. Very soft, low
 *                            opacity, generous radius — never a hard
 *                            drop-shadow, never used to fake a card.
 *
 * `elevation.focal` is a plain RN style fragment (spread into a `style`
 * prop). The shadow color is intentionally a literal near-black, not a
 * theme token — a shadow is an optical effect, not a surface color, and on
 * the dark canvas it simply reads as nothing (tier-1 tonal separation
 * carries the weight there instead), which is the correct behaviour.
 */
export const elevation = {
  /** Tier 1 marker — there is no style to apply; separate with a surface token + overlap. Present so call sites can name the intent. */
  atmospheric: {} as const,

  /** Tier 2 — the one soft shadow. Tuned for small controls (≈24pt); a sheet can scale `shadowRadius`/`shadowOffset` up but keep the opacity. */
  focal: {
    shadowColor: "#0B0906",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  } as const,
} as const;

export type ElevationTokens = typeof elevation;
