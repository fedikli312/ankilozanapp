import { useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useSymptomsHistory } from "@/features/checkIn/useSymptomsHistory";

export default function SymptomsHistoryScreen() {
  const { t } = useTranslation();
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
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("symptoms.title")}
      </Text>
      <FlatList
        data={checkIns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListRow
            label={t("symptoms.rowLabel", { pain: item.pain, fatigue: item.fatigue })}
            caption={
              item.date === today
                ? t("symptoms.todayCaption", { stiffness: t(`checkIn.stiffness.${item.morningStiffnessBucket}`) })
                : item.date
            }
            onPress={item.date === today ? () => router.push("/check-in") : undefined}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.borderHairline }} />}
      />
    </ScreenContainer>
  );
}
