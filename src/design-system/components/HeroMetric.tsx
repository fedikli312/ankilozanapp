import { Text, View } from "react-native";

import { useTheme } from "../useTheme";

export type HeroMetricProps = {
  label: string;
  value: string;
  unit?: string;
  context?: string;
};

/**
 * The oversized-tabular-numeral treatment — Design-A2's first named
 * "visual signature" ("oversized tabular health numerals with almost no
 * decorative chrome," `docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §9). At
 * most one `HeroMetric` per screen (e.g. Today's single completed-check-in
 * state) — this is the one place `typography.metricLarge` is used; every
 * other recorded value uses `MetricLine`'s smaller tabular tier. No card,
 * no border — the size itself is the emphasis.
 */
export function HeroMetric({ label, value, unit, context }: HeroMetricProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: 2 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text
          style={{
            fontSize: typography.metricLarge.fontSize,
            lineHeight: typography.metricLarge.lineHeight,
            fontWeight: typography.metricLarge.fontWeight,
            fontVariant: ["tabular-nums"],
            color: colors.textPrimary,
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginLeft: spacing.xxs }}>
            {unit}
          </Text>
        ) : null}
      </View>
      {context ? (
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }}>{context}</Text>
      ) : null}
    </View>
  );
}
