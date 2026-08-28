import { Text, View } from "react-native";

import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type StepperFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** e.g. a zero-padded display like "08" for hours. */
  formatValue?: (value: number) => string;
};

/**
 * A discrete, accessibility-adjustable numeric control — the same
 * interaction language as the check-in stepped scale (Visual Design Spec
 * §12): always shows the numeric value as text, exposed as an
 * accessibility "adjustable" element, never a free-drag-only slider.
 */
export function StepperField({ label, value, min, max, onChange, formatValue }: StepperFieldProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const display = formatValue ? formatValue(value) : String(value);

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: 4 }}>
        {label}
      </Text>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: display }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment" && value < max) onChange(value + 1);
          if (event.nativeEvent.actionName === "decrement" && value > min) onChange(value - 1);
        }}
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <AccessibleTouchable
          onPress={() => value > min && onChange(value - 1)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            backgroundColor: colors.borderHairline,
            borderRadius: radius.small,
            paddingHorizontal: spacing.sm,
          }}
        >
          <Text style={{ fontSize: typography.headline.fontSize, color: colors.accent }}>{"–"}</Text>
        </AccessibleTouchable>
        <Text
          style={{
            fontSize: typography.headline.fontSize,
            color: colors.textPrimary,
            marginHorizontal: spacing.md,
            minWidth: 40,
            textAlign: "center",
          }}
        >
          {display}
        </Text>
        <AccessibleTouchable
          onPress={() => value < max && onChange(value + 1)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            backgroundColor: colors.borderHairline,
            borderRadius: radius.small,
            paddingHorizontal: spacing.sm,
          }}
        >
          <Text style={{ fontSize: typography.headline.fontSize, color: colors.accent }}>{"+"}</Text>
        </AccessibleTouchable>
      </View>
    </View>
  );
}
