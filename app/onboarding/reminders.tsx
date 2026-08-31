import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { requestNotificationPermissionAsync } from "@/notifications";

const EXAMPLE_ROWS: { key: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "medicationTimes", icon: "medical-outline" },
  { key: "injectionDates", icon: "medical-outline" },
  { key: "appointments", icon: "calendar-outline" },
];

/**
 * Explains reminders BEFORE any permission request (Redesign Spec §4 /
 * Phase C brief) — no automatic request on load. The primary CTA is the
 * one, explicit, user-initiated moment permission is requested from this
 * screen, reusing the same `requestNotificationPermissionAsync` primitive
 * every other reminder-bearing save already uses (never a separate/earlier
 * forced prompt). A denial still proceeds — the app stays fully usable.
 */
export default function RemindersScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  const proceed = () => router.push("/onboarding/add-appointment");

  const handleEnable = async () => {
    try {
      await requestNotificationPermissionAsync();
    } catch {
      // Denial or an unavailable permission API never blocks onboarding.
    }
    proceed();
  };

  return (
    <ScreenContainer>
      <OnboardingProgress step={6} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          {t("onboarding.reminders.title")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
          {t("onboarding.reminders.supporting")}
        </Text>

        {EXAMPLE_ROWS.map((row) => (
          <ListRow
            key={row.key}
            label={t(`onboarding.reminders.examples.${row.key}`)}
            leading={<Ionicons name={row.icon} size={20} color={colors.textSecondary} />}
          />
        ))}
      </View>
      <View style={{ gap: spacing.sm }}>
        <Button label={t("onboarding.reminders.enableCta")} onPress={handleEnable} />
        <Button label={t("common.later")} onPress={proceed} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
