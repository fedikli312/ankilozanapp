import { useRouter } from "expo-router";
import { Text } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export default function PrivacyDataScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.privacyAndData")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.privacyBody")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.lg }}>
        {t("profile.privacyBackup")}
      </Text>

      <ListRow label={t("profile.exportData")} caption={t("profile.exportDataComingLater")} />

      <Button
        label={t("profile.deleteAllData")}
        variant="destructive"
        onPress={() => router.push("/profile/delete-data")}
      />
    </ScreenContainer>
  );
}
