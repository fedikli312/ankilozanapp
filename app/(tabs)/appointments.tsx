import { useRouter } from "expo-router";
import { SectionList, Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useAppointments } from "@/features/appointments/useAppointments";

export default function AppointmentsListScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { upcoming, past } = useAppointments();

  const sections = [
    ...(upcoming.length > 0 ? [{ title: t("appointments.upcoming"), data: upcoming }] : []),
    ...(past.length > 0 ? [{ title: t("appointments.past"), data: past }] : []),
  ];

  if (sections.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
            {t("appointments.emptyTitle")}
          </Text>
          <Button label={t("appointments.addAction")} onPress={() => router.push("/appointments/add")} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("appointments.listTitle")}
      </Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.xs }}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <ListRow
            label={item.doctorOrInstitution || t(`appointments.type.${item.type}`)}
            caption={`${t(`appointments.type.${item.type}`)} · ${item.date}${item.time ? ` · ${item.time}` : ""}`}
            onPress={() => router.push(`/appointments/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.borderHairline }} />}
      />
      <View style={{ marginTop: spacing.md }}>
        <Button label={t("appointments.addAction")} onPress={() => router.push("/appointments/add")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
