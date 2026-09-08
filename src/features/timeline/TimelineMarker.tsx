import { View } from "react-native";

import { useTheme } from "@/design-system";
import type { TimelineEventType } from "@/domain/timeline";

import { TIMELINE_EVENT_MARKERS } from "./timelineMarkers";

export type TimelineMarkerProps = {
  type: TimelineEventType;
};

const ROUTINE_SIZE = 8;
const ANCHOR_SIZE = 13;

/**
 * Renders one event's marker on the Timeline rail (Design System 2.0,
 * Phase Design-E §5) — plain `View`s only, no SVG/icon dependency, so
 * every shape is a real geometric primitive rather than a pictorial glyph.
 * See `timelineMarkers.ts` for the shape/tier/color taxonomy this reads.
 */
export function TimelineMarker({ type }: TimelineMarkerProps) {
  const { colors } = useTheme();
  const { shape, tier } = TIMELINE_EVENT_MARKERS[type];
  const size = tier === "anchor" ? ANCHOR_SIZE : ROUTINE_SIZE;
  const ink = type === "high_symptom_day" ? colors.brandPrimary : tier === "anchor" ? colors.textPrimary : colors.textSecondary;

  switch (shape) {
    case "circle":
      return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: ink }} />;

    case "square":
      return <View style={{ width: size - 1, height: size - 1, borderRadius: 1.5, backgroundColor: ink }} />;

    case "diamond":
      return (
        <View
          style={{
            width: size - 1,
            height: size - 1,
            backgroundColor: ink,
            borderRadius: 1,
            transform: [{ rotate: "45deg" }],
          }}
        />
      );

    case "ring":
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: ink,
            backgroundColor: colors.background,
          }}
        />
      );

    case "doubleRing":
      return (
        <View
          style={{
            width: size + 2,
            height: size + 2,
            borderRadius: (size + 2) / 2,
            borderWidth: 1.5,
            borderColor: ink,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: ink }} />
        </View>
      );

    case "bar":
      return <View style={{ width: 3, height: size + 3, borderRadius: 1.5, backgroundColor: ink }} />;
  }
}
