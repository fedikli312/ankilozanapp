import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, ScreenContainer, ToggleRow, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useDeleteAllData } from "@/features/profile/useDeleteAllData";

export default function DeleteDataScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { deleteAll, deleting } = useDeleteAllData();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleDelete = async () => {
    await deleteAll();
    router.replace("/onboarding/welcome");
  };

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.deleteDataQuestion")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.lg }}>
        {t("profile.deleteDataExplanation")}
      </Text>

      <ToggleRow
        label={t("profile.deleteDataAcknowledge")}
        value={acknowledged}
        onValueChange={setAcknowledged}
      />

      <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
        <Button
          label={deleting ? t("profile.deleteDataInProgress") : t("profile.deleteDataConfirm")}
          variant="destructive"
          disabled={!acknowledged || deleting}
          loading={deleting}
          onPress={handleDelete}
        />
        <Button label={t("profile.deleteDataCancel")} variant="secondary" disabled={deleting} onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}
