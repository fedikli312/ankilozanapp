import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, ScreenContainer, SelectableCard, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { setOnboardingPersonalization, type OnboardingGoal } from "@/features/onboarding/onboardingDraft";
import { GOAL_ICONS } from "@/features/onboarding/personalizationIcons";

const GOALS: OnboardingGoal[] = ["symptoms", "treatment", "trends", "appointments", "knowledge"];
const MAX_SELECTIONS = 3;

/**
 * Product 2.0 Phase N, step 3 — "What should we help you with most?"
 * (spec §6/§8). Optional, 1-3 selections, none preselected — same
 * optionality precedent as the V1 "what to remember" step it replaces.
 * Feeds the Personalized Summary/Value Reveal screens' copy — never
 * decorative (spec §9, Design Principle 3).
 */
export default function GoalsScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<OnboardingGoal[]>([]);

  const toggle = (goal: OnboardingGoal) => {
    setSelected((prev) => {
      if (prev.includes(goal)) return prev.filter((g) => g !== goal);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, goal];
    });
  };

  const handleContinue = () => {
    setOnboardingPersonalization({ goals: selected });
    router.push("/onboarding/priority-symptoms");
  };

  return (
    <ScreenContainer scroll>
      <OnboardingProgress step={3} />
      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
          marginBottom: spacing.xs,
        }}
      >
        {t("onboarding.goals.title")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {t("onboarding.goals.supporting")}
      </Text>
      <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
        {GOALS.map((goal) => (
          <SelectableCard
            key={goal}
            icon={GOAL_ICONS[goal]}
            label={t(`onboarding.goals.${goal}`)}
            selected={selected.includes(goal)}
            onPress={() => toggle(goal)}
          />
        ))}
      </View>
      <Button label={t("common.continue")} onPress={handleContinue} />
    </ScreenContainer>
  );
}
