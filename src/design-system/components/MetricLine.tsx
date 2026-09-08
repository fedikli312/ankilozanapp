import { Text, View } from "react-native";

import { useTheme } from "../useTheme";

export type MetricLineProps = {
  label: string;
  /** The recorded value, already formatted as a string (e.g. "4.2", "18"). Rendered with tabular numerals. */
  value: string;
  unit?: string;
  /** A short supporting fact, e.g. "12 entries" or a date. */
  context?: string;
};

/**
 * Design System 2.0's default health-metric presentation (Phase Design-B
 * §11) — LABEL / large tabular VALUE / optional unit / optional short
 * context, inline, no card. Replaces `MetricCard` as the default for new
 * screens; `MetricCard`'s bordered-tile treatment remains available for
 * the rare case a metric genuinely needs card-level prominence (e.g. one
 * hero figure — see `HeroMetric` for that specific case), never as the
 * default for an ordinary recorded value.
 */
export function MetricLine({ label, value, unit, context }: MetricLineProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: 2 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text
          style={{
            fontSize: typography.metricMedium.fontSize,
            lineHeight: typography.metricMedium.lineHeight,
            fontWeight: typography.metricMedium.fontWeight,
            fontVariant: ["tabular-nums"],
            color: colors.textPrimary,
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginLeft: spacing.xxs }}>
            {unit}
          </Text>
        ) : null}
      </View>
      {context ? (
        <Text style={{ fontSize: typography.metadata.fontSize, color: colors.textTertiary, marginTop: 2 }}>{context}</Text>
      ) : null}
    </View>
  );
}
