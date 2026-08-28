import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useLabResults } from "@/features/labs/useLabResults";

export default function LabsLandingScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const crp = useLabResults("CRP");
  const esr = useLabResults("ESR");

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("track.labs")}
      </Text>
      <ListRow
        label={t("labs.marker.CRP")}
        caption={crp.latest ? `${crp.latest.value} ${crp.latest.unit} · ${crp.latest.recordedDate}` : t("labs.emptyTitle", { marker: t("labs.marker.CRP") })}
        onPress={() => router.push("/labs/CRP")}
      />
      <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
      <ListRow
        label={t("labs.marker.ESR")}
        caption={esr.latest ? `${esr.latest.value} ${esr.latest.unit} · ${esr.latest.recordedDate}` : t("labs.emptyTitle", { marker: t("labs.marker.ESR") })}
        onPress={() => router.push("/labs/ESR")}
      />
    </ScreenContainer>
  );
}
