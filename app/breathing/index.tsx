import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

type Practice = { title: string; duration: string; body: string };

/**
 * Read-only supportive content (Redesign Spec §J): no completion state, no
 * checkbox, no timer, no save button, no persistence. The user opens this
 * screen, reads, and leaves — nothing here is tracked.
 */
export default function BreathingScreen() {
  const { t } = useTranslation();
  const { colors, radius, spacing, typography } = useTheme();

  const practices: Practice[] = [
    {
      title: t("breathing.practice.calmBreathingTitle"),
      duration: t("breathing.practice.calmBreathingDuration"),
      body: t("breathing.practice.calmBreathingBody"),
    },
    {
      title: t("breathing.practice.postureAwarenessTitle"),
      duration: t("breathing.practice.postureAwarenessDuration"),
      body: t("breathing.practice.postureAwarenessBody"),
    },
    {
      title: t("breathing.practice.deskBreakTitle"),
      duration: t("breathing.practice.deskBreakDuration"),
      body: t("breathing.practice.deskBreakBody"),
    },
  ];

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: 2 }}>
        {t("breathing.title")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("breathing.subtitle")}
      </Text>

      {practices.map((practice) => (
        <View
          key={practice.title}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderHairline,
            borderRadius: radius.standard,
            padding: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
            <Ionicons name="leaf-outline" size={18} color={colors.textSecondary} />
            <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary, flex: 1 }}>
              {practice.title}
            </Text>
            <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{practice.duration}</Text>
          </View>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, lineHeight: 22 }}>{practice.body}</Text>
        </View>
      ))}

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: "italic" }}>
        {t("breathing.safetyNote")}
      </Text>
    </ScreenContainer>
  );
}
