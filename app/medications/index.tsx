import { useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useMedications } from "@/features/medications/useMedications";

export default function MedicationsListScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { medications } = useMedications();

  if (medications.length === 0) {
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
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("medications.listTitle")}
      </Text>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListRow label={item.name} caption={item.dose} onPress={() => router.push(`/medications/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.borderHairline }} />}
      />
      <View style={{ marginTop: spacing.md }}>
        <Button label={t("medications.addAction")} onPress={() => router.push("/medications/add")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
