import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, ScreenContainer, SelectableCard, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { setOnboardingPersonalization, type PrioritySymptom } from "@/features/onboarding/onboardingDraft";
import { PRIORITY_SYMPTOM_ICONS } from "@/features/onboarding/personalizationIcons";

const SYMPTOMS: PrioritySymptom[] = ["pain", "stiffness", "fatigue", "wellbeing"];

/**
 * Product 2.0 Phase N, step 4 — "What matters most to track?" (spec §6/§8).
 * Multi-select, optional, no cap (unlike Goals — these map 1:1 onto the
 * existing check-in fields, so selecting all four is a perfectly normal
 * answer). Feeds Today's within-tier emphasis later (Phase R) and this
 * flow's own Personalized Summary/Value Reveal screens now.
 */
export default function PrioritySymptomsScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<PrioritySymptom[]>([]);

  const toggle = (symptom: PrioritySymptom) => {
    setSelected((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]));
  };

  const handleContinue = () => {
    setOnboardingPersonalization({ prioritySymptoms: selected });
    router.push("/onboarding/body-regions");
  };

  return (
    <ScreenContainer scroll>
      <OnboardingProgress step={4} />
      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
          marginBottom: spacing.xs,
        }}
      >
        {t("onboarding.prioritySymptoms.title")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {t("onboarding.prioritySymptoms.supporting")}
      </Text>
      <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
        {SYMPTOMS.map((symptom) => (
          <SelectableCard
            key={symptom}
            icon={PRIORITY_SYMPTOM_ICONS[symptom]}
            label={t(`onboarding.prioritySymptoms.${symptom}`)}
            selected={selected.includes(symptom)}
            onPress={() => toggle(symptom)}
          />
        ))}
      </View>
      <Button label={t("common.continue")} onPress={handleContinue} />
    </ScreenContainer>
  );
}
