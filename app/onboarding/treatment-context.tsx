import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, ScreenContainer, SelectableCard, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { setOnboardingPersonalization } from "@/features/onboarding/onboardingDraft";
import { TREATMENT_CONTEXT_ICONS } from "@/features/onboarding/personalizationIcons";
import type { TreatmentContext } from "@/repositories/onboardingStateRepository";

const OPTIONS: TreatmentContext[] = ["medication", "injection", "both", "none"];

/**
 * Product 2.0 Phase N, step 6 — replaces the old binary "Add treatment"
 * choice screen with a single-select context question (spec §9), whose
 * answer then decides which of the existing, unchanged add-medication/
 * add-injection forms (or both, chained) appear next. Non-judgmental
 * copy throughout — no "is your treatment working" framing.
 */
export default function TreatmentContextScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<TreatmentContext | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setOnboardingPersonalization({ treatmentContext: selected });
    if (selected === "medication" || selected === "both") {
      router.push("/onboarding/add-medication");
    } else if (selected === "injection") {
      router.push("/onboarding/add-injection");
    } else {
      router.push("/onboarding/reminders");
    }
  };

  return (
    <ScreenContainer>
      <OnboardingProgress step={6} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.lg,
          }}
        >
          {t("onboarding.treatmentContext.title")}
        </Text>
        <View style={{ gap: spacing.xs }}>
          {OPTIONS.map((option) => (
            <SelectableCard
              key={option}
              icon={TREATMENT_CONTEXT_ICONS[option]}
              label={t(`onboarding.treatmentContext.${option}`)}
              selected={selected === option}
              onPress={() => setSelected(option)}
            />
          ))}
        </View>
      </View>
      <Button label={t("common.continue")} onPress={handleContinue} disabled={!selected} />
    </ScreenContainer>
  );
}
