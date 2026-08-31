import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, GroupedList, ListRow, ScreenContainer, SectionLabel, TrendChart, useTheme } from "@/design-system";
import { formatDate, formatNumber, useTranslation } from "@/localization";
import { useLabResults, type LabMarker } from "@/features/labs/useLabResults";

export default function LabMarkerHistoryScreen() {
  const { marker } = useLocalSearchParams<{ marker: LabMarker }>();
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { results, latest } = useLabResults(marker);

  const markerLabel = t(`labs.marker.${marker}`);

  if (results.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.xs, textAlign: "center" }}>
            {t("labs.detail.emptyTitle")}
          </Text>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md, textAlign: "center" }}>
            {t("labs.detail.emptyBody")}
          </Text>
          <Button label={t("labs.addAction")} onPress={() => router.push(`/labs/${marker}/add`)} />
        </View>
      </ScreenContainer>
    );
  }

  const previous = results[1] ?? null;
  const delta = previous ? Math.round((latest!.value - previous.value) * 10) / 10 : null;
  const deltaSign = delta !== null && delta > 0 ? "+" : "";

  const chartPoints = results
    .slice()
    .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate))
    .map((r) => ({ label: r.recordedDate.slice(5), value: r.value }));

  const chartSummary = t("labs.detail.chartSummary", {
    marker: markerLabel,
    count: results.length,
    value: latest!.value,
    unit: latest!.unit,
  });

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.sm }}>
        {markerLabel}
      </Text>

      {latest ? (
        <View style={{ marginBottom: spacing.xs }}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={{
                fontSize: typography.metricLarge.fontSize,
                lineHeight: typography.metricLarge.lineHeight,
                fontWeight: typography.metricLarge.fontWeight,
                color: colors.textPrimary,
              }}
            >
              {formatNumber(latest.value, locale)}
            </Text>
            <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginLeft: spacing.xxs }}>
              {latest.unit}
            </Text>
          </View>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
            {formatDate(new Date(latest.recordedDate), locale)}
          </Text>
          {delta !== null ? (
            <View style={{ marginTop: spacing.xs }}>
              <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
                {t("labs.detail.previousChangeLabel")}
              </Text>
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>
                {deltaSign}
                {formatNumber(delta, locale)} {latest.unit}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <SectionLabel>{t("labs.detail.trendTitle")}</SectionLabel>
      {results.length >= 2 ? (
        <TrendChart points={chartPoints} accessibilityLabel={chartSummary} />
      ) : (
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
          {t("labs.detail.needMoreForTrend")}
        </Text>
      )}

      <GroupedList title={t("labs.detail.historyTitle")}>
        {results.map((item) => (
          <ListRow
            key={item.id}
            label={formatDate(new Date(item.recordedDate), locale)}
            trailing={<Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{`${item.value} ${item.unit}`}</Text>}
            onPress={() => router.push(`/labs/${marker}/add?id=${item.id}`)}
          />
        ))}
      </GroupedList>

      <View style={{ marginTop: spacing.md }}>
        <Button label={t("labs.addAction")} onPress={() => router.push(`/labs/${marker}/add`)} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
