import { View } from "react-native";

import { useTheme } from "@/design-system";

import { RAIL_LINE_WIDTH, RAIL_LINE_X } from "./railLayout";

/**
 * The one continuous vertical line a Timeline segment's markers sit on
 * (Design System 2.0, Phase Design-E §3/§4) — absolutely positioned to
 * span the full height of its parent, so it reads as one unbroken rail
 * behind every day/event row in that segment, not a line-per-row. The
 * parent must be `position: "relative"` with no other absolutely
 * positioned siblings competing for the same coordinate space.
 */
export function TimelineRailLine() {
  const { colors } = useTheme();
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: RAIL_LINE_X - RAIL_LINE_WIDTH / 2,
        top: 0,
        bottom: 0,
        width: RAIL_LINE_WIDTH,
        backgroundColor: colors.hairline,
      }}
    />
  );
}
