import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";

/**
 * Choice screen only — the actual add flows are the real, existing
 * add-medication/add-injection screens (Redesign Spec §4: "reuses existing
 * forms verbatim"). Whichever one the user reaches, its own `proceed()`
 * continues on to /onboarding/reminders.
 */
export default function AddTreatmentScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <OnboardingProgress step={5} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          {t("onboarding.addTreatment.title")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
          {t("onboarding.addTreatment.supporting")}
        </Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        <Button label={t("onboarding.addTreatment.addMedication")} onPress={() => router.push("/onboarding/add-medication")} />
        <Button label={t("onboarding.addTreatment.addInjection")} onPress={() => router.push("/onboarding/add-injection")} variant="secondary" />
        <Button label={t("common.skip")} onPress={() => router.push("/onboarding/reminders")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
