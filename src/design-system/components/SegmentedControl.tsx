import { Text, View } from "react-native";

import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Announced once for the whole control (e.g. "Recording window") — individual segments are announced by their own label + selected state. */
  accessibilityLabel?: string;
};

/**
 * Design System 2.0, Phase Design-F §13 — the deferred segmented-control
 * primitive, implemented now for Appointment Summary's 30/90-day range
 * picker. A single mutually-exclusive range/mode picker, deliberately
 * distinct from `Chip` (independent filter/multi-select pills) — brief:
 * "not pill soup." One continuous bordered track; segments sit edge-to-edge
 * inside it with no individual pill outlines, so it reads as one control
 * choosing between states, not a row of separate buttons.
 *
 * Selected state is never color-only: the selected segment gets a filled
 * `brandPrimary` background AND bold text weight, on top of the
 * unselected segments' plain/regular weight — a real shape/weight change,
 * not hue alone. Every segment inherits `AccessibleTouchable`'s 44pt
 * floor untouched (no `minHeight` override here), and `flex: 1` splits
 * the track evenly regardless of label length, so long Turkish labels
 * don't force uneven segment widths.
 */
export function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel }: SegmentedControlProps<T>) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: "row",
        borderWidth: 1,
        borderColor: colors.hairline,
        borderRadius: radius.standard,
        backgroundColor: colors.surfaceSecondary,
        padding: 3,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <AccessibleTouchable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radius.standard - 3,
              paddingHorizontal: spacing.xs,
              backgroundColor: selected ? colors.brandPrimary : "transparent",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: typography.callout.fontSize,
                fontWeight: selected ? "700" : "400",
                color: selected ? colors.accentForeground : colors.textSecondary,
              }}
            >
              {option.label}
            </Text>
          </AccessibleTouchable>
        );
      })}
    </View>
  );
}
