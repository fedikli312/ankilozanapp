import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text } from "react-native";

import { GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useProfile } from "@/features/profile/useProfile";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { notificationDetailOptIn, languageOverride } = useProfile();

  return (
    <ScreenContainer scroll>
      {/* Redesign Spec §I.11: one restrained local-first trust signal, not
          repeated on every settings screen, and no absolute security claim. */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("profile.localFirstTrust")}
      </Text>

      <GroupedList title={t("profile.group.reminders")}>
        <ListRow
          leading={<Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.reminderSettings")}
          onPress={() => router.push("/profile/reminder-settings")}
          chevron
        />
        <ListRow
          leading={<Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.notificationPrivacy")}
          caption={t(notificationDetailOptIn ? "common.on" : "common.off")}
          onPress={() => router.push("/profile/notification-privacy")}
          chevron
        />
      </GroupedList>

      <GroupedList title={t("profile.group.preferences")}>
        <ListRow
          leading={<Ionicons name="language-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.language")}
          caption={languageOverride ? t(`profile.languageOption.${languageOverride}`) : t("profile.languageSystem")}
          onPress={() => router.push("/profile/language")}
          chevron
        />
      </GroupedList>

      <GroupedList title={t("profile.group.privacyData")}>
        <ListRow
          leading={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.privacyAndData")}
          onPress={() => router.push("/profile/privacy-data")}
          chevron
        />
      </GroupedList>

      <GroupedList title={t("profile.group.about")}>
        <ListRow
          leading={<Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.disclaimer")}
          onPress={() => router.push("/profile/disclaimer")}
          chevron
        />
        <ListRow
          leading={<Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.about")}
          onPress={() => router.push("/profile/about")}
          chevron
        />
      </GroupedList>
    </ScreenContainer>
  );
}
