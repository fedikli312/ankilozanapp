import { useRouter } from "expo-router";
import { SectionList, Text, View } from "react-native";

import { Button, DateBlock, ListRow, SectionLabel, ScreenContainer, useTheme } from "@/design-system";
import { formatDateBlock, useTranslation } from "@/localization";
import { useAppointments } from "@/features/appointments/useAppointments";

export default function AppointmentsListScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { upcoming, past } = useAppointments();

  const sections = [
    ...(upcoming.length > 0 ? [{ title: t("appointments.upcoming"), data: upcoming, emphasis: "strong" as const }] : []),
    ...(past.length > 0 ? [{ title: t("appointments.past"), data: past, emphasis: "quiet" as const }] : []),
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
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => <SectionLabel>{section.title}</SectionLabel>}
        renderItem={({ item, section }) => {
          const block = formatDateBlock(new Date(item.date), locale);
          const typeLabel = t(`appointments.type.${item.type}`);
          const caption = item.doctorOrInstitution
            ? section.emphasis === "strong" && item.time
              ? `${typeLabel} · ${item.time}`
              : typeLabel
            : item.time ?? undefined;
          return (
            <ListRow
              leading={<DateBlock day={block.day} month={block.month} emphasis={section.emphasis} />}
              label={item.doctorOrInstitution || typeLabel}
              caption={caption}
              onPress={() => router.push(`/appointments/${item.id}`)}
              chevron
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.borderHairline }} />}
      />
      <View style={{ marginTop: spacing.md }}>
        <Button label={t("appointments.addAction")} onPress={() => router.push("/appointments/add")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
