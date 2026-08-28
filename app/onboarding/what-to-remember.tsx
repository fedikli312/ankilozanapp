import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, Chip, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { finishOnboarding } from "@/features/onboarding/finishOnboarding";
import { setOnboardingSelection, type OnboardingSelection } from "@/features/onboarding/onboardingDraft";

const DEFAULT_SELECTION: OnboardingSelection = {
  medications: false,
  injections: false,
  appointments: false,
  symptoms: false,
};

export default function WhatToRememberScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const [selection, setSelection] = useState<OnboardingSelection>(DEFAULT_SELECTION);

  const toggle = (key: keyof OnboardingSelection) =>
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleContinue = () => {
    setOnboardingSelection(selection);

    // Symptoms has no dedicated onboarding step (the check-in sheet is
    // reached from Today itself once onboarding finishes) - the selection
    // is still recorded either way, but only Medications/Injections/
    // Appointments lead to an add step here, in that order.
    if (selection.medications) {
      router.push("/onboarding/add-medication");
      return;
    }
    if (selection.injections) {
      router.push("/onboarding/add-injection");
      return;
    }
    if (selection.appointments) {
      router.push("/onboarding/add-appointment");
      return;
    }
    finishOnboarding();
    router.replace("/");
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.headline.fontSize,
            fontWeight: typography.headline.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.lg,
          }}
        >
          {t("onboarding.whatToRemember.title")}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
          <Chip
            label={t("onboarding.whatToRemember.medications")}
            selected={selection.medications}
            onPress={() => toggle("medications")}
          />
          <Chip
            label={t("onboarding.whatToRemember.injections")}
            selected={selection.injections}
            onPress={() => toggle("injections")}
          />
          <Chip
            label={t("onboarding.whatToRemember.appointments")}
            selected={selection.appointments}
            onPress={() => toggle("appointments")}
          />
          <Chip
            label={t("onboarding.whatToRemember.symptoms")}
            selected={selection.symptoms}
            onPress={() => toggle("symptoms")}
          />
        </View>
      </View>
      <Button label={t("common.continue")} onPress={handleContinue} />
    </ScreenContainer>
  );
}
