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
 * explicit checkmark glyph — never color alone (UX Spec §O).
 *
 * **Selection-role note (Design System 2.0, Phase Design-B §12 audit):**
 * `SelectableCard` is the **form-selection** role — a full-width row-shaped
 * option in a vertical list (onboarding Goals, Priority symptoms), where
 * the icon and optional caption carry real meaning. `Chip` is the
 * **filter/multi-select-pill** role — compact, horizontally-flowing,
 * label-only (check-in's body-area/symptom chips). They intentionally
 * share the same selected-state grammar (border + fill + explicit
 * checkmark, never color alone) so the app has one selection language, not
 * two — but they are not interchangeable: a `SelectableCard` in a pill
 * flow would be too wide, and a `Chip` in a vertical options list would
 * lose the icon/caption a form choice often needs. Neither is a
 * "segmented control" (a single mutually-exclusive range picker, e.g. a
 * 30/90-day toggle) — that role has no shared component yet and should
 * not silently adopt this file's look without a real audit of its own.
 *
 * Token names updated to Design System 2.0 vocabulary; touch-target,
 * non-color-only, and Dynamic-Type behavior already satisfied `AccessibleTouchable`'s
 * 44pt floor and intrinsic (non-fixed-height) row layout — no layout
 * changes needed here, unlike `Chip`'s fixed-height fix.
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
        borderColor: selected ? colors.brandPrimary : colors.hairline,
        backgroundColor: selected ? colors.selected : colors.surfaceElevated,
      }}
    >
      <Ionicons name={icon} size={22} color={selected ? colors.brandPrimary : colors.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.body.fontSize,
            fontWeight: selected ? "600" : "400",
            color: selected ? colors.brandPrimary : colors.textPrimary,
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
        <Ionicons name="checkmark-circle" size={20} color={colors.brandPrimary} accessibilityElementsHidden />
      ) : null}
    </AccessibleTouchable>
  );
}
