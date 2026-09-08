import Svg, { Path } from "react-native-svg";

import { useTheme } from "../useTheme";

export type MarginMarkProps = {
  /** Rendered square size, in points. Defaults to a comfortable inline size next to the wordmark. */
  size?: number;
  /**
   * Two-tone rendering (the bracket in `brandPrimary`, the tick in
   * `accentRare`) — reserved for larger, marketing-scale contexts (About/
   * Welcome hero placement, a future full-resolution app-icon export). At
   * small/production icon sizes the mark is deliberately single-color
   * (both strokes in `brandPrimary`) — Design-A2's own stress test found
   * that a mark's differentiating DETAIL (not its color count) is what
   * survives reduction; a flat single color is the safer, more robust
   * default everywhere the mark actually has to work small.
   */
  accented?: boolean;
  /** Override the stroke color entirely (e.g. `accentForeground` when the mark sits on a filled `brandPrimary` surface). Takes precedence over `accented`. */
  color?: string;
};

/**
 * "The Margin Mark" — the approved logo concept (Phase Design-A2 stress
 * test, `docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §4/§12): an editorial/
 * print-derived device — a simple corner bracket (the kind a margin
 * annotation or a journal's own dateline stamp might use) with a short,
 * separate tick mark sitting in the space it defines, representing the
 * annotation itself. Deliberately non-anatomical, deliberately NOT a
 * single continuous stroke (the disqualifying flaw found in the earlier
 * "Held Line" concept — a texture/shape that vanishes at small size) —
 * this mark's two simple, distinct strokes remain legible at true icon
 * scale because neither depends on fine internal detail.
 *
 * Explicitly checked against every failure mode Design-A2 named: the
 * bracket-plus-separate-tick geometry does not close into a ring, does
 * not read as a checkmark/swoosh (no continuous S-curve), does not read
 * as a smile (no single upward arc), and the tick sits clear of the
 * bracket's corner rather than crossing it, so it never reads as a plus/
 * cross at reduced size.
 *
 * Built with `react-native-svg` (already a project dependency via
 * `BodyRegionMap.tsx` — no new dependency added for the logo, per the
 * brief's own explicit instruction).
 */
export function MarginMark({ size = 24, accented = false, color }: MarginMarkProps) {
  const { colors } = useTheme();
  const bracketColor = color ?? colors.brandPrimary;
  const tickColor = color ?? (accented ? colors.accentRare : colors.brandPrimary);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 5 L7 17 L17 17" stroke={bracketColor} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.5 9.5 L15.5 9.5" stroke={tickColor} strokeWidth={2.25} strokeLinecap="round" />
    </Svg>
  );
}
