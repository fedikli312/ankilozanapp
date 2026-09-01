import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export type FatigueSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

const BAR_COUNT = 10;
const MIN_BAR_HEIGHT = 8;
const MAX_BAR_HEIGHT = 30;

/**
 * Phase O — fatigue selector, deliberately a different visual language from
 * `PainScale` (Product 2.0 spec: "Do NOT make Fatigue a visual clone of
 * Pain"). Ascending level bars (an energy-meter read) instead of a
 * horizontal dot-track. Preserves the exact same stored semantics as pain —
 * a plain 0–10 integer (`daily_check_in.fatigue`, no enum) — there is no
 * separate 5-level fatigue field in the schema, so this stays a true 0–10
 * control, not a bucketed one.
 *
 * A leading outline circle selects 0 explicitly (an empty-level state);
 * bars 1–10 select their own value directly. Same accessibility pattern as
 * `PainScale`/`StepperField` — one adjustable element, decorative visuals
 * hidden from the accessibility tree. Single accent fill color regardless
 * of value — no low-to-high color gradient (Visual Design Spec §3).
 */
export function FatigueSelector({ value, onChange }: FatigueSelectorProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xxs }}>
        {t("checkIn.fatigue.title")}
      </Text>
      <Text
        style={{
          fontSize: typography.metricLarge.fontSize,
          lineHeight: typography.metricLarge.lineHeight,
          fontWeight: typography.metricLarge.fontWeight,
          color: colors.textPrimary,
          marginBottom: spacing.sm,
        }}
      >
        {value}
      </Text>

      <View
        accessibilityRole="adjustable"
        accessibilityLabel={t("checkIn.fatigueLabel", { value })}
        accessibilityValue={{ min: 0, max: 10, now: value }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment" && value < 10) onChange(value + 1);
          if (event.nativeEvent.actionName === "decrement" && value > 0) onChange(value - 1);
        }}
        style={{ width: "100%", paddingHorizontal: spacing.xs }}
      >
        <View
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: MAX_BAR_HEIGHT }}
        >
          <Pressable
            onPress={() => onChange(0)}
            hitSlop={{ top: 14, bottom: 14, left: 4, right: 4 }}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              borderWidth: 1.5,
              borderColor: value === 0 ? colors.accent : colors.borderHairline,
              backgroundColor: value === 0 ? colors.accent : "transparent",
            }}
          />
          {Array.from({ length: BAR_COUNT }, (_, i) => i + 1).map((barValue) => {
            const filled = barValue <= value;
            const height = MIN_BAR_HEIGHT + ((MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * barValue) / BAR_COUNT;
            return (
              <Pressable
                key={barValue}
                onPress={() => onChange(barValue)}
                hitSlop={{ top: 14, bottom: 4, left: 3, right: 3 }}
                style={{
                  width: 14,
                  height,
                  borderRadius: radius.small / 3,
                  backgroundColor: filled ? colors.accent : colors.surfaceSecondary,
                }}
              />
            );
          })}
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: spacing.xxs, marginTop: spacing.xs }}>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{t("checkIn.fatigue.anchorNone")}</Text>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{t("checkIn.fatigue.anchorMid")}</Text>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{t("checkIn.fatigue.anchorMax")}</Text>
      </View>
    </View>
  );
}
