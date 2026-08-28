import { Text } from "react-native";

import { ScreenContainer, ToggleRow, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useProfile } from "@/features/profile/useProfile";

export default function NotificationPrivacyScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const { notificationDetailOptIn, setNotificationDetailOptIn } = useProfile();

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.notificationPrivacy")}
      </Text>
      <ToggleRow
        label={t("profile.showDetailsToggle")}
        description={t("profile.showDetailsDescription")}
        value={notificationDetailOptIn}
        onValueChange={setNotificationDetailOptIn}
      />
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.lg }}>
        {t("profile.showDetailsNote")}
      </Text>
    </ScreenContainer>
  );
}
