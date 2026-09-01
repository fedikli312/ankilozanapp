import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { getOnboardingPersonalization } from "@/features/onboarding/onboardingDraft";
import { finishOnboarding } from "@/features/onboarding/finishOnboarding";
import { useOnboardingSummary } from "@/features/onboarding/useOnboardingSummary";

type Outcome = { key: "checkIn" | "treatment" | "trends" | "appointment"; icon: keyof typeof Ionicons.glyphMap };

/**
 * Product 2.0 Phase N, step 11 — "Your tracking is ready." (spec §14).
 * Last screen of Phase N. Only outcomes relevant to what the user actually
 * selected/configured are shown — "Daily tracking" is the one guaranteed
 * row, everything else is filtered against real answers/counts, never
 * padded to a fixed count (spec §9/§10). No fake AI analysis, no diagnosis,
 * no medical-improvement promise.
 */
export default function ValueRevealScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { goals, prioritySymptoms, treatmentContext } = getOnboardingPersonalization();
  const { upcomingAppointmentCount } = useOnboardingSummary();

  const outcomes: Outcome[] = [{ key: "checkIn", icon: "today-outline" }];
  if (treatmentContext !== "none" && treatmentContext !== null) outcomes.push({ key: "treatment", icon: "medical-outline" });
  else if (goals.includes("treatment")) outcomes.push({ key: "treatment", icon: "medical-outline" });
  if (goals.includes("trends") || prioritySymptoms.length > 0) outcomes.push({ key: "trends", icon: "trending-up-outline" });
  if (goals.includes("appointments") || upcomingAppointmentCount > 0) outcomes.push({ key: "appointment", icon: "calendar-outline" });

  const handleContinue = () => {
    // finishOnboarding() must complete (and persist) onboarding BEFORE the
    // paywall, not after — Phase Q brief §7: a non-entitled user who closes
    // the app while on the paywall must not be sent through onboarding
    // again on relaunch. Completing onboarding and being entitled are two
    // independent facts (spec §9); this call site is exactly the insertion
    // point Phase N left for this transition.
    finishOnboarding();
    router.replace("/paywall");
  };

  return (
    <ScreenContainer>
      <OnboardingProgress step={11} />
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
          <ListRow
            key={outcome.key}
            label={t(`onboarding.valueReveal.outcome.${outcome.key}`)}
            leading={<Ionicons name={outcome.icon} size={20} color={colors.accent} />}
          />
        ))}
      </View>
      <Button label={t("onboarding.valueReveal.cta")} onPress={handleContinue} />
    </ScreenContainer>
  );
}
