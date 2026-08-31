import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, Chip, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
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
    // Every path now flows through the fixed check-in preview → add-treatment
    // → reminders → optional appointment → ready sequence (Redesign Spec
    // §4); the selection made here still personalizes which "add" action is
    // offered on the Add-treatment screen, it just no longer branches the
    // route taken from this screen directly.
    router.push("/onboarding/checkin-preview");
  };

  return (
    <ScreenContainer>
      <OnboardingProgress step={3} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          {t("onboarding.whatToRemember.title")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
          {t("onboarding.whatToRemember.supporting")}
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
