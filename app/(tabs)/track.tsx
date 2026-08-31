import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useTrackLanding } from "@/features/track/useTrackLanding";

export default function TrackLandingScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { latestCheckIn, activeMedications, activeInjections, latestLabResult } = useTrackLanding();

  const symptomsCaption = latestCheckIn
    ? t("track.symptomsSummary", { pain: latestCheckIn.pain, date: latestCheckIn.date })
    : t("track.noneYet");

  const medicationsCaption =
    activeMedications.length > 0
      ? t("track.countActive", { count: activeMedications.length })
      : t("track.noneYet");

  const injectionsCaption =
    activeInjections.length > 0
      ? t("track.countActive", { count: activeInjections.length })
      : t("track.noneYet");

  const labsCaption = latestLabResult
    ? t("track.labsSummary", {
        marker: t(`labs.marker.${latestLabResult.marker}`),
        value: latestLabResult.value,
        unit: latestLabResult.unit,
        date: latestLabResult.recordedDate,
      })
    : t("track.noneYet");

  const icon = (name: ComponentProps<typeof Ionicons>["name"]) => (
    <Ionicons name={name} size={20} color={colors.textSecondary} />
  );

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("track.subtitle")}
      </Text>
      <View>
        <ListRow leading={icon("pulse-outline")} label={t("track.symptoms")} caption={symptomsCaption} onPress={() => router.push("/symptoms")} chevron />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow leading={icon("medkit-outline")} label={t("medications.listTitle")} caption={medicationsCaption} onPress={() => router.push("/medications")} chevron />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow leading={icon("water-outline")} label={t("injections.listTitle")} caption={injectionsCaption} onPress={() => router.push("/injections")} chevron />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow leading={icon("flask-outline")} label={t("track.labs")} caption={labsCaption} onPress={() => router.push("/labs")} chevron />
      </View>
    </ScreenContainer>
  );
}
