import { useRouter } from "expo-router";
import { Text } from "react-native";

import { GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { formatShortDate, useTranslation } from "@/localization";
import { useLabResults } from "@/features/labs/useLabResults";

export default function LabsLandingScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const crp = useLabResults("CRP");
  const esr = useLabResults("ESR");

  const caption = (latest: { value: number; unit: string; recordedDate: string } | null, marker: "CRP" | "ESR") =>
    latest
      ? `${latest.value} ${latest.unit} · ${formatShortDate(new Date(latest.recordedDate), locale)}`
      : t("labs.emptyTitle", { marker: t(`labs.marker.${marker}`) });

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: 2 }}>
        {t("track.labs")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("labs.subtitle")}
      </Text>

      <GroupedList title={t("labs.latestResultsTitle")}>
        <ListRow
          label={t("labs.marker.CRP")}
          caption={caption(crp.latest, "CRP")}
          onPress={() => router.push("/labs/CRP")}
          chevron
        />
        <ListRow
          label={t("labs.marker.ESR")}
          caption={caption(esr.latest, "ESR")}
          onPress={() => router.push("/labs/ESR")}
          chevron
        />
      </GroupedList>
    </ScreenContainer>
  );
}
