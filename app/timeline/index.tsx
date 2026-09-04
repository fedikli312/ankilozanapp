import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { GroupedList, ListRow, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { formatMonthYear, formatShortDate, useTranslation } from "@/localization";
import { presentTimelineEvent } from "@/features/timeline/presentTimelineEvent";
import { useTimeline } from "@/features/timeline/useTimeline";
import type { TimelineEventType } from "@/domain/timeline";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

/**
 * Phase X §6/§17 — the event's icon is *supplemental*, never the only
 * signal: the label text itself already says "High-symptom day" /
 * "Yoğun belirti günü" for that one case, and every other event type's
 * label is already a factual name (a medication, a marker, a doctor).
 * `high_symptom_day` gets the filled variant + the accent color; every
 * other type shares the same calm, muted outline treatment already used
 * elsewhere in the app (Track's own health-tracking rows, Today).
 */
const EVENT_ICON: Record<TimelineEventType, IoniconName> = {
  check_in: "pulse-outline",
  high_symptom_day: "pulse",
  medication: "medkit-outline",
  injection: "medical-outline",
  lab: "flask-outline",
  appointment: "calendar-outline",
};

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
        marginBottom: spacing.md,
      }}
    >
      {t("timeline.title")}
    </Text>
  );

  if (isEmpty) {
    return (
      <ScreenContainer>
        {title}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, textAlign: "center" }}>
            {t("timeline.emptyTitle")}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      {title}

      {months.map((month) => (
        <View key={month.monthStart}>
          <SectionLabel>{formatMonthYear(new Date(month.monthStart), locale)}</SectionLabel>

          {month.days.map((day) => (
            <View key={day.date} style={{ marginBottom: spacing.sm }}>
              <Text
                style={{
                  fontSize: typography.caption.fontSize,
                  fontWeight: "600",
                  color: colors.textPrimary,
                  marginBottom: spacing.xxs,
                }}
              >
                {formatShortDate(new Date(day.date), locale)}
              </Text>

              <GroupedList>
                {day.events.map((event) => {
                  const { label, caption, accessibilityLabel, route } = presentTimelineEvent(event, t, today);
                  const highlighted = event.type === "high_symptom_day";

                  return (
                    <ListRow
                      key={event.id}
                      leading={
                        <Ionicons
                          name={EVENT_ICON[event.type]}
                          size={20}
                          color={highlighted ? colors.accent : colors.textSecondary}
                        />
                      }
                      label={label}
                      caption={caption}
                      accessibilityLabel={accessibilityLabel}
                      onPress={route ? () => router.push(route) : undefined}
                      chevron={!!route}
                    />
                  );
                })}
              </GroupedList>
            </View>
          ))}
        </View>
      ))}
    </ScreenContainer>
  );
}
