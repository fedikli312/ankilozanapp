import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";

/**
 * Product 2.0 Phase N — premium, low-text welcome (spec §4): short headline
 * + one supporting sentence + a minimal icon composition, no body paragraph.
 */
export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <OnboardingProgress step={1} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.surfaceHighlight,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name="leaf-outline" size={28} color={colors.accent} />
        </View>
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
