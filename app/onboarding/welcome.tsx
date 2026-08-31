import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <OnboardingProgress step={1} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: typography.caption.fontSize,
            fontWeight: "600",
            color: colors.accent,
            marginBottom: spacing.sm,
          }}
        >
          {t("onboarding.welcome.eyebrow")}
        </Text>
        <Text
          style={{
            fontSize: typography.display.fontSize,
            fontWeight: typography.display.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.md,
          }}
        >
          {t("onboarding.welcome.title")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>
          {t("onboarding.welcome.supporting")}
        </Text>
      </View>
      <Button label={t("onboarding.welcome.cta")} onPress={() => router.push("/onboarding/privacy")} />
    </ScreenContainer>
  );
}
