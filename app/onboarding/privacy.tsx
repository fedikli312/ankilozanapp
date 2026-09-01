import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AccessibleTouchable, Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";

const REASSURANCE_KEYS = ["onDevice", "noAdsOrAnalytics", "deletableAnytime"] as const;

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <OnboardingProgress step={2} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Ionicons
          name="shield-checkmark-outline"
          size={32}
          color={colors.accent}
          style={{ marginBottom: spacing.md }}
        />
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          {t("onboarding.privacy.title")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
          {t("onboarding.privacy.body")}
        </Text>

        {REASSURANCE_KEYS.map((key) => (
          <View key={key} style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm }}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.accent} style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, fontSize: typography.body.fontSize, color: colors.textPrimary }}>
              {t(`onboarding.privacy.reassurance.${key}`)}
            </Text>
          </View>
        ))}

        <AccessibleTouchable
          onPress={() => router.push("/profile/privacy-data")}
          accessibilityRole="button"
          accessibilityLabel={t("onboarding.privacy.moreLink")}
          style={{ marginTop: spacing.sm, alignSelf: "flex-start" }}
        >
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.accent, fontWeight: "600" }}>
            {t("onboarding.privacy.moreLink")}
          </Text>
        </AccessibleTouchable>
      </View>
      <Button label={t("common.continue")} onPress={() => router.push("/onboarding/goals")} />
    </ScreenContainer>
  );
}
