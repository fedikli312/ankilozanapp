import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { finishOnboarding } from "@/features/onboarding/finishOnboarding";
import { useOnboardingSummary } from "@/features/onboarding/useOnboardingSummary";

/**
 * Reads real configured state via the same repositories Today itself
 * queries (Redesign Spec §4 / Phase C brief: "never fake counts"). This is
 * the screen that actually completes onboarding.
 */
export default function ReadyScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { treatmentCount, upcomingAppointmentCount } = useOnboardingSummary();

  const lines: string[] = [];
  if (treatmentCount > 0) lines.push(t("onboarding.ready.treatmentCount", { count: treatmentCount }));
  if (upcomingAppointmentCount > 0) {
    lines.push(t("onboarding.ready.appointmentCount", { count: upcomingAppointmentCount }));
  }
  lines.push(t("onboarding.ready.checkInReady"));

  const handleFinish = () => {
    finishOnboarding();
    router.replace("/");
  };

  return (
    <ScreenContainer>
      <OnboardingProgress step={8} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.lg,
          }}
        >
          {t("onboarding.ready.title")}
        </Text>

        {lines.map((line) => (
          <Text key={line} style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.xs }}>
            {line}
          </Text>
        ))}

        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.md }}>
          {t("onboarding.ready.supporting")}
        </Text>
      </View>
      <Button label={t("onboarding.ready.cta")} onPress={handleFinish} />
    </ScreenContainer>
  );
}
