import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { getOnboardingPersonalization } from "@/features/onboarding/onboardingDraft";
import { finishOnboarding } from "@/features/onboarding/finishOnboarding";
import { presentValueReveal } from "@/features/onboarding/presentValueReveal";
import { useOnboardingSummary } from "@/features/onboarding/useOnboardingSummary";

/**
 * Design-C, felt chapter 6 — the last onboarding screen (brief §11), merging
 * the old two-screen "Personalized Summary" + "Value Reveal" into one
 * moment: at most 3 concrete, truthful capability statements derived from
 * the real answers just given, via the pure `presentValueReveal` presenter
 * (directly unit-tested — no invented recommendation lives in this
 * component). No fake AI framing, no diagnosis, no medical-improvement
 * promise.
 */
export default function ValueRevealScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const personalization = getOnboardingPersonalization();
  const { upcomingAppointmentCount } = useOnboardingSummary();

  const outcomes = presentValueReveal(personalization, upcomingAppointmentCount > 0, t);

  const handleContinue = () => {
    // finishOnboarding() must complete (and persist) onboarding BEFORE the
    // paywall, not after — a non-entitled user who closes the app while on
    // the paywall must not be sent through onboarding again on relaunch.
    // Completing onboarding and being entitled are two independent facts.
    finishOnboarding();
    router.replace("/paywall");
  };

  return (
    <ScreenContainer>
      <OnboardingProgress step={6} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.lg,
          }}
        >
          {t("onboarding.valueReveal.title")}
        </Text>
        {outcomes.map((outcome) => (
          <ListRow key={outcome.key} label={outcome.label} />
        ))}
      </View>
      <Button label={t("onboarding.valueReveal.cta")} onPress={handleContinue} />
    </ScreenContainer>
  );
}
