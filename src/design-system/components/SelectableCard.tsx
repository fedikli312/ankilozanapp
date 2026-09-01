import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type SelectableCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  caption?: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * Product 2.0 Phase N — the one visual selection pattern reused across
 * Goals, Priority symptoms, and Treatment context (`docs/PRODUCT_2_0_UX_SPECIFICATION.md`
 * §5, "one consistent visual selection pattern"). Icon + short label +
 * optional one-line caption, selected state shown via border/fill AND an
 * explicit checkmark glyph — never color alone (UX Spec §O). Mirrors
 * `Chip`'s selected-state treatment (`surfaceHighlight` fill, accent
 * border) rather than inventing a new one — multiple simultaneously-
 * selected cards in a multi-select screen is the same established pattern
 * `Chip` already uses throughout the app (e.g. check-in's body-area chips).
 */
export function SelectableCard({ icon, label, caption, selected, onPress }: SelectableCardProps) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.standard,
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.borderHairline,
        backgroundColor: selected ? colors.surfaceHighlight : colors.surface,
      }}
    >
      <Ionicons name={icon} size={22} color={selected ? colors.accent : colors.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.body.fontSize,
            fontWeight: selected ? "600" : "400",
            color: selected ? colors.accent : colors.textPrimary,
          }}
        >
          {label}
        </Text>
        {caption ? (
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }}>
            {caption}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <Ionicons name="checkmark-circle" size={20} color={colors.accent} accessibilityElementsHidden />
      ) : null}
    </AccessibleTouchable>
  );
}
