import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Text } from "react-native";

import { GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useInsightsLanding } from "@/features/insights/useInsightsLanding";
import type { InsightMetricKey } from "@/features/insights/types";
import type { NumericTrend, StiffnessHistory, LabHistory, MedicationAdherence, InjectionHistory } from "@/domain/insights";

/**
 * Strictly neutral factual presentation (Redesign Spec Phase K §7) — states
 * both numbers without directional/interpretive wording ("up from"/"down
 * from"/"about the same as"). `trend.direction` remains in the domain data
 * unchanged; this only stops reading it for copy.
 */
function numericSummary(t: (k: string, o?: Record<string, unknown>) => string, trend: NumericTrend): string {
  if (!trend.sufficientData) return t("insights.notEnoughData");
  const average = trend.average.toFixed(1);
  if (trend.previousPeriodAverage === null) return t("insights.averageOnly", { average });
  const previous = trend.previousPeriodAverage.toFixed(1);
  return t("insights.averageComparison", { average, previous });
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

  const rows: { key: InsightMetricKey; label: string; summary: string; icon: ComponentProps<typeof Ionicons>["name"] }[] = [
    { key: "pain", label: t("insights.metric.pain"), summary: numericSummary(t, data.pain), icon: "pulse-outline" },
    { key: "stiffness", label: t("insights.metric.stiffness"), summary: stiffnessSummary(t, data.stiffness), icon: "time-outline" },
    { key: "fatigue", label: t("insights.metric.fatigue"), summary: numericSummary(t, data.fatigue), icon: "battery-half-outline" },
    { key: "medicationAdherence", label: t("insights.metric.medicationAdherence"), summary: adherenceSummary(t, data.medicationAdherence), icon: "medkit-outline" },
    { key: "injectionHistory", label: t("insights.metric.injectionHistory"), summary: injectionSummary(t, data.injectionHistory), icon: "medical-outline" },
    { key: "crp", label: t("insights.metric.crp"), summary: labSummary(t, data.crp), icon: "flask-outline" },
    { key: "esr", label: t("insights.metric.esr"), summary: labSummary(t, data.esr), icon: "flask-outline" },
  ];

  return (
    <ScreenContainer scroll>
      {/* Phase S: an earlier pass in this same phase added an in-content
          title here, believing the screen had none — it was wrong. This is
          a tab screen; `app/(tabs)/_layout.tsx` already renders
          `insights.title` as the native tab header (with the gear icon).
          Adding it again here produced a duplicated heading, caught in this
          phase's own live QA and reverted before it ever shipped. */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("insights.subtitle")}
      </Text>

      <GroupedList>
        {rows.map((item) => (
          <ListRow
            key={item.key}
            leading={<Ionicons name={item.icon} size={20} color={colors.textSecondary} />}
            label={item.label}
            caption={item.summary}
            onPress={() => router.push(`/insights/${item.key}`)}
            chevron
          />
        ))}
      </GroupedList>

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: "italic" }}>
        {t("insights.disclaimer")}
      </Text>
    </ScreenContainer>
  );
}
