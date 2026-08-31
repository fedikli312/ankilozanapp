import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useInjections, type InjectionListRow } from "@/features/injections/useInjections";

export default function InjectionsListScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { treatments, archivedTreatments } = useInjections();

  const caption = (row: InjectionListRow) => {
    if (row.nextInjectionDate === null || row.nextInjectionDaysLeft === null) return row.dose;
    const relative =
      row.nextInjectionDaysLeft <= 0
        ? t("today.injectionDueToday")
        : t("today.injectionDaysLeft", { count: row.nextInjectionDaysLeft });
    return `${row.dose} · ${relative} · ${row.nextInjectionDate}`;
  };

  if (treatments.length === 0 && archivedTreatments.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
            {t("injections.emptyTitle")}
          </Text>
          <Button label={t("injections.addAction")} onPress={() => router.push("/injections/add")} />
        </View>
      </ScreenContainer>
    );
  }

  const icon = <Ionicons name="medical-outline" size={20} color={colors.textSecondary} />;

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
        {t("injections.listTitle")}
      </Text>

      {treatments.length > 0 ? (
        <GroupedList title={t("medications.sectionActive")}>
          {treatments.map((row) => (
            <ListRow
              key={row.id}
              leading={icon}
              label={row.name}
              caption={caption(row)}
              onPress={() => router.push(`/injections/${row.id}`)}
              chevron
            />
          ))}
        </GroupedList>
      ) : null}

      {archivedTreatments.length > 0 ? (
        <GroupedList title={t("medications.sectionArchived")} emphasis="subordinate">
          {archivedTreatments.map((row) => (
            <ListRow
              key={row.id}
              label={row.name}
              caption={row.dose}
              onPress={() => router.push(`/injections/${row.id}`)}
              chevron
            />
          ))}
        </GroupedList>
      ) : null}

      <View style={{ marginTop: spacing.md }}>
        <Button label={t("injections.addAction")} onPress={() => router.push("/injections/add")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
