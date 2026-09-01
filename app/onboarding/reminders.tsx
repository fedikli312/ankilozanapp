import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, ScreenContainer, ToggleRow, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { getOnboardingPersonalization, setOnboardingPersonalization } from "@/features/onboarding/onboardingDraft";
import { requestNotificationPermissionAsync } from "@/notifications";

/**
 * Product 2.0 Phase N, step 8 — visual per-category reminder intent (spec
 * §11), replacing the single generic "Enable" button. No permission request
 * on load (unchanged rule) — the one, explicit, user-initiated request
 * fires from Continue, and only if at least one toggle is on. A denial
 * still proceeds; the app stays fully usable either way. Medication/
 * injection toggles only show when relevant to the treatment context just
 * chosen — never an empty-feeling row for a treatment the user doesn't
 * have. These toggles are intent only: they don't change the medication/
 * injection forms' own existing "Remind me" default (unchanged, out of
 * scope for Phase N).
 */
export default function RemindersScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { treatmentContext } = getOnboardingPersonalization();

  const showMedication = treatmentContext === "medication" || treatmentContext === "both";
  const showInjection = treatmentContext === "injection" || treatmentContext === "both";

  const [medications, setMedications] = useState(true);
  const [injections, setInjections] = useState(true);
  const [appointments, setAppointments] = useState(true);

  const proceed = () => router.push("/onboarding/add-appointment");

  const handleContinue = async () => {
    const reminderIntent = { medications: showMedication && medications, injections: showInjection && injections, appointments };
    setOnboardingPersonalization({ reminderIntent });
    if (reminderIntent.medications || reminderIntent.injections || reminderIntent.appointments) {
      try {
        await requestNotificationPermissionAsync();
      } catch {
        // Denial or an unavailable permission API never blocks onboarding.
      }
    }
    proceed();
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
            marginBottom: spacing.xs,
          }}
        >
          {t("onboarding.reminders.title")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
          {t("onboarding.reminders.supporting")}
        </Text>

        {showMedication ? (
          <ToggleRow label={t("onboarding.reminders.medications")} value={medications} onValueChange={setMedications} />
        ) : null}
        {showInjection ? (
          <ToggleRow label={t("onboarding.reminders.injections")} value={injections} onValueChange={setInjections} />
        ) : null}
        <ToggleRow label={t("onboarding.reminders.appointments")} value={appointments} onValueChange={setAppointments} />
      </View>
      <Button label={t("onboarding.reminders.enableCta")} onPress={handleContinue} />
    </ScreenContainer>
  );
}
