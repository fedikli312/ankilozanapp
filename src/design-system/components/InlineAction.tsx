import { Text } from "react-native";

import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type InlineActionProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  /** "brand" (default) — the one-reserved-action color, for a genuine action. "quiet" — secondary text color, for a low-emphasis navigational link (e.g. "View timeline"). */
  tone?: "brand" | "quiet";
};

/**
 * A plain text-styled tappable action — Design System 2.0's formalization
 * of the `AccessibleTouchable` + `Text` pattern already hand-rolled at
 * dozens of call sites (Today's "View entry", Appointment Summary's "View
 * timeline", the Paywall's Restore/Terms/Privacy row). Never a bordered/
 * filled button — for that, use `Button`'s `quiet` variant if a real
 * touch-target-sized button is needed; `InlineAction` is for a link-style
 * action sitting inline with other text.
 */
export function InlineAction({ label, onPress, accessibilityLabel, tone = "brand" }: InlineActionProps) {
  const { colors, typography } = useTheme();

  return (
    <AccessibleTouchable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}>
      <Text style={{ fontSize: typography.caption.fontSize, color: tone === "brand" ? colors.brandPrimary : colors.textSecondary }}>
        {label}
      </Text>
    </AccessibleTouchable>
  );
}
