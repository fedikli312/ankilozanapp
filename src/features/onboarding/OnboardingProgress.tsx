import { View } from "react-native";

import { useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

const TOTAL_STEPS = 11;

export type OnboardingProgressProps = {
  /** 1-indexed current step, 1-11 (Product 2.0 Phase N flow — see PROJECT_MEMORY.md). */
  step: number;
};

/**
 * Subtle dot-row progress indicator (Redesign Spec Phase C brief: "small
 * progress dots... not 'Step 3 of 8' text"). The step number still exists
 * as a VoiceOver-only accessibility label so progress isn't communicated by
 * color/position alone.
 */
export function OnboardingProgress({ step }: OnboardingProgressProps) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityLabel={t("onboarding.progress.label", { step, total: TOTAL_STEPS })}
      style={{ flexDirection: "row", gap: spacing.xxs, marginBottom: spacing.lg }}
    >
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <View
          key={index}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: index + 1 === step ? colors.accent : colors.borderHairline,
          }}
        />
      ))}
    </View>
  );
}
