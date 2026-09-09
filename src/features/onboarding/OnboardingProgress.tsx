import { View } from "react-native";

import { useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

/**
 * Design-C's 6 FELT chapters (brief §2/§5) — Welcome, Goals+Priority
 * Symptoms (merged), Body Regions, Treatment Context, Treatment setup +
 * Reminders (one chapter — `add-medication`/`add-injection`/`reminders`
 * share this dot rather than each advancing it), Value Reveal (merged
 * Personalized Summary + Value Reveal). The hard paywall that follows is
 * its own distinct, un-dotted screen — a different kind of moment
 * (commercial, not a personalization question), matching its own existing
 * lack of a progress indicator. Technical route count stays higher than 6
 * (11→9 routes: `privacy.tsx`/`priority-symptoms.tsx`/`personalized-summary.tsx`
 * removed, `add-appointment.tsx` removed) — the brief explicitly allows this
 * ("technical route count may remain larger if necessary").
 */
const TOTAL_STEPS = 6;

export type OnboardingProgressProps = {
  /** 1-indexed current chapter, 1-6. */
  step: number;
};

/**
 * Subtle dot-row progress indicator — unchanged visual language from
 * Product 2.0 Phase N (small dots, no "Step X of Y" text, no percentage).
 * The step number still exists as a VoiceOver-only accessibility label so
 * progress isn't communicated by color/position alone.
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
            backgroundColor: index + 1 === step ? colors.brandPrimary : colors.hairline,
          }}
        />
      ))}
    </View>
  );
}
