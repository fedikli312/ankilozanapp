import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { getOnboardingPersonalization } from "@/features/onboarding/onboardingDraft";
import { useOnboardingSummary } from "@/features/onboarding/useOnboardingSummary";
import { GOAL_ICONS, PRIORITY_SYMPTOM_ICONS } from "@/features/onboarding/personalizationIcons";

/**
 * Product 2.0 Phase N, step 10 — "We've set this up for you." (spec §13).
 * Reflects only real answers (goals/priority symptoms actually selected)
 * and real configured state (treatment/appointment counts via the same
 * repositories Today itself queries, `useOnboardingSummary`) — no invented
 * recommendation, no "AI analyzed your answers" framing, no empty section
 * rendered when nothing qualifies (spec §9/§10, Design Principle 3).
 */
export default function PersonalizedSummaryScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { goals, prioritySymptoms, treatmentContext } = getOnboardingPersonalization();
  const { upcomingAppointmentCount } = useOnboardingSummary();

  const priorities = [
    ...prioritySymptoms.map((s) => ({ key: s, icon: PRIORITY_SYMPTOM_ICONS[s], label: t(`onboarding.prioritySymptoms.${s}`) })),
    ...goals.map((g) => ({ key: g, icon: GOAL_ICONS[g], label: t(`onboarding.goals.${g}`) })),
  ];

  const showTreatmentReminders = treatmentContext !== "none" && treatmentContext !== null;
  const showAppointmentPrep = goals.includes("appointments") || upcomingAppointmentCount > 0;

  return (
    <ScreenContainer scroll>
      <OnboardingProgress step={10} />
      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
          marginBottom: spacing.lg,
        }}
      >
        {t("onboarding.personalizedSummary.title")}
      </Text>

      {priorities.length > 0 ? (
        <View style={{ marginBottom: spacing.lg }}>
          <SectionLabel>{t("onboarding.personalizedSummary.prioritiesHeading")}</SectionLabel>
          {priorities.map((item) => (
            <ListRow
              key={item.key}
              label={item.label}
              leading={<Ionicons name={item.icon} size={20} color={colors.accent} />}
            />
          ))}
        </View>
      ) : null}

      <View style={{ marginBottom: spacing.lg }}>
        <SectionLabel>{t("onboarding.personalizedSummary.setupHeading")}</SectionLabel>
        <ListRow label={t("onboarding.personalizedSummary.checkInReady")} leading={<Ionicons name="today-outline" size={20} color={colors.textSecondary} />} />
        {showTreatmentReminders ? (
          <ListRow
            label={t("onboarding.personalizedSummary.treatmentReminders")}
            leading={<Ionicons name="medical-outline" size={20} color={colors.textSecondary} />}
          />
        ) : null}
        {showAppointmentPrep ? (
          <ListRow
            label={t("onboarding.personalizedSummary.appointmentPrep")}
            leading={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          />
        ) : null}
      </View>

      <Button label={t("onboarding.personalizedSummary.cta")} onPress={() => router.push("/onboarding/value-reveal")} />
    </ScreenContainer>
  );
}
