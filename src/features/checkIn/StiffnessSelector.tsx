import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { AccessibleTouchable, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export type StiffnessBucket = "none" | "under_15" | "15_30" | "30_60" | "over_60";

export type StiffnessSelectorProps = {
  value: StiffnessBucket;
  onChange: (value: StiffnessBucket) => void;
};

/** Relative fill width per bucket — ordinal only, never an implied minute count (Product 2.0 spec: "no diagnostic interpretation"). */
const FILL_PERCENT: Record<StiffnessBucket, number> = {
  none: 0,
  under_15: 25,
  "15_30": 50,
  "30_60": 75,
  over_60: 100,
};

const BUCKETS: StiffnessBucket[] = ["none", "under_15", "15_30", "30_60", "over_60"];

/**
 * Phase O — visual segmented stiffness selector, replacing the plain Chip
 * row. Preserves the exact existing 5-value categorical enum
 * (`morning_stiffness_bucket`) verbatim — never converted to minutes; the
 * database stores a bucket, not a duration.
 *
 * Each segment: a clock-style icon, the existing `checkIn.stiffness.*`
 * label, and a small relative fill bar (ordinal position within the 5
 * buckets, not a literal duration render) as the "compact duration
 * visualization." `none` gets a distinct affirming icon rather than an
 * empty clock face.
 */
export function StiffnessSelector({ value, onChange }: StiffnessSelectorProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
        {t("checkIn.stiffnessLabel")}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
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
                width: 82,
                alignItems: "center",
                paddingVertical: spacing.xs,
                borderRadius: radius.small,
                borderWidth: 1,
                borderColor: selected ? colors.accent : colors.borderHairline,
                backgroundColor: selected ? colors.surfaceHighlight : colors.surface,
              }}
            >
              <Ionicons
                name={bucket === "none" ? "checkmark-circle-outline" : "time-outline"}
                size={18}
                color={selected ? colors.accent : colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: typography.micro.fontSize,
                  color: selected ? colors.accent : colors.textPrimary,
                  fontWeight: selected ? "600" : "400",
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                {t(`checkIn.stiffness.${bucket}`)}
              </Text>
              <View style={{ width: "80%", height: 3, borderRadius: 2, backgroundColor: colors.borderHairline, marginTop: spacing.xxs, overflow: "hidden" }}>
                <View style={{ width: `${FILL_PERCENT[bucket]}%`, height: "100%", backgroundColor: selected ? colors.accent : colors.borderHairline }} />
              </View>
            </AccessibleTouchable>
          );
        })}
      </View>
    </View>
  );
}
