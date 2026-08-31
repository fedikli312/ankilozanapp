import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, MetricCard, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";

/**
 * Static illustrative preview only (Redesign Spec §4/Phase C brief) — these
 * are fixed example values shown to explain the check-in's speed and shape.
 * Nothing here is written to any repository; no real or synthetic check-in
 * row is ever created by this screen.
 */
export default function CheckInPreviewScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <OnboardingProgress step={4} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.lg,
          }}
        >
          {t("onboarding.checkInPreview.title")}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg }}>
          <MetricCard label={t("onboarding.checkInPreview.pain")} value="4" unit="/10" />
          <MetricCard label={t("onboarding.checkInPreview.stiffness")} value="35" unit={t("onboarding.checkInPreview.minutesUnit")} />
          <MetricCard label={t("onboarding.checkInPreview.fatigue")} value="3" unit="/10" />
        </View>

        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>
          {t("onboarding.checkInPreview.supporting")}
        </Text>
      </View>
      <Button label={t("common.continue")} onPress={() => router.push("/onboarding/add-treatment")} />
    </ScreenContainer>
  );
}
