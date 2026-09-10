import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SectionList, Text, View } from "react-native";

import { AccessibleTouchable, ActionSheet, Hairline, useTheme } from "@/design-system";
import { formatMonthYear, formatShortDate, useTranslation } from "@/localization";
import { useMedicationDetail } from "@/features/medications/useMedicationDetail";
import { resolvedMedicationHistory, type MedicationAdministrationLike } from "@/features/medications/presentMedicationDetail";
import { groupByMonth } from "@/shared/groupByMonth";

/**
 * Dedicated full-history surface (Furkan-requested Medication Detail
 * restructuring, brief §6) — no route for this existed before this pass, so
 * this is a new PRESENTATIONAL route only (no schema/repository/domain
 * change; reuses `getAdministrationsForMedication` via the existing
 * `useMedicationDetail` hook exactly as Medication Detail itself does).
 * `SectionList` (RN core, no new dependency), never a `ScrollView` + `map`,
 * so this stays performant no matter how long a medication's history gets.
 * Grouped by month/year (brief §7) via the same `groupByMonth` helper
 * Timeline's own month-grouping pattern is built on — no analytics, no
 * adherence percentage, no streaks, just chronological buckets.
 */
export default function MedicationHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const { medication, administrations, markTaken, markMissed } = useMedicationDetail(id);
  const [correctionTarget, setCorrectionTarget] = useState<MedicationAdministrationLike | null>(null);

  if (!medication) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.md }}>
        <Text style={{ color: colors.textSecondary }}>{t("medications.emptyTitle")}</Text>
      </View>
    );
  }

  const resolved = resolvedMedicationHistory(administrations);
  const months = groupByMonth(resolved, (item) => item.scheduledFor);
  const sections = months.map((month) => ({
    title: formatMonthYear(new Date(`${month.monthStart}T00:00`), locale),
    data: month.items,
  }));

  const statusLabel = (status: string) => t(`medications.status.${status}`);
  const doseDateTimeLabel = (item: MedicationAdministrationLike) =>
    `${formatShortDate(new Date(item.scheduledFor.slice(0, 10)), locale)} · ${item.scheduledFor.slice(11, 16)}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.sm }}>
        <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
          {t("medications.detail.history")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{medication.name}</Text>
      </View>

      {sections.length === 0 ? (
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, paddingHorizontal: spacing.md }}>
          {t("medications.detail.noHistory")}
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
              accessibilityLabel={`${doseDateTimeLabel(item)} — ${statusLabel(item.status)}`}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm }}
            >
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, fontVariant: ["tabular-nums"] }}>
                {doseDateTimeLabel(item)}
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
        title={correctionTarget ? doseDateTimeLabel(correctionTarget) : undefined}
        actions={[
          {
            label: t("medications.detail.markTaken"),
            onPress: () => {
              if (correctionTarget) markTaken(correctionTarget.id);
              setCorrectionTarget(null);
            },
          },
          {
            label: t("medications.detail.markMissed"),
            onPress: () => {
              if (correctionTarget) markMissed(correctionTarget.id);
              setCorrectionTarget(null);
            },
          },
        ]}
      />
    </View>
  );
}
