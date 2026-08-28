import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, TrendChart, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useLabResults, type LabMarker } from "@/features/labs/useLabResults";

export default function LabMarkerHistoryScreen() {
  const { marker } = useLocalSearchParams<{ marker: LabMarker }>();
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { results, latest } = useLabResults(marker);

  const chartPoints = results
    .slice()
    .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate))
    .map((r) => ({ label: r.recordedDate.slice(5), value: r.value }));

  const values = results.map((r) => r.value);
  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.sm }}>
        {t(`labs.marker.${marker}`)}
      </Text>

      {results.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
            {t("labs.emptyTitle", { marker: t(`labs.marker.${marker}`) })}
          </Text>
          <Button label={t("labs.addAction")} onPress={() => router.push(`/labs/${marker}/add`)} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.md }}>
              {latest ? (
                <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
                  {t("labs.latest", { value: latest.value, unit: latest.unit, date: latest.recordedDate })}
                </Text>
              ) : null}
              {min !== null && max !== null && results.length > 1 ? (
                <>
                  <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
                    {t("labs.rangeSummary", { min, max, unit: latest?.unit ?? "", count: results.length })}
                  </Text>
                  <TrendChart
                    points={chartPoints}
                    accessibilityLabel={t("labs.rangeSummary", { min, max, unit: latest?.unit ?? "", count: results.length })}
                  />
                </>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <ListRow
              label={`${item.value} ${item.unit}`}
              caption={item.recordedDate}
              onPress={() => router.push(`/labs/${marker}/add?id=${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.borderHairline }} />}
        />
      )}

      {results.length > 0 ? (
        <View style={{ marginTop: spacing.md }}>
          <Button label={t("labs.addAction")} onPress={() => router.push(`/labs/${marker}/add`)} variant="secondary" />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
