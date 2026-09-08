import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { formatDateBlock, formatMonthYear, formatWeekday, useTranslation } from "@/localization";
import { presentTimelineEvent } from "@/features/timeline/presentTimelineEvent";
import { TimelineEventRow } from "@/features/timeline/TimelineEventRow";
import { TimelineRailLine } from "@/features/timeline/TimelineRailLine";
import { useTimeline } from "@/features/timeline/useTimeline";
import { RAIL_GUTTER_WIDTH } from "@/features/timeline/railLayout";

const DAY_MARKER_SIZE = 26;

/**
 * My AS Timeline — Design System 2.0, Phase Design-E. Ilium's signature
 * surface (brief §3): one continuous vertical rail per month, event
 * markers as small shapes (never per-event/per-day cards — see
 * `TimelineMarker`/`timelineMarkers.ts` for the taxonomy), day markers as
 * bold tabular numerals sitting on the same rail, and a distinct,
 * non-uppercase month heading treatment so this screen reads as an
 * editorial record rather than another settings-style grouped list (brief
 * §30's self-critique question 8: recognizable even with the logo/tab bar
 * hidden).
 *
 * The rail line is scoped to one month at a time (`TimelineRailLine`
 * inside each month's own `position: "relative"` block) rather than one
 * line spanning the entire scroll — genuinely continuous within each
 * month's reading unit, and correctly bounded so it never runs behind the
 * month heading itself (which sits outside that relative block).
 */
export default function TimelineScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { months, today, isEmpty } = useTimeline();

  const title = (
    <Text
      style={{
        fontSize: typography.title.fontSize,
        fontWeight: typography.title.fontWeight,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
      }}
    >
      {t("timeline.title")}
    </Text>
  );

  if (isEmpty) {
    return (
      <ScreenContainer>
        {title}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, textAlign: "center", marginBottom: spacing.xs }}>
            {t("timeline.emptyTitle")}
          </Text>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, textAlign: "center" }}>
            {t("timeline.emptySubtitle")}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      {title}

      {months.map((month) => (
        <View key={month.monthStart} style={{ marginBottom: spacing.xl }}>
          {/* Month heading — deliberately NOT the uppercase `SectionLabel`
              treatment used for settings-style grouped lists elsewhere;
              natural case, real weight/size contrast, the one place this
              screen's editorial character shows most plainly. */}
          <Text
            style={{
              fontSize: typography.headline.fontSize,
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: spacing.sm,
            }}
          >
            {formatMonthYear(new Date(month.monthStart), locale)}
          </Text>

          <View style={{ position: "relative" }}>
            <TimelineRailLine />

            {month.days.map((day) => {
              const dayDate = new Date(day.date);
              const { day: dayNumber } = formatDateBlock(dayDate, locale);

              return (
                <View key={day.date}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.xxs }}>
                    <View style={{ width: RAIL_GUTTER_WIDTH, alignItems: "center" }}>
                      <View
                        style={{
                          width: DAY_MARKER_SIZE,
                          height: DAY_MARKER_SIZE,
                          borderRadius: DAY_MARKER_SIZE / 2,
                          backgroundColor: colors.background,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: typography.callout.fontSize,
                            fontWeight: "700",
                            fontVariant: ["tabular-nums"],
                            color: colors.textPrimary,
                          }}
                        >
                          {dayNumber}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginLeft: spacing.xs }}>
                      {formatWeekday(dayDate, locale)}
                    </Text>
                  </View>

                  {day.events.map((event) => {
                    const { label, caption, accessibilityLabel, route } = presentTimelineEvent(event, t, today);
                    return (
                      <TimelineEventRow
                        key={event.id}
                        type={event.type}
                        label={label}
                        caption={caption}
                        accessibilityLabel={accessibilityLabel}
                        onPress={route ? () => router.push(route) : undefined}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
}
