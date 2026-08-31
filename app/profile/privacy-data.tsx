import { useRouter } from "expo-router";
import { Text } from "react-native";

import { Button, GroupedList, ListRow, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
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

      <SectionLabel>{t("profile.dataGroupTitle")}</SectionLabel>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
        {t("profile.privacyBody")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.privacyBackup")}
      </Text>

      <GroupedList title={t("profile.dataManagementTitle")}>
        <ListRow label={t("profile.exportData")} caption={t("profile.exportDataComingLater")} />
      </GroupedList>

      <Button
        label={t("profile.deleteAllData")}
        variant="destructive"
        onPress={() => router.push("/profile/delete-data")}
      />
    </ScreenContainer>
  );
}
