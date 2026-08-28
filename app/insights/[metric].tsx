import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Chip, ScreenContainer, TrendChart, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { INSIGHTS_RANGE_PRESETS, type InsightsRangePreset } from "@/domain/insights";
import { useInsightDetail } from "@/features/insights/useInsightDetail";
import type { InsightMetricKey } from "@/features/insights/types";

export default function InsightDetailScreen() {
  const { metric } = useLocalSearchParams<{ metric: InsightMetricKey }>();
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const [preset, setPreset] = useState<InsightsRangePreset>("3m");

  const data = useInsightDetail(metric, preset);

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.sm }}>
        {t(`insights.metric.${metric}`)}
      </Text>

      <View style={{ flexDirection: "row", gap: spacing.xs, marginBottom: spacing.lg }}>
        {INSIGHTS_RANGE_PRESETS.map((option) => (
          <Chip key={option} label={t(`insights.range.${option}`)} selected={preset === option} onPress={() => setPreset(option)} />
        ))}
      </View>

      {data.kind === "numeric" ? (
        <View>
          <Text style={{ color: colors.textPrimary, marginBottom: spacing.sm }}>
            {data.trend.sufficientData
              ? t("insights.detailNumericSummary", { average: data.trend.average.toFixed(1), count: data.trend.dataPoints })
              : t("insights.notEnoughData")}
          </Text>
          {data.chartPoints.length > 1 ? (
            <TrendChart
              points={data.chartPoints}
              accessibilityLabel={t("insights.detailNumericSummary", {
                average: data.trend.average.toFixed(1),
                count: data.trend.dataPoints,
              })}
            />
          ) : null}
        </View>
      ) : null}

      {data.kind === "stiffness" ? (
        <View>
          {data.stiffness.sufficientData ? (
            (Object.entries(data.stiffness.bucketCounts) as [string, number][]).map(([bucket, count]) => (
              <Text key={bucket} style={{ color: colors.textPrimary, marginBottom: spacing.xs }}>
                {t(`checkIn.stiffness.${bucket}`)}: {count}
              </Text>
            ))
          ) : (
            <Text style={{ color: colors.textSecondary }}>{t("insights.notEnoughData")}</Text>
          )}
        </View>
      ) : null}

      {data.kind === "lab" ? (
        <View>
          <Text style={{ color: colors.textPrimary, marginBottom: spacing.sm }}>
            {data.history.mostRecent
              ? t("labs.rangeSummary", {
                  min: data.history.min,
                  max: data.history.max,
                  unit: "",
                  count: data.history.values.length,
                })
              : t("insights.notEnoughDataGeneric")}
          </Text>
          {data.chartPoints.length > 1 ? (
            <TrendChart points={data.chartPoints} accessibilityLabel={t(`insights.metric.${metric}`)} />
          ) : null}
        </View>
      ) : null}

      {data.kind === "medicationAdherence" ? (
        <View>
          {data.entries.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>{t("insights.notEnoughDataGeneric")}</Text>
          ) : (
            data.entries.map((entry) => (
              <Text key={entry.name} style={{ color: colors.textPrimary, marginBottom: spacing.xs }}>
                {entry.adherence.sufficientData && entry.adherence.adherencePercentage !== null
                  ? t("appointmentPreparation.medicationAdherence", {
                      name: entry.name,
                      percentage: Math.round(entry.adherence.adherencePercentage),
                    })
                  : t("appointmentPreparation.medicationCounts", {
                      name: entry.name,
                      taken: entry.adherence.takenCount,
                      missed: entry.adherence.missedCount,
                    })}
              </Text>
            ))
          )}
        </View>
      ) : null}

      {data.kind === "injectionHistory" ? (
        <View>
          {data.entries.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>{t("insights.notEnoughDataGeneric")}</Text>
          ) : (
            data.entries.map((entry) => (
              <Text key={entry.name} style={{ color: colors.textPrimary, marginBottom: spacing.xs }}>
                {t("appointmentPreparation.injectionCounts", {
                  name: entry.name,
                  completed: entry.history.completedCount,
                  missed: entry.history.missedCount,
                })}
              </Text>
            ))
          )}
        </View>
      ) : null}
    </ScreenContainer>
  );
}
