import { Text } from "react-native";

import { pillRadius } from "../tokens/radius";
import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * Visual Design Spec §12 — outline by default, `surface.highlight` fill +
 * accent border when selected, always paired with a checkmark glyph on
 * selection (never color alone).
 */
export function Chip({ label, selected, onPress }: ChipProps) {
  const { colors, typography, spacing } = useTheme();
  const height = 36;

  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        height,
        borderRadius: pillRadius(height),
        paddingHorizontal: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.borderHairline,
        backgroundColor: selected ? colors.surfaceHighlight : "transparent",
      }}
    >
      {selected ? (
        <Text style={{ color: colors.accent, marginRight: 4 }} accessibilityElementsHidden>
          {"✓"}
        </Text>
      ) : null}
      <Text
        style={{
          fontSize: typography.body.fontSize,
          color: selected ? colors.accent : colors.textPrimary,
        }}
      >
        {label}
      </Text>
    </AccessibleTouchable>
  );
}
