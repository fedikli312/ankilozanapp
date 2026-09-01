import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { InjectionForm } from "@/features/injections/InjectionForm";
import { useInjections, type CreateInjectionFormInput } from "@/features/injections/useInjections";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";

export default function OnboardingAddInjectionScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { addInjection } = useInjections();
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Same fixed-flow rule as add-medication.tsx: whether reached directly
  // (treatmentContext "injection") or chained after Add Medication
  // (treatmentContext "both"), always continue to Reminders next.
  const proceed = () => {
    router.push("/onboarding/reminders");
  };

  const handleSubmit = async (input: CreateInjectionFormInput) => {
    setSubmitting(true);
    setSaveError(false);
    try {
      await addInjection(input);
      proceed();
    } catch {
      setSaveError(true);
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <OnboardingProgress step={7} />
      <Ionicons name="medical-outline" size={22} color={colors.accent} style={{ marginBottom: spacing.xs }} />
      <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("onboarding.addInjection.title")}
      </Text>
      {saveError ? <Text style={{ color: colors.statusDanger, marginBottom: spacing.sm }}>{t("common.saveError")}</Text> : null}
      <InjectionForm onSubmit={handleSubmit} submitting={submitting} />
      <Button label={t("common.skip")} onPress={proceed} variant="secondary" />
    </ScreenContainer>
  );
}
