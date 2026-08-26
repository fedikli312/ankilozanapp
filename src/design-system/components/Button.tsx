import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type ButtonVariant = "primary" | "secondary" | "destructive";

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
};

/** Visual Design Spec §10 — one clear primary action per screen, no gradients/shadows/bounce. */
export function Button({ label, onPress, variant = "primary", disabled, loading }: ButtonProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor = variant === "primary" ? colors.accent : "transparent";
  const textColor =
    variant === "primary"
      ? colors.accentForeground
      : variant === "destructive"
        ? colors.statusDanger
        : colors.accent;

  return (
    <AccessibleTouchable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        {
          backgroundColor,
          borderRadius: radius.small,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          opacity: isDisabled ? 0.4 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize: typography.body.fontSize,
            fontWeight: variant === "primary" ? "600" : "400",
          }}
        >
          {label}
        </Text>
      )}
    </AccessibleTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});
