import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Text } from "react-native";

import { GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { formatShortDate, useTranslation } from "@/localization";
import { useTrackLanding } from "@/features/track/useTrackLanding";
import { todayDateOnly } from "@/shared/today";

export default function TrackLandingScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const {
    latestCheckInDate,
    activeMedications,
    activeInjections,
    nextInjectionDate,
    nextInjectionDaysLeft,
    latestLabResult,
  } = useTrackLanding();

  const symptomsCaption = latestCheckInDate
    ? t(
        latestCheckInDate === todayDateOnly() ? "track.latestCheckInToday" : "track.latestCheckInOn",
        latestCheckInDate === todayDateOnly()
          ? undefined
          : { date: formatShortDate(new Date(latestCheckInDate), locale) },
      )
    : t("track.noneYet");

  const medicationsCaption =
    activeMedications.length > 0 ? t("track.countActive", { count: activeMedications.length }) : t("track.noneYet");

  const injectionsCaption =
    activeInjections.length === 0
      ? t("track.noneYet")
      : nextInjectionDate && nextInjectionDaysLeft !== null
        ? nextInjectionDaysLeft <= 0
          ? t("track.injectionsToday")
          : t("track.injectionsNextIn", { count: nextInjectionDaysLeft })
        : t("track.countActive", { count: activeInjections.length });

  const labsCaption = latestLabResult
    ? t("track.labsLatestResult", { date: formatShortDate(new Date(latestLabResult.recordedDate), locale) })
    : t("track.noneYet");

  const icon = (name: ComponentProps<typeof Ionicons>["name"]) => (
    <Ionicons name={name} size={20} color={colors.textSecondary} />
  );

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("track.subtitle")}
      </Text>

      <GroupedList title={t("track.healthGroupTitle")}>
        <ListRow
          leading={icon("pulse-outline")}
          label={t("track.symptoms")}
          caption={symptomsCaption}
          onPress={() => router.push("/symptoms")}
          chevron
        />
        <ListRow
          leading={icon("medkit-outline")}
          label={t("medications.listTitle")}
          caption={medicationsCaption}
          onPress={() => router.push("/medications")}
          chevron
        />
        <ListRow
          leading={icon("medical-outline")}
          label={t("injections.listTitle")}
          caption={injectionsCaption}
          onPress={() => router.push("/injections")}
          chevron
        />
        <ListRow
          leading={icon("flask-outline")}
          label={t("track.labs")}
          caption={labsCaption}
          onPress={() => router.push("/labs")}
          chevron
        />
      </GroupedList>

      {/* Redesign Spec §8: "GÜNLÜK DESTEK" (Nutrition/Breathing-Posture) is
          intentionally not rendered yet — those routes don't exist until
          Phase I, and the spec's own fallback is to avoid exposing dead
          navigation rather than showing a disabled/"coming soon" row. */}
    </ScreenContainer>
  );
}
