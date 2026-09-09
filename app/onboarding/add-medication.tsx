import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { MedicationForm } from "@/features/medications/MedicationForm";
import { useMedications, type CreateMedicationFormInput } from "@/features/medications/useMedications";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { getOnboardingPersonalization } from "@/features/onboarding/onboardingDraft";

/**
 * Design-C, felt chapter 5 (brief §8) — shares its progress dot with
 * Add Injection/Reminders (never advances between them): one "treatment
 * setup" chapter, optional and skippable throughout.
 */
export default function OnboardingAddMedicationScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { addMedication } = useMedications();
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Reached only via /onboarding/treatment-context. "both" chains on to Add
  // Injection next; every other path continues straight to Reminders.
  const proceed = () => {
    const { treatmentContext } = getOnboardingPersonalization();
    router.push(treatmentContext === "both" ? "/onboarding/add-injection" : "/onboarding/reminders");
  };

  const handleSubmit = async (input: CreateMedicationFormInput) => {
    setSubmitting(true);
    setSaveError(false);
    try {
      await addMedication(input);
      // A denied reminder permission still means the medication saved -
      // onboarding proceeds either way; Profile (later) is where reminder
      // status can be revisited.
      proceed();
    } catch {
      setSaveError(true);
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <OnboardingProgress step={5} />
      <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("onboarding.addMedication.title")}
      </Text>
      {saveError ? <Text style={{ color: colors.statusDanger, marginBottom: spacing.sm }}>{t("common.saveError")}</Text> : null}
      <MedicationForm onSubmit={handleSubmit} submitting={submitting} />
      <Button label={t("common.skip")} onPress={proceed} variant="secondary" />
    </ScreenContainer>
  );
}
