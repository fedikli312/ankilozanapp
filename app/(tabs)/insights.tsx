import { useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";

import { ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useInsightsLanding } from "@/features/insights/useInsightsLanding";
import type { InsightMetricKey } from "@/features/insights/types";
import type { NumericTrend, StiffnessHistory, LabHistory, MedicationAdherence, InjectionHistory } from "@/domain/insights";

function numericSummary(t: (k: string, o?: Record<string, unknown>) => string, trend: NumericTrend): string {
  if (!trend.sufficientData) return t("insights.notEnoughData");
  const average = trend.average.toFixed(1);
  if (trend.previousPeriodAverage === null) return t("insights.averageOnly", { average });
  const previous = trend.previousPeriodAverage.toFixed(1);
  if (trend.direction === "down") return t("insights.averageDown", { average, previous });
  if (trend.direction === "up") return t("insights.averageUp", { average, previous });
  return t("insights.averageFlat", { average });
}

function stiffnessSummary(t: (k: string, o?: Record<string, unknown>) => string, stiffness: StiffnessHistory): string {
  if (!stiffness.sufficientData || !stiffness.mostCommonBucket) return t("insights.notEnoughData");
  return t("insights.stiffnessSummary", {
    bucket: t(`checkIn.stiffness.${stiffness.mostCommonBucket}`),
    count: stiffness.bucketCounts[stiffness.mostCommonBucket],
    total: stiffness.dataPoints,
  });
}

function adherenceSummary(t: (k: string, o?: Record<string, unknown>) => string, adherence: MedicationAdherence): string {
  if (adherence.sufficientData && adherence.adherencePercentage !== null) {
    return t("insights.adherenceSummary", { percentage: Math.round(adherence.adherencePercentage) });
  }
  if (adherence.takenCount + adherence.missedCount + adherence.skippedCount > 0) {
    return t("insights.adherenceCounts", { taken: adherence.takenCount, missed: adherence.missedCount });
  }
  return t("insights.notEnoughDataGeneric");
}

function injectionSummary(t: (k: string, o?: Record<string, unknown>) => string, history: InjectionHistory): string {
  if (history.completedCount + history.missedCount === 0) return t("insights.notEnoughDataGeneric");
  return t("insights.injectionSummary", { completed: history.completedCount, missed: history.missedCount });
}

function labSummary(t: (k: string, o?: Record<string, unknown>) => string, history: LabHistory): string {
  if (!history.mostRecent) return t("insights.notEnoughDataGeneric");
  return t("insights.labSummary", { value: history.mostRecent.value, date: history.mostRecent.recordedDate });
}

export default function InsightsLandingScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const data = useInsightsLanding();

  const rows: { key: InsightMetricKey; label: string; summary: string }[] = [
    { key: "pain", label: t("insights.metric.pain"), summary: numericSummary(t, data.pain) },
    { key: "stiffness", label: t("insights.metric.stiffness"), summary: stiffnessSummary(t, data.stiffness) },
    { key: "fatigue", label: t("insights.metric.fatigue"), summary: numericSummary(t, data.fatigue) },
    { key: "medicationAdherence", label: t("insights.metric.medicationAdherence"), summary: adherenceSummary(t, data.medicationAdherence) },
    { key: "injectionHistory", label: t("insights.metric.injectionHistory"), summary: injectionSummary(t, data.injectionHistory) },
    { key: "crp", label: t("insights.metric.crp"), summary: labSummary(t, data.crp) },
    { key: "esr", label: t("insights.metric.esr"), summary: labSummary(t, data.esr) },
  ];

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {t("insights.title")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md }}>
        {t("insights.disclaimer")}
      </Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <ListRow label={item.label} caption={item.summary} onPress={() => router.push(`/insights/${item.key}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.borderHairline }} />}
      />
    </ScreenContainer>
  );
}
