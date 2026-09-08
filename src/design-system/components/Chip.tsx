import { Text } from "react-native";

import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * Multi-select / filter pill (Visual Design Spec §12; token vocabulary
 * updated for Design System 2.0, Phase Design-B §12) — outline by default,
 * `selected` fill + brand border when active, always paired with a
 * checkmark glyph on selection (never color alone).
 *
 * Design-B audit notes (no role/behavior change, verified rather than
 * redesigned):
 * - **44pt touch target**: `AccessibleTouchable` enforces `minHeight: 44`
 *   as its base style, applied before this component's own style object —
 *   Yoga/CSS layout clamps computed height to at least that floor even
 *   though the visual pill itself sits at ~36-40pt of padding, so the
 *   real target is already 44pt. Previously this depended on a hardcoded
 *   `height: 36` + `pillRadius(height)` pairing, which fixed the box at
 *   an exact height and would not grow for a wrapped long-TR label at
 *   large Dynamic Type sizes. Changed to `minHeight` + a large fixed
 *   `borderRadius` (always fully rounded regardless of actual height) so
 *   the pill can grow with content instead of clipping it.
 * - **Non-color-only selection**: the checkmark glyph (already present)
 *   plus the border-color change are the real signal; fill/text color are
 *   reinforcement only. Unchanged.
 * - **Dynamic Type / long TR strings**: an initial pass removing the fixed
 *   `height: 36` was believed to let a long label wrap, but live QA (the
 *   showcase route's deliberately-long-TR-label stress case) showed it
 *   instead overflowing the pill's own width off the edge of the screen —
 *   in a `flexWrap: "wrap"` row of chips, a single item has nothing to
 *   shrink against until `flexShrink` is set explicitly, so an unwrapped
 *   `Text` just grows the pill arbitrarily wide instead of wrapping.
 *   Fixed by giving the pill `flexShrink: 1` (so it can be constrained by
 *   its row) and the label `Text` `flexShrink: 1` + `flexWrap: "wrap"`
 *   (so once constrained, it wraps rather than clips). Real chip content
 *   (a short body-area/symptom name) is unaffected either way; this only
 *   changes behavior for content already outside the intended use.
 */
export function Chip({ label, selected, onPress }: ChipProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        minHeight: 44,
        borderRadius: 999,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 1,
        borderWidth: 1,
        borderColor: selected ? colors.brandPrimary : colors.hairline,
        backgroundColor: selected ? colors.selected : "transparent",
      }}
    >
      {selected ? (
        <Text style={{ color: colors.brandPrimary, marginRight: 4 }} accessibilityElementsHidden>
          {"✓"}
        </Text>
      ) : null}
      <Text
        style={{
          fontSize: typography.body.fontSize,
          color: selected ? colors.brandPrimary : colors.textPrimary,
          flexShrink: 1,
          flexWrap: "wrap",
        }}
      >
        {label}
      </Text>
    </AccessibleTouchable>
  );
}
