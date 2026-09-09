import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

/**
 * Design-H: the "coming later" export-data placeholder row was removed
 * entirely (brief §16/§22 — never a "coming soon" row for a capability
 * that isn't actually implemented). This screen is now the local-first
 * explanation plus the one real destructive action, nothing padded in
 * between.
 */
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
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.lg }}>
        {t("profile.privacyBackup")}
      </Text>

      <View style={{ marginTop: spacing.sm }}>
        <Button label={t("profile.deleteAllData")} variant="destructive" onPress={() => router.push("/profile/delete-data")} />
      </View>
    </ScreenContainer>
  );
}
