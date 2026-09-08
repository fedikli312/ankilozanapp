import { Text, View } from "react-native";

import { AccessibleTouchable, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export type StiffnessBucket = "none" | "under_15" | "15_30" | "30_60" | "over_60";

export type StiffnessSelectorProps = {
  value: StiffnessBucket;
  onChange: (value: StiffnessBucket) => void;
  /** True when the user explicitly flagged Stiffness as a priority symptom at onboarding (Phase R brief §11). */
  priorityIndicator?: boolean;
};

const BUCKETS: StiffnessBucket[] = ["none", "under_15", "15_30", "30_60", "over_60"];

/**
 * Morning stiffness selector — preserves the exact existing 5-value
 * categorical enum (`morning_stiffness_bucket`) verbatim; never converted
 * to minutes or a continuous scale, the database stores a bucket, not a
 * duration.
 *
 * Phase Design-D: visually joins the `NumericScale` family Pain/Fatigue
 * use (same cell shape, same selected-state language — filled brand color
 * + bold text, not color alone) while respecting that this is a category
 * picker, not a number (brief §13) — cells carry a label, not a digit, and
 * selection stays individually-accessible buttons rather than the
 * numeric family's single "adjustable" element, since VoiceOver users
 * navigating five named categories is more direct than adjusting a
 * slider through unclear category names. The previous per-cell icon and
 * ordinal fill-bar are retired — the cell's own fill/border/weight change
 * already carries the selected signal, and a decorative clock glyph
 * doesn't aid recognition here (Design-B icon rules §23).
 *
 * Cells wrap and allow their label to run to two lines rather than
 * truncate — required for the longer Turkish bucket labels ("15–30
 * dakika", "60 dakikadan fazla").
 */
export function StiffnessSelector({ value, onChange, priorityIndicator }: StiffnessSelectorProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs, marginBottom: spacing.sm }}>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("checkIn.stiffnessLabel")}</Text>
        {priorityIndicator ? (
          <Text style={{ fontSize: typography.micro.fontSize, color: colors.brandPrimary }}>· {t("checkIn.priorityIndicator")}</Text>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.xs }}>
        {BUCKETS.map((bucket) => {
          const selected = value === bucket;
          return (
            <AccessibleTouchable
              key={bucket}
              onPress={() => onChange(bucket)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t(`checkIn.stiffness.${bucket}`)}
              style={{
                minWidth: 64,
                minHeight: 48,
                paddingHorizontal: spacing.xs,
                paddingVertical: spacing.xs,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radius.standard,
                backgroundColor: selected ? colors.brandPrimary : "transparent",
                borderWidth: selected ? 0 : 1.5,
                borderColor: colors.hairline,
              }}
            >
              <Text
                numberOfLines={2}
                style={{
                  fontSize: typography.caption.fontSize,
                  color: selected ? colors.accentForeground : colors.textPrimary,
                  fontWeight: selected ? "700" : "400",
                  textAlign: "center",
                }}
              >
                {t(`checkIn.stiffness.${bucket}`)}
              </Text>
            </AccessibleTouchable>
          );
        })}
      </View>
    </View>
  );
}
