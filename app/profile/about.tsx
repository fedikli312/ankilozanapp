import Constants from "expo-constants";
import { Text, View } from "react-native";

import { ScreenContainer, Wordmark, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export default function AboutScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScreenContainer>
      <View style={{ marginBottom: spacing.md }}>
        <Wordmark size="large" />
      </View>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.sm }}>
        {t("profile.version", { version })}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{t("profile.tagline")}</Text>
    </ScreenContainer>
  );
}
