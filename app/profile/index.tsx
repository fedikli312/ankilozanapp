import { useRouter } from "expo-router";
import { View } from "react-native";

import { ListRow, SectionLabel, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const divider = <View style={{ height: 1, backgroundColor: colors.borderHairline }} />;

  return (
    <ScreenContainer scroll>
      <SectionLabel>{t("profile.group.reminders")}</SectionLabel>
      <View>
        <ListRow label={t("profile.reminderSettings")} onPress={() => router.push("/profile/reminder-settings")} chevron />
        {divider}
        <ListRow label={t("profile.notificationPrivacy")} onPress={() => router.push("/profile/notification-privacy")} chevron />
      </View>

      <SectionLabel>{t("profile.group.preferences")}</SectionLabel>
      <View>
        <ListRow label={t("profile.language")} onPress={() => router.push("/profile/language")} chevron />
      </View>

      <SectionLabel>{t("profile.group.privacyData")}</SectionLabel>
      <View>
        <ListRow label={t("profile.privacyAndData")} onPress={() => router.push("/profile/privacy-data")} chevron />
      </View>

      <SectionLabel>{t("profile.group.about")}</SectionLabel>
      <View>
        <ListRow label={t("profile.disclaimer")} onPress={() => router.push("/profile/disclaimer")} chevron />
        {divider}
        <ListRow label={t("profile.about")} onPress={() => router.push("/profile/about")} chevron />
      </View>
    </ScreenContainer>
  );
}
