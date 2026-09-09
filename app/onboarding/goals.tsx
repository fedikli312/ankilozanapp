import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, ScreenContainer, Section, OptionRow, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { setOnboardingPersonalization, type OnboardingGoal, type PrioritySymptom } from "@/features/onboarding/onboardingDraft";

const GOALS: OnboardingGoal[] = ["symptoms", "treatment", "trends", "appointments", "knowledge"];
const SYMPTOMS: PrioritySymptom[] = ["pain", "stiffness", "fatigue", "wellbeing"];
const MAX_GOAL_SELECTIONS = 3;

/**
 * Design-C, felt chapter 2 (brief §6) — Goals and Priority Symptoms merged
 * into one coherent chapter under a single question, but stored as the
 * exact two separate, unchanged fields they always were
 * (`OnboardingPersonalization.goals`/`.prioritySymptoms`) — never merged
 * data models. Two `Section`s (no card-per-option, `OptionRow`'s boxless
 * large-text pattern throughout) under one continue action.
 */
export default function GoalsScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const [goals, setGoals] = useState<OnboardingGoal[]>([]);
  const [symptoms, setSymptoms] = useState<PrioritySymptom[]>([]);

  const toggleGoal = (goal: OnboardingGoal) => {
    setGoals((prev) => {
      if (prev.includes(goal)) return prev.filter((g) => g !== goal);
      if (prev.length >= MAX_GOAL_SELECTIONS) return prev;
      return [...prev, goal];
    });
  };

  const toggleSymptom = (symptom: PrioritySymptom) => {
    setSymptoms((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]));
  };

  const handleContinue = () => {
    setOnboardingPersonalization({ goals, prioritySymptoms: symptoms });
    router.push("/onboarding/body-regions");
  };

  return (
    <ScreenContainer scroll>
      <OnboardingProgress step={2} />
      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
          marginBottom: spacing.lg,
        }}
      >
        {t("onboarding.goals.title")}
      </Text>

      <View style={{ marginBottom: spacing.sm }}>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("onboarding.goals.supporting")}</Text>
      </View>
      <Section>
        {GOALS.map((goal) => (
          <OptionRow key={goal} label={t(`onboarding.goals.${goal}`)} selected={goals.includes(goal)} onPress={() => toggleGoal(goal)} />
        ))}
      </Section>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("onboarding.prioritySymptoms.supporting")}</Text>
      </View>
      <Section>
        {SYMPTOMS.map((symptom) => (
          <OptionRow
            key={symptom}
            label={t(`onboarding.prioritySymptoms.${symptom}`)}
            selected={symptoms.includes(symptom)}
            onPress={() => toggleSymptom(symptom)}
          />
        ))}
      </Section>

      <View style={{ marginTop: spacing.lg }}>
        <Button label={t("common.continue")} onPress={handleContinue} />
      </View>
    </ScreenContainer>
  );
}
