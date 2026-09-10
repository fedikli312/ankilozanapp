import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SectionList, Text, View } from "react-native";

import { AccessibleTouchable, ActionSheet, Hairline, useTheme } from "@/design-system";
import { formatDate, formatMonthYear, useTranslation } from "@/localization";
import { useInjectionDetail } from "@/features/injections/useInjectionDetail";
import { resolvedInjectionHistory, type InjectionAdministrationLike } from "@/features/injections/presentInjectionDetail";
import { groupByMonth } from "@/shared/groupByMonth";

/** Injection's dedicated full-history surface — same shape as Medication Detail's (brief §11), same `SectionList` + `groupByMonth` approach, no new dependency, no schema/repository/domain change. */
export default function InjectionHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const { treatment, administrations, correctAdministration } = useInjectionDetail(id);
  const [correctionTarget, setCorrectionTarget] = useState<InjectionAdministrationLike | null>(null);

  if (!treatment) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.md }}>
        <Text style={{ color: colors.textSecondary }}>{t("injections.emptyTitle")}</Text>
      </View>
    );
  }

  const resolved = resolvedInjectionHistory(administrations);
  const months = groupByMonth(resolved, (item) => item.scheduledFor);
  const sections = months.map((month) => ({
    title: formatMonthYear(new Date(`${month.monthStart}T00:00`), locale),
    data: month.items,
  }));

  const statusLabel = (status: string) => t(`injections.status.${status}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.sm }}>
        <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
          {t("injections.detail.history")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{treatment.name}</Text>
      </View>

      {sections.length === 0 ? (
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, paddingHorizontal: spacing.md }}>
          {t("injections.detail.noHistory")}
        </Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
          renderSectionHeader={({ section }) => (
            <Text
              style={{
                fontSize: typography.sectionTitle.fontSize,
                lineHeight: typography.sectionTitle.lineHeight,
                fontWeight: typography.sectionTitle.fontWeight,
                letterSpacing: typography.sectionTitle.letterSpacing,
                textTransform: typography.sectionTitle.textTransform,
                color: colors.textSecondary,
                backgroundColor: colors.background,
                marginTop: spacing.md,
                marginBottom: spacing.xs,
              }}
            >
              {section.title}
            </Text>
          )}
          ItemSeparatorComponent={Hairline}
          renderItem={({ item }) => (
            <AccessibleTouchable
              onPress={() => setCorrectionTarget(item)}
              accessibilityRole="button"
              accessibilityLabel={`${formatDate(new Date(item.scheduledFor), locale)} — ${statusLabel(item.status)}`}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm }}
            >
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>
                {formatDate(new Date(item.scheduledFor), locale)}
              </Text>
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, fontWeight: "600" }}>
                {statusLabel(item.status)}
              </Text>
            </AccessibleTouchable>
          )}
        />
      )}

      <ActionSheet
        visible={correctionTarget !== null}
        onDismiss={() => setCorrectionTarget(null)}
        title={correctionTarget ? formatDate(new Date(correctionTarget.scheduledFor), locale) : undefined}
        actions={[
          {
            label: t("injections.detail.logCompleted"),
            onPress: () => {
              if (correctionTarget) correctAdministration(correctionTarget.id, "completed");
              setCorrectionTarget(null);
            },
          },
          {
            label: t("injections.detail.logMissed"),
            onPress: () => {
              if (correctionTarget) correctAdministration(correctionTarget.id, "missed");
              setCorrectionTarget(null);
            },
          },
        ]}
      />
    </View>
  );
}
