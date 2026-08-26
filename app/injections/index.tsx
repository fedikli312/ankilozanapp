import { useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useInjections } from "@/features/injections/useInjections";

export default function InjectionsListScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { treatments } = useInjections();

  if (treatments.length === 0) {
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
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("injections.listTitle")}
      </Text>
      <FlatList
        data={treatments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListRow label={item.name} caption={item.dose} onPress={() => router.push(`/injections/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.borderHairline }} />}
      />
      <View style={{ marginTop: spacing.md }}>
        <Button label={t("injections.addAction")} onPress={() => router.push("/injections/add")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
