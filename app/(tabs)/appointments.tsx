import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, DateBlock, GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { formatDateBlock, useTranslation } from "@/localization";
import { useAppointments } from "@/features/appointments/useAppointments";

export default function AppointmentsListScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { upcoming, past } = useAppointments();

  if (upcoming.length === 0 && past.length === 0) {
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

  const row = (item: (typeof upcoming)[number], emphasis: "strong" | "quiet") => {
    const block = formatDateBlock(new Date(item.date), locale);
    const typeLabel = t(`appointments.type.${item.type}`);
    const caption = item.doctorOrInstitution
      ? emphasis === "strong" && item.time
        ? `${typeLabel} · ${item.time}`
        : typeLabel
      : (item.time ?? undefined);
    return (
      <ListRow
        key={item.id}
        leading={<DateBlock day={block.day} month={block.month} emphasis={emphasis} />}
        label={item.doctorOrInstitution || typeLabel}
        caption={caption}
        onPress={() => router.push(`/appointments/${item.id}`)}
        chevron
      />
    );
  };

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("appointments.subtitle")}
      </Text>

      {/* Redesign Spec §G.3: only the nearest upcoming appointment gets
          strong emphasis — additional upcoming ones stay compact so the
          list never reads as several equally-dominant items. */}
      {upcoming.length > 0 ? (
        <GroupedList title={t("appointments.upcoming")}>
          {upcoming.map((item, index) => row(item, index === 0 ? "strong" : "quiet"))}
        </GroupedList>
      ) : null}

      {past.length > 0 ? (
        <GroupedList title={t("appointments.past")} emphasis="subordinate">
          {past.map((item) => row(item, "quiet"))}
        </GroupedList>
      ) : null}

      <View style={{ marginTop: spacing.md }}>
        <Button label={t("appointments.addAction")} onPress={() => router.push("/appointments/add")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
