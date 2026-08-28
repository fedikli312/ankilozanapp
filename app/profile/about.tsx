import Constants from "expo-constants";
import { Text } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export default function AboutScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("common.appName")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>
        {t("profile.version", { version })}
      </Text>
    </ScreenContainer>
  );
}
