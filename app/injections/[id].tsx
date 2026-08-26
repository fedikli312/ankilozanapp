import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useInjectionDetail } from "@/features/injections/useInjectionDetail";

export default function InjectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const {
    treatment,
    administrations,
    nextInjectionDate,
    logCompleted,
    logMissed,
    rescheduleBy,
    archive,
  } = useInjectionDetail(id);

  if (!treatment) {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.textSecondary }}>{t("injections.emptyTitle")}</Text>
      </ScreenContainer>
    );
  }

  const statusLabel = (status: string) => t(`injections.status.${status}`);

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {treatment.name}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {treatment.dose}
      </Text>

      {nextInjectionDate ? (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
            {t("injections.detail.nextInjection")}
          </Text>
          <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
            {nextInjectionDate}
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
            <Button label={t("injections.detail.logCompleted")} onPress={logCompleted} />
            <Button label={t("injections.detail.logMissed")} onPress={logMissed} variant="secondary" />
            <Button label="−1d" onPress={() => rescheduleBy(-1)} variant="secondary" />
            <Button label="+1d" onPress={() => rescheduleBy(1)} variant="secondary" />
          </View>
        </View>
      ) : null}

      <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
        {t("injections.detail.history")}
      </Text>
      <FlatList
        data={administrations}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => <ListRow label={item.scheduledFor} caption={statusLabel(item.status)} />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.borderHairline }} />}
      />

      <View style={{ marginTop: spacing.lg }}>
        <Button
          label={treatment.archivedAt ? t("injections.detail.archived") : t("injections.detail.archive")}
          onPress={archive}
          variant="destructive"
          disabled={!!treatment.archivedAt}
        />
      </View>
    </ScreenContainer>
  );
}
