import { useState } from "react";
import { LayoutChangeEvent, Text, View } from "react-native";

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
const MAX_POINTS = 24;
const STROKE_WIDTH = 3;

/**
 * A single continuous, rounded-cap line of the user's own values over time —
 * the "Thread" motif (Visual Design Spec §18, §31): never a bar chart, never
 * color-coded zones or reference-range shading (that would be medical
 * interpretation). Built with plain Views rather than a charting library or
 * SVG, consistent with the minimal-dependency approach used throughout V1 —
 * each segment is a thin rotated rounded rect between two points, joined by
 * a small dot at each vertex so corners read as one unbroken stroke.
 */
export function TrendChart({ points, accessibilityLabel }: TrendChartProps) {
  const { colors, spacing } = useTheme();
  const [width, setWidth] = useState(0);

  if (points.length === 0) return null;

  const shown = points.slice(-MAX_POINTS);
  const values = shown.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const verticalPadding = STROKE_WIDTH * 2;

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const coords = shown.map((point, index) => {
    const x = shown.length === 1 ? width / 2 : (index / (shown.length - 1)) * width;
    const normalized = (point.value - min) / span;
    const y = verticalPadding + (1 - normalized) * (CHART_HEIGHT - verticalPadding * 2);
    return { x, y };
  });

  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={{ marginVertical: spacing.sm }}>
      <View onLayout={onLayout} style={{ height: CHART_HEIGHT, width: "100%" }}>
        {width > 0
          ? coords.map((point, index) => {
              const next = coords[index + 1];
              return (
                <View key={index}>
                  {next ? <ThreadSegment from={point} to={next} color={colors.accent} /> : null}
                  <View
                    style={{
                      position: "absolute",
                      left: point.x - STROKE_WIDTH,
                      top: point.y - STROKE_WIDTH,
                      width: STROKE_WIDTH * 2,
                      height: STROKE_WIDTH * 2,
                      borderRadius: STROKE_WIDTH,
                      backgroundColor: colors.accent,
                    }}
                  />
                </View>
              );
            })
          : null}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        <Text style={{ fontSize: 11, color: colors.textSecondary }}>{shown[0]?.label}</Text>
        <Text style={{ fontSize: 11, color: colors.textSecondary }}>{shown[shown.length - 1]?.label}</Text>
      </View>
    </View>
  );
}

type Point = { x: number; y: number };

/** One thin rounded-rect rotated to connect two points — rotates around its own center, so no `transformOrigin` dependency is needed. */
function ThreadSegment({ from, to, color }: { from: Point; to: Point; color: string }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <View
      style={{
        position: "absolute",
        left: midX - length / 2,
        top: midY - STROKE_WIDTH / 2,
        width: length,
        height: STROKE_WIDTH,
        borderRadius: STROKE_WIDTH / 2,
        backgroundColor: color,
        transform: [{ rotate: `${angleDeg}deg` }],
      }}
    />
  );
}
