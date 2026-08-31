import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { MedicationForm } from "@/features/medications/MedicationForm";
import { useMedications, type CreateMedicationFormInput } from "@/features/medications/useMedications";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";

export default function OnboardingAddMedicationScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { addMedication } = useMedications();
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Redesign Spec §4: the Add-treatment choice screen offers one action at a
  // time — after adding (or skipping) here, onboarding always continues to
  // the Reminder-explanation step next, regardless of the earlier
  // "what to remember" selection.
  const proceed = () => {
    router.push("/onboarding/reminders");
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
