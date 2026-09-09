import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type OptionRowProps = {
  label: string;
  caption?: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

/**
 * Design-C's boxless selection row — large text, no icon, no card frame
 * (Phase Design-C brief §4: "retire repeated onboarding templates...
 * avoid card-per-option where not needed"). Meant to sit inside a `Section`
 * (no title), which supplies the hairline between rows automatically.
 * Selected state pairs weight (400→700) and color (`textPrimary`→
 * `brandPrimary`) with an explicit checkmark glyph — never color alone,
 * the same non-color-only convention every other selection control in this
 * app follows (`Chip`, `SegmentedControl`, `SelectableCard`).
 *
 * Distinct from `SelectableCard` (icon + bordered card, the onboarding-wide
 * template Design-C replaces) and from `Chip` (compact pill, still used for
 * Body Regions' fast multi-select). `OptionRow` is for a short vertical
 * list of substantial text choices — Goals, Priority Symptoms, Treatment
 * Context.
 */
export function OptionRow({ label, caption, selected, onPress, accessibilityLabel }: OptionRowProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
        paddingVertical: spacing.sm,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.headline.fontSize,
            fontWeight: selected ? "700" : "400",
            color: selected ? colors.brandPrimary : colors.textPrimary,
          }}
        >
          {label}
        </Text>
        {caption ? (
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }}>{caption}</Text>
        ) : null}
      </View>
      {selected ? <Ionicons name="checkmark" size={20} color={colors.brandPrimary} accessibilityElementsHidden /> : null}
    </AccessibleTouchable>
  );
}
