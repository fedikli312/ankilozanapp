import { Text, View } from "react-native";

import { AccessibleTouchable, radius, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export type StiffnessBucket = "none" | "under_15" | "15_30" | "30_60" | "over_60";

export type StiffnessSelectorProps = {
  value: StiffnessBucket;
  onChange: (value: StiffnessBucket) => void;
  /** True when the user explicitly flagged Stiffness as a priority symptom at onboarding (Phase R brief §11). */
  priorityIndicator?: boolean;
};

const BUCKETS: StiffnessBucket[] = ["none", "under_15", "15_30", "30_60", "over_60"];
/** Selected marker is a solid accent dot; unselected is a smaller, quiet neutral dot — a bullet, deliberately NOT a hollow radio ring (Visual Craft Pass 3.1 §12). */
const MARKER_SELECTED = 9;
const MARKER_UNSELECTED = 5;

/**
 * Morning stiffness selector — preserves the exact existing 5-value
 * categorical enum (`morning_stiffness_bucket`) verbatim; never converted
 * to minutes or a continuous scale, the database stores a bucket, not a
 * duration.
 *
 * Redesigned a second time (Furkan-requested follow-up): stiffness is
 * categorical, not continuous, so it deliberately does NOT try to look
 * like the new Pain/Fatigue slider's track-and-thumb grammar.
 *
 * Visual Craft Pass 3.1 (`docs/VISUAL_CRAFT_PASS_3_1.md` §12): the earlier
 * hairline `Section` list read like a form's radio group. Replaced with a
 * short column of soft-cornered rows separated by whitespace, where
 * selection is a tier-1 tonal band (`colors.selected` behind the row —
 * no border, no shadow) plus the existing leading dot + text-weight
 * change, so the choice is never signalled by colour alone and the whole
 * control reads as a considered set of options rather than a list of
 * inputs. Every row still clears 44pt; the five stored buckets are
 * unchanged.
 */
export function StiffnessSelector({ value, onChange, priorityIndicator }: StiffnessSelectorProps) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs, marginBottom: spacing.sm }}>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{t("checkIn.stiffnessLabel")}</Text>
        {priorityIndicator ? (
          <Text style={{ fontSize: typography.micro.fontSize, color: colors.brandPrimary }}>· {t("checkIn.priorityIndicator")}</Text>
        ) : null}
      </View>

      <View style={{ gap: spacing.xxs }}>
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
                flexDirection: "row",
                alignItems: "center",
                minHeight: 44,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.sm,
                borderRadius: radius.small,
                gap: spacing.sm,
                backgroundColor: selected ? colors.selected : "transparent",
              }}
            >
              <View style={{ width: MARKER_SELECTED, alignItems: "center" }}>
                <View
                  style={{
                    width: selected ? MARKER_SELECTED : MARKER_UNSELECTED,
                    height: selected ? MARKER_SELECTED : MARKER_UNSELECTED,
                    borderRadius: MARKER_SELECTED / 2,
                    backgroundColor: selected ? colors.brandPrimary : colors.borderStrong,
                  }}
                />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: typography.body.fontSize,
                  fontWeight: selected ? "700" : "400",
                  color: selected ? colors.brandPrimary : colors.textPrimary,
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
