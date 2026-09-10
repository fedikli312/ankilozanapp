import { Text } from "react-native";

import { ListRow, Section, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

type Practice = { title: string; duration: string; body: string };

/**
 * Read-only supportive content (Redesign Spec §J): no completion state, no
 * checkbox, no timer, no save button, no persistence. The user opens this
 * screen, reads, and leaves — nothing here is tracked.
 *
 * Design-I: the old per-practice bordered/filled card (with a repeated,
 * purely decorative `leaf-outline` icon on every card) was replaced with
 * the same boxless `Section`/`ListRow` vocabulary Nutrition already uses —
 * a supportive surface should read as a subordinate part of the same
 * Ilium document language, not its own separately-styled mini-app.
 */
export default function BreathingScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useTheme();

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
      {/* Visual Craft Pass 3.1 §9: decorative HeroBloom strip removed —
          it was filler. Editorial header instead. */}
      <Text style={{ fontSize: typography.title.fontSize, lineHeight: typography.title.lineHeight, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.xs }}>
        {t("breathing.title")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, color: colors.textSecondary, marginBottom: spacing.xl }}>
        {t("breathing.subtitle")}
      </Text>

      <Section>
        {practices.map((practice) => (
          <ListRow
            key={practice.title}
            label={practice.title}
            caption={practice.body}
            trailing={<Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{practice.duration}</Text>}
          />
        ))}
      </Section>

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: "italic" }}>
        {t("breathing.safetyNote")}
      </Text>
    </ScreenContainer>
  );
}
