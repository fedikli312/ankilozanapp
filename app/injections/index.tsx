import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ListRow, Section, ScreenContainer, useTheme } from "@/design-system";
import { formatShortDate, useTranslation } from "@/localization";
import { useInjections, type InjectionListRow } from "@/features/injections/useInjections";

export default function InjectionsListScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { treatments, archivedTreatments } = useInjections();

  const caption = (row: InjectionListRow) => {
    if (row.nextInjectionDate === null || row.nextInjectionDaysLeft === null) return row.dose;
    const relative =
      row.nextInjectionDaysLeft <= 0
        ? t("today.injectionDueToday")
        : t("today.injectionDaysLeft", { count: row.nextInjectionDaysLeft });
    // Design-I cross-screen rhythm fix: this previously concatenated the
    // raw `YYYY-MM-DD` storage string straight into the caption — the only
    // place left in the app showing an unformatted date instead of the
    // locale-aware `formatShortDate` every other screen uses.
    return `${row.dose} · ${relative} · ${formatShortDate(new Date(row.nextInjectionDate), locale)}`;
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
        <Section title={t("medications.sectionActive")}>
          {treatments.map((row) => (
            <ListRow
              key={row.id}
              label={row.name}
              caption={caption(row)}
              onPress={() => router.push(`/injections/${row.id}`)}
              chevron
            />
          ))}
        </Section>
      ) : null}

      {archivedTreatments.length > 0 ? (
        <Section title={t("medications.sectionArchived")}>
          {archivedTreatments.map((row) => (
            <ListRow
              key={row.id}
              label={row.name}
              caption={row.dose}
              onPress={() => router.push(`/injections/${row.id}`)}
              chevron
            />
          ))}
        </Section>
      ) : null}

      <View style={{ marginTop: spacing.md }}>
        <Button label={t("injections.addAction")} onPress={() => router.push("/injections/add")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
