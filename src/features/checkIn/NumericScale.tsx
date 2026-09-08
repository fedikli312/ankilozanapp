import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/design-system";

export type NumericScaleProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  anchorLow: string;
  anchorMid: string;
  anchorHigh: string;
  /** A short "this is your priority" indicator text, already localized — rendered next to the label only when set. */
  priorityIndicatorLabel?: string;
  /** VoiceOver value announcement, e.g. "Pain, 4 out of 10" — already localized/interpolated by the caller. */
  accessibilityValueLabel: string;
};

const UNSELECTED_SIZE = 44;
const SELECTED_SIZE = 50;

/**
 * Design System 2.0, Phase Design-D — the one shared 0-10 numeric
 * interaction Pain and Fatigue both compose (brief §10: "Pain / Stiffness
 * / Fatigue must feel like members of ONE interaction family... do not
 * visually redesign each metric independently"). Replaces the previous
 * `PainScale` dot-track and `FatigueSelector` ascending-bar-chart — two
 * different bespoke widgets for the same 0-10 integer shape — with one
 * component both now wrap.
 *
 * Layout: a live tabular-numeral readout of the current value, then every
 * integer 0-10 as its own directly-tappable cell, wrapped across two rows
 * rather than squeezed into eleven tiny targets on one line (brief §11's
 * explicit "two-row numeric composition" suggestion) — `flexWrap` handles
 * the row split automatically rather than a hardcoded 6/5 split, so it
 * adapts to both 390pt and 430pt widths without a special case. Every cell
 * is >=44pt (`UNSELECTED_SIZE`); the selected cell grows to `SELECTED_SIZE`
 * (50pt) — a real size/shape change, not a color-only signal, on top of
 * the fill-color change (brief §11/§26: "selected state not color-only").
 *
 * Accessibility: exposed as one `accessibilityRole="adjustable"` element
 * with increment/decrement actions (individual cells hidden from the
 * accessibility tree) — the same pattern already established by
 * `StepperField` and the components this replaces, kept for consistency
 * rather than inventing a second accessibility model for one control
 * family. No drag gesture anywhere — every value is a direct tap target,
 * safe for a hand with reduced grip/precision (brief §26).
 */
export function NumericScale({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  anchorLow,
  anchorMid,
  anchorHigh,
  priorityIndicatorLabel,
  accessibilityValueLabel,
}: NumericScaleProps) {
  const { colors, typography, spacing } = useTheme();
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs, marginBottom: spacing.xxs }}>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{label}</Text>
        {priorityIndicatorLabel ? (
          <Text style={{ fontSize: typography.micro.fontSize, color: colors.brandPrimary }}>· {priorityIndicatorLabel}</Text>
        ) : null}
      </View>

      <Text
        style={{
          fontSize: typography.metricMedium.fontSize,
          lineHeight: typography.metricMedium.lineHeight,
          fontWeight: typography.metricMedium.fontWeight,
          fontVariant: ["tabular-nums"],
          color: colors.textPrimary,
          marginBottom: spacing.sm,
        }}
      >
        {value}
      </Text>

      <View
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityValueLabel}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment" && value < max) onChange(value + 1);
          if (event.nativeEvent.actionName === "decrement" && value > min) onChange(value - 1);
        }}
        style={{ width: "100%" }}
      >
        <View
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.xs }}
        >
          {values.map((position) => {
            const selected = position === value;
            const size = selected ? SELECTED_SIZE : UNSELECTED_SIZE;
            return (
              <Pressable
                key={position}
                accessibilityElementsHidden
                onPress={() => onChange(position)}
                hitSlop={4}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selected ? colors.brandPrimary : "transparent",
                  borderWidth: selected ? 0 : 1.5,
                  borderColor: colors.hairline,
                }}
              >
                <Text
                  style={{
                    fontSize: selected ? typography.body.fontSize : typography.caption.fontSize,
                    fontWeight: selected ? "700" : "400",
                    fontVariant: ["tabular-nums"],
                    color: selected ? colors.accentForeground : colors.textPrimary,
                  }}
                >
                  {position}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: spacing.xxs, marginTop: spacing.sm }}>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{anchorLow}</Text>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{anchorMid}</Text>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{anchorHigh}</Text>
      </View>
    </View>
  );
}
