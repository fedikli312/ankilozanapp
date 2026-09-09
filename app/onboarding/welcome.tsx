import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AccessibleTouchable, Button, ScreenContainer, Wordmark, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";

/**
 * Welcome — Design-C, felt chapter 1 (brief §3). Merges the old Welcome +
 * Privacy screens into one: a concrete product thesis (what Ilium actually
 * organizes — check-ins, treatments, labs, visit prep — stated as one
 * sentence, never a feature checklist), one condensed local-first/privacy
 * line (replacing the old 3-item icon+checkmark list), and the "More about
 * privacy" link. No icon circle, no decorative medical illustration — the
 * `Wordmark` (Margin Mark + "Ilium") is the one brand moment on this
 * screen, used exactly once (brief §3: "Use MarginMark + Wordmark
 * sparingly").
 */
export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <OnboardingProgress step={1} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={{ marginBottom: spacing.xl }}>
          <Wordmark size="large" />
        </View>
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
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
          {t("onboarding.welcome.supporting")}
        </Text>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
          {t("onboarding.welcome.privacyLine")}
        </Text>
        <AccessibleTouchable
          onPress={() => router.push("/profile/privacy-data")}
          accessibilityRole="button"
          accessibilityLabel={t("onboarding.welcome.privacyMoreLink")}
          style={{ alignSelf: "flex-start" }}
        >
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary, fontWeight: "600" }}>
            {t("onboarding.welcome.privacyMoreLink")}
          </Text>
        </AccessibleTouchable>
      </View>
      <Button label={t("onboarding.welcome.cta")} onPress={() => router.push("/onboarding/goals")} />
    </ScreenContainer>
  );
}
