import { Text, View } from "react-native";

import { AccessibleTouchable, useTheme } from "@/design-system";
import type { TimelineEventType } from "@/domain/timeline";

import { TimelineMarker } from "./TimelineMarker";
import { RAIL_GUTTER_WIDTH } from "./railLayout";

export type TimelineEventRowProps = {
  type: TimelineEventType;
  label: string;
  caption?: string;
  accessibilityLabel: string;
  onPress?: () => void;
};

const MARKER_BACKDROP_SIZE = 22;

/**
 * One event's row beside the rail (Design System 2.0, Phase Design-E) —
 * shared by the full Timeline screen and the Health Record landing's
 * compact preview, so both read as the same surface. The marker sits in a
 * fixed-width gutter on a small `colors.background`-filled backdrop, which
 * visually "punches through" `TimelineRailLine`'s continuous line so the
 * line reads as passing behind each bead rather than being interrupted by
 * it. No card, no border — a hairline hierarchy: bold label, quieter
 * caption, a chevron only when the row is genuinely navigable (brief §24:
 * "does not need every visual marker to be independently touchable unless
 * there is an actual action").
 *
 * Tabular numerals apply to the label for check-in/High-Symptom-Day events
 * (the recorded pain/fatigue numbers live there) and to the caption for
 * lab events (the recorded value lives there) — brief §7/§14's numeric
 * treatment, applied precisely where a real number appears rather than to
 * every row uniformly.
 */
export function TimelineEventRow({ type, label, caption, accessibilityLabel, onPress }: TimelineEventRowProps) {
  const { colors, typography, spacing } = useTheme();
  const tabularLabel = type === "check_in" || type === "high_symptom_day";
  const tabularCaption = type === "lab";

  const content = (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <View style={{ width: RAIL_GUTTER_WIDTH, alignItems: "center" }}>
        <View
          style={{
            width: MARKER_BACKDROP_SIZE,
            height: MARKER_BACKDROP_SIZE,
            borderRadius: MARKER_BACKDROP_SIZE / 2,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TimelineMarker type={type} />
        </View>
      </View>
      <View style={{ flex: 1, paddingLeft: spacing.xs, paddingBottom: spacing.md, paddingTop: 2 }}>
        <Text
          style={{
            fontSize: typography.body.fontSize,
            color: colors.textPrimary,
            fontVariant: tabularLabel ? ["tabular-nums"] : undefined,
          }}
        >
          {label}
        </Text>
        {caption ? (
          <Text
            style={{
              fontSize: typography.caption.fontSize,
              color: colors.textSecondary,
              marginTop: 1,
              fontVariant: tabularCaption ? ["tabular-nums"] : undefined,
            }}
          >
            {caption}
          </Text>
        ) : null}
      </View>
      {onPress ? (
        <Text style={{ fontSize: 18, color: colors.textSecondary, marginLeft: spacing.xs }} accessibilityElementsHidden>
          {"›"}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <AccessibleTouchable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      {content}
    </AccessibleTouchable>
  );
}
