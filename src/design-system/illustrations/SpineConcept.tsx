import { View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

import { useTheme } from "../useTheme";

export type SpineConceptProps = {
  width: number;
  height: number;
  /** Unlike `HeroBloom` (purely decorative), this illustration carries real supplementary meaning — pass a localized description; omit only when a visible caption right beneath it already covers the same ground for sighted users AND this instance is otherwise marked decorative by its container (e.g. the Knowledge landing's small thumbnail, which sits inside an `accessibilityElementsHidden` featured-card row). */
  accessibilityLabel?: string;
};

/**
 * Art Direction 3.0 (`docs/VISUAL_ART_DIRECTION_3_0.md` §8) — a
 * deliberately simplified, non-diagnostic concept illustration suggesting
 * the spine/pelvis region, with the sacroiliac area softly highlighted.
 * Built specifically for the "what is AS" Knowledge article, since that
 * article's own reviewed content already names this anatomy in prose —
 * this illustration adds no medical claim beyond what the article text
 * already says.
 *
 * This is intentionally NOT an anatomically precise diagram: a smooth
 * curved column and two soft ellipses, not real vertebra/bone geometry.
 * Every call site pairs this with a visible "simplified illustration, not
 * a diagnostic diagram" caption (`knowledge.illustrationCaption`) so it
 * can never be mistaken for real medical imagery, and carries a real
 * `accessibilityLabel` (the one illustration in this pass that isn't
 * purely decorative) rather than being hidden from screen readers.
 */
export function SpineConcept({ width, height, accessibilityLabel }: SpineConceptProps) {
  const { colors } = useTheme();
  const cx = width / 2;

  // The accessibility semantics live on a wrapping `View`, not on `<Svg>`
  // itself: `react-native-svg`'s web build forwards `accessible` straight
  // onto the DOM `<svg>` element, which React rejects as a non-boolean
  // attribute (a console error on web preview only — native is
  // unaffected). A labelled wrapper is the portable way to expose the one
  // illustration in this system that carries real supplementary meaning;
  // when there's no label the wrapper stays fully transparent to the
  // a11y tree so a decorative instance is skipped.
  const a11y = accessibilityLabel
    ? ({ accessible: true, accessibilityLabel, accessibilityRole: "image" as const })
    : ({ accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const });

  return (
    <View {...a11y}>
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* The spine — one smooth curved column, not individual vertebrae. */}
      <Path
        d={`M ${cx} ${height * 0.06}
            C ${cx + width * 0.09} ${height * 0.22}, ${cx - width * 0.09} ${height * 0.36}, ${cx} ${height * 0.52}
            C ${cx + width * 0.07} ${height * 0.62}, ${cx - width * 0.05} ${height * 0.7}, ${cx} ${height * 0.78}`}
        stroke={colors.textSecondary}
        strokeWidth={width * 0.05}
        strokeLinecap="round"
        fill="none"
      />

      {/* The pelvis — one soft wide shape, not literal bone structure. */}
      <Ellipse cx={cx} cy={height * 0.86} rx={width * 0.26} ry={height * 0.12} fill={colors.surfaceSecondary} stroke={colors.textSecondary} strokeWidth={2} />

      {/* Sacroiliac area — softly highlighted, brand accent only, never a severity color. */}
      <Circle cx={cx - width * 0.12} cy={height * 0.8} r={width * 0.075} fill={colors.brandPrimary} fillOpacity={0.28} />
      <Circle cx={cx + width * 0.12} cy={height * 0.8} r={width * 0.075} fill={colors.brandPrimary} fillOpacity={0.28} />
    </Svg>
    </View>
  );
}
