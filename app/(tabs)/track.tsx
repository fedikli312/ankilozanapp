import { useRouter } from "expo-router";
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

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("track.title")}
      </Text>
      <View>
        <ListRow label={t("track.symptoms")} caption={symptomsCaption} onPress={() => router.push("/symptoms")} />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow label={t("medications.listTitle")} caption={medicationsCaption} onPress={() => router.push("/medications")} />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow label={t("injections.listTitle")} caption={injectionsCaption} onPress={() => router.push("/injections")} />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow label={t("track.labs")} caption={labsCaption} onPress={() => router.push("/labs")} />
      </View>
    </ScreenContainer>
  );
}
