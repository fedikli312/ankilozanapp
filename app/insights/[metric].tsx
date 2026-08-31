import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Chip, GroupedList, ListRow, ScreenContainer, TrendChart, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { INSIGHTS_RANGE_PRESETS, type InsightsRangePreset } from "@/domain/insights";
import { useInsightDetail } from "@/features/insights/useInsightDetail";
import { LAB_MARKER_DEFAULT_UNIT } from "@/features/labs/useLabResults";
import type { InsightMetricKey } from "@/features/insights/types";

function RangeControl({
  preset,
  onChange,
}: {
  preset: InsightsRangePreset;
  onChange: (preset: InsightsRangePreset) => void;
}) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: spacing.xs, marginVertical: spacing.md }}>
      {INSIGHTS_RANGE_PRESETS.map((option) => (
        <Chip key={option} label={t(`insights.range.${option}`)} selected={preset === option} onPress={() => onChange(option)} />
      ))}
    </View>
  );
}

/** 0 records / 1-2 records ("more needed for a trend") / 3+ ("real trend") — the domain's actual minimum for a computed trend is 3 check-ins (`INSIGHTS_THRESHOLDS.minCheckInsForTrend`), not the 2 a literal 0/1/2+ reading might suggest; this maps the approved copy states onto the real threshold rather than changing it. */
function NumericEmptyState({ dataPoints }: { dataPoints: number }) {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  if (dataPoints === 0) {
    return (
      <View style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.xxs }}>
          {t("insights.detailEmptyTitle")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{t("insights.detailEmptyBody")}</Text>
      </View>
    );
  }
  return (
    <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
      {t("insights.needMoreForTrend")}
    </Text>
  );
}

export default function InsightDetailScreen() {
  const { metric } = useLocalSearchParams<{ metric: InsightMetricKey }>();
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const [preset, setPreset] = useState<InsightsRangePreset>("3m");

  const data = useInsightDetail(metric, preset);

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {t(`insights.metric.${metric}`)}
      </Text>

      {data.kind === "numeric" ? (
        <>
          {data.trend.sufficientData ? (
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{
                  fontSize: typography.metricLarge.fontSize,
                  lineHeight: typography.metricLarge.lineHeight,
                  fontWeight: typography.metricLarge.fontWeight,
                  color: colors.textPrimary,
                }}
              >
                {data.trend.average.toFixed(1)}
              </Text>
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginLeft: spacing.xxs }}>/10</Text>
            </View>
          ) : null}
          <RangeControl preset={preset} onChange={setPreset} />
          {data.trend.sufficientData ? (
            <>
              {data.chartPoints.length > 1 ? (
                <TrendChart
                  points={data.chartPoints}
                  accessibilityLabel={t("insights.detailNumericSummary", { average: data.trend.average.toFixed(1), count: data.trend.dataPoints })}
                />
              ) : null}
              <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
                {t("insights.detailNumericSummary", { average: data.trend.average.toFixed(1), count: data.trend.dataPoints })}
              </Text>
            </>
          ) : (
            <NumericEmptyState dataPoints={data.trend.dataPoints} />
          )}
        </>
      ) : null}

      {data.kind === "stiffness" ? (
        <>
          {data.stiffness.sufficientData && data.stiffness.mostCommonBucket ? (
            <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary }}>
              {t("insights.stiffnessMostCommon", { bucket: t(`checkIn.stiffness.${data.stiffness.mostCommonBucket}`) })}
            </Text>
          ) : null}
          <RangeControl preset={preset} onChange={setPreset} />
          {data.stiffness.sufficientData ? (
            <GroupedList>
              {(Object.entries(data.stiffness.bucketCounts) as [string, number][]).map(([bucket, count]) => (
                <ListRow key={bucket} label={t(`checkIn.stiffness.${bucket}`)} trailing={<Text style={{ color: colors.textPrimary }}>{count}</Text>} />
              ))}
            </GroupedList>
          ) : (
            <NumericEmptyState dataPoints={data.stiffness.dataPoints} />
          )}
        </>
      ) : null}

      {data.kind === "lab" ? (
        <>
          {data.history.mostRecent ? (
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{
                  fontSize: typography.metricLarge.fontSize,
                  lineHeight: typography.metricLarge.lineHeight,
                  fontWeight: typography.metricLarge.fontWeight,
                  color: colors.textPrimary,
                }}
              >
                {data.history.mostRecent.value}
              </Text>
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginLeft: spacing.xxs }}>
                {LAB_MARKER_DEFAULT_UNIT[metric === "crp" ? "CRP" : "ESR"]}
              </Text>
            </View>
          ) : null}
          <RangeControl preset={preset} onChange={setPreset} />
          {data.history.values.length >= 2 ? (
            <>
              {data.chartPoints.length > 1 ? <TrendChart points={data.chartPoints} accessibilityLabel={t(`insights.metric.${metric}`)} /> : null}
              <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
                {t("labs.rangeSummary", { min: data.history.min, max: data.history.max, unit: LAB_MARKER_DEFAULT_UNIT[metric === "crp" ? "CRP" : "ESR"], count: data.history.values.length })}
              </Text>
            </>
          ) : (
            <NumericEmptyState dataPoints={data.history.values.length} />
          )}
        </>
      ) : null}

      {data.kind === "medicationAdherence" ? (
        <>
          <RangeControl preset={preset} onChange={setPreset} />
          <GroupedList>
            {data.entries.length === 0 ? (
              <ListRow label={t("insights.notEnoughDataGeneric")} />
            ) : (
              data.entries.map((entry) => (
                <ListRow
                  key={entry.name}
                  label={entry.name}
                  caption={
                    entry.adherence.sufficientData && entry.adherence.adherencePercentage !== null
                      ? t("appointmentPreparation.medicationAdherence", { name: entry.name, percentage: Math.round(entry.adherence.adherencePercentage) })
                      : t("appointmentPreparation.medicationCounts", { name: entry.name, taken: entry.adherence.takenCount, missed: entry.adherence.missedCount })
                  }
                />
              ))
            )}
          </GroupedList>
        </>
      ) : null}

      {data.kind === "injectionHistory" ? (
        <>
          <RangeControl preset={preset} onChange={setPreset} />
          <GroupedList>
            {data.entries.length === 0 ? (
              <ListRow label={t("insights.notEnoughDataGeneric")} />
            ) : (
              data.entries.map((entry) => (
                <ListRow
                  key={entry.name}
                  label={entry.name}
                  caption={t("appointmentPreparation.injectionCounts", { name: entry.name, completed: entry.history.completedCount, missed: entry.history.missedCount })}
                />
              ))
            )}
          </GroupedList>
        </>
      ) : null}
    </ScreenContainer>
  );
}
