import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

/**
 * Design System 2.0 button variants (Phase Design-B §13):
 *   primary     — filled `brandPrimary`, one per screen at most. Unchanged
 *                 from Product 2.0's "primary" in spirit.
 *   secondary   — outlined `brandPrimary`, transparent fill. NEW — a real
 *                 secondary button with a visible boundary, distinct from
 *                 a plain text link.
 *   quiet       — transparent, no border, `brandPrimary` text. This is
 *                 what Product 2.0's own "secondary" variant actually
 *                 looked like (no border at all) — kept as its own named
 *                 role rather than removed, since existing call sites
 *                 that want a plain-text-styled button (not a full
 *                 `InlineAction`, e.g. because they need the same
 *                 touch-target sizing as other buttons in a row) still
 *                 have a home for it.
 *   destructive — unchanged: transparent, `critical`-colored text.
 *
 * `"secondary"` is kept as the exported variant NAME for backward
 * compatibility (existing call sites pass `variant="secondary"`), but its
 * VISUAL TREATMENT changes from Product 2.0's borderless text style to a
 * real outlined button — a deliberate, small, cosmetic ripple into
 * existing screens, explicitly allowed by `docs/DESIGN_REDESIGN_PLAN_2_0.md`
 * §26 ("small mechanical changes caused by shared components... are
 * okay"). Anything that specifically wants the old borderless-text look
 * should use `"quiet"` instead.
 */
export type ButtonVariant = "primary" | "secondary" | "quiet" | "destructive";

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
};

/** Visual Design Spec §10 — one clear primary action per screen, no gradients/shadows/bounce. Calm, not a giant rounded SaaS button. */
export function Button({ label, onPress, variant = "primary", disabled, loading }: ButtonProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor = variant === "primary" ? colors.brandPrimary : "transparent";
  const borderColor = variant === "secondary" ? colors.brandPrimary : "transparent";
  const textColor =
    variant === "primary"
      ? colors.accentForeground
      : variant === "destructive"
        ? colors.critical
        : colors.brandPrimary;

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
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor,
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
            fontSize: typography.button.fontSize,
            fontWeight: variant === "primary" || variant === "secondary" ? typography.button.fontWeight : "400",
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
