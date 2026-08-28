import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.title")}
      </Text>
      <View>
        <ListRow label={t("profile.reminderSettings")} onPress={() => router.push("/profile/reminder-settings")} />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow label={t("profile.notificationPrivacy")} onPress={() => router.push("/profile/notification-privacy")} />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow label={t("profile.language")} onPress={() => router.push("/profile/language")} />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow label={t("profile.privacyAndData")} onPress={() => router.push("/profile/privacy-data")} />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow label={t("profile.disclaimer")} onPress={() => router.push("/profile/disclaimer")} />
        <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        <ListRow label={t("profile.about")} onPress={() => router.push("/profile/about")} />
      </View>
    </ScreenContainer>
  );
}
