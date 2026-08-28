import { Text, View } from "react-native";

import { useTheme } from "../useTheme";

export type TrendChartPoint = {
  label: string;
  value: number;
};

export type TrendChartProps = {
  points: TrendChartPoint[];
  /** Required — every chart must carry a text-equivalent summary alongside it (UX spec §I/§O accessibility requirement); this component does not infer one. */
  accessibilityLabel: string;
};

const CHART_HEIGHT = 96;
const MAX_BARS = 24;

/**
 * A plain bar chart of the user's own values over time — no color-coded
 * zones, no reference-range shading (UX spec §I: that would be medical
 * interpretation). Built with plain Views rather than a charting library,
 * consistent with the minimal-dependency approach used throughout V1.
 */
export function TrendChart({ points, accessibilityLabel }: TrendChartProps) {
  const { colors, spacing, radius } = useTheme();

  if (points.length === 0) return null;

  const shown = points.slice(-MAX_BARS);
  const values = shown.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={{ marginVertical: spacing.sm }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          height: CHART_HEIGHT,
          gap: 3,
        }}
      >
        {shown.map((point, index) => {
          const heightRatio = (point.value - min) / span;
          const barHeight = Math.max(4, heightRatio * (CHART_HEIGHT - 8) + 8);
          return (
            <View
              key={`${point.label}-${index}`}
              style={{
                flex: 1,
                height: barHeight,
                backgroundColor: colors.accent,
                borderRadius: radius.small / 2,
                opacity: 0.75,
              }}
            />
          );
        })}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        <Text style={{ fontSize: 11, color: colors.textSecondary }}>{shown[0]?.label}</Text>
        <Text style={{ fontSize: 11, color: colors.textSecondary }}>{shown[shown.length - 1]?.label}</Text>
      </View>
    </View>
  );
}
