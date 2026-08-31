import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useMedications, type MedicationListRow } from "@/features/medications/useMedications";

export default function MedicationsListScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { medications, archivedMedications } = useMedications();

  const caption = (row: MedicationListRow) => {
    const parts = [row.dose, row.scheduleTimesLabel].filter(Boolean);
    return parts.length ? parts.join(" · ") : undefined;
  };

  if (medications.length === 0 && archivedMedications.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
            {t("medications.emptyTitle")}
          </Text>
          <Button label={t("medications.addAction")} onPress={() => router.push("/medications/add")} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
          marginBottom: spacing.md,
        }}
      >
        {t("medications.listTitle")}
      </Text>

      {medications.length > 0 ? (
        <GroupedList title={t("medications.sectionActive")}>
          {medications.map((row) => (
            <ListRow
              key={row.id}
              label={row.name}
              caption={caption(row)}
              onPress={() => router.push(`/medications/${row.id}`)}
              chevron
            />
          ))}
        </GroupedList>
      ) : null}

      {archivedMedications.length > 0 ? (
        <GroupedList title={t("medications.sectionArchived")} emphasis="subordinate">
          {archivedMedications.map((row) => (
            <ListRow
              key={row.id}
              label={row.name}
              caption={row.dose}
              onPress={() => router.push(`/medications/${row.id}`)}
              chevron
            />
          ))}
        </GroupedList>
      ) : null}

      <View style={{ marginTop: spacing.md }}>
        <Button label={t("medications.addAction")} onPress={() => router.push("/medications/add")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
