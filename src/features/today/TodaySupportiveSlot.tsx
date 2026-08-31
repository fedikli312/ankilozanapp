import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AccessibleTouchable, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

/**
 * Today's single supportive-content suggestion (Redesign Spec §J). Furkan's
 * explicit preference for V1: one fixed, quiet entry point to Breathing/
 * Posture — not a rotating/randomized suggestion between Nutrition and
 * Breathing, which would need selection logic this phase deliberately
 * avoids. Positioned below all core content (check-in, medications,
 * injection, appointment) by `app/(tabs)/index.tsx`'s existing layout, and
 * styled on `surfaceSecondary` — never the dominant mint `surfaceHighlight`
 * reserved for the check-in card.
 */
export function TodaySupportiveSlot() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, radius, spacing, typography } = useTheme();

  return (
    <AccessibleTouchable
      onPress={() => router.push("/breathing")}
      accessibilityRole="button"
      accessibilityLabel={`${t("today.supportiveTitle")}, ${t("today.supportiveBreathing")}`}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.standard,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          marginBottom: spacing.md,
          gap: spacing.sm,
        }}
      >
        <Ionicons name="leaf-outline" size={18} color={colors.textSecondary} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("today.supportiveTitle")}</Text>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{t("today.supportiveBreathing")}</Text>
        </View>
        <Text style={{ fontSize: 18, color: colors.textSecondary }} accessibilityElementsHidden>
          {"›"}
        </Text>
      </View>
    </AccessibleTouchable>
  );
}
