import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { formatShortDate, useTranslation } from "@/localization";
import { useSymptomsHistory } from "@/features/checkIn/useSymptomsHistory";

export default function SymptomsHistoryScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { checkIns, today } = useSymptomsHistory();

  if (checkIns.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
            {t("symptoms.emptyTitle")}
          </Text>
          <Button label={t("checkIn.title")} onPress={() => router.push("/check-in")} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("symptoms.title")}
      </Text>
      <GroupedList>
        {checkIns.map((item) => {
          const baseCaption =
            item.date === today
              ? t("symptoms.todayCaption", { stiffness: t(`checkIn.stiffness.${item.morningStiffnessBucket}`) })
              : formatShortDate(new Date(item.date), locale);
          // Phase O: compact body-area labels appended to the existing caption —
          // never a body map per row (Product 2.0 spec §18).
          const bodyAreasText = item.bodyAreas.map((area) => t(`checkIn.bodyArea.${area}`)).join(" · ");

          return (
            <ListRow
              key={item.id}
              leading={<Ionicons name="pulse-outline" size={20} color={colors.textSecondary} />}
              label={t("symptoms.rowLabel", { pain: item.pain, fatigue: item.fatigue })}
              caption={bodyAreasText ? `${baseCaption} · ${bodyAreasText}` : baseCaption}
              onPress={item.date === today ? () => router.push("/check-in") : undefined}
              chevron={item.date === today}
            />
          );
        })}
      </GroupedList>
    </ScreenContainer>
  );
}
