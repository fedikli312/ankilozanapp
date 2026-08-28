import { Text } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export default function DisclaimerScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.disclaimer")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>
        {t("profile.disclaimerBody")}
      </Text>
    </ScreenContainer>
  );
}
