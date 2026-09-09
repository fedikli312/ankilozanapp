import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, ScreenContainer, Section, OptionRow, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { setOnboardingPersonalization } from "@/features/onboarding/onboardingDraft";
import type { TreatmentContext } from "@/repositories/onboardingStateRepository";

const OPTIONS: TreatmentContext[] = ["medication", "injection", "both", "none"];

/**
 * Design-C, felt chapter 4 — single-select context question, whose answer
 * decides which of the existing, unchanged add-medication/add-injection
 * forms (or both, chained) appear next as part of chapter 5. Non-judgmental
 * copy throughout — no "is your treatment working" framing. `OptionRow`
 * replaces `SelectableCard` here (brief §4: retire the icon+card template).
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
      <OnboardingProgress step={4} />
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
        <Section>
          {OPTIONS.map((option) => (
            <OptionRow
              key={option}
              label={t(`onboarding.treatmentContext.${option}`)}
              selected={selected === option}
              onPress={() => setSelected(option)}
            />
          ))}
        </Section>
      </View>
      <Button label={t("common.continue")} onPress={handleContinue} disabled={!selected} />
    </ScreenContainer>
  );
}
