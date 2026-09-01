import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export type PainScaleProps = {
  value: number;
  onChange: (value: number) => void;
};

const POSITIONS = Array.from({ length: 11 }, (_, i) => i);

/**
 * Phase O — visual 0–10 pain selector (Product 2.0 spec, "PAIN — VISUAL
 * 0–10 SELECTOR"). Preserves the exact stored 0–10 integer precision; this
 * is a visual upgrade only, never a reduction to a 5-point scale.
 *
 * A horizontal discrete track: an accent fill line behind 11 tap positions,
 * the current position rendered larger and filled, others as small outline
 * dots. Sighted users can tap any position directly; the whole control is
 * additionally exposed as a single accessibility-*adjustable* element with
 * increment/decrement actions (the individual dots are hidden from the
 * accessibility tree) — the same proven pattern `StepperField` already uses
 * elsewhere in this app, kept for consistency rather than inventing a
 * second accessibility model for one control.
 *
 * Anchor labels describe the reported *sensation* only ("None" / a neutral
 * mid-scale word / "Very intense") — never disease severity, never
 * "mild/moderate/severe" applied to the condition itself (Product 2.0 spec
 * §3, §25). No color gradient across the scale — a single accent color at
 * every value (Visual Design Spec §3: pain is never color-coded by
 * severity).
 */
export function PainScale({ value, onChange }: PainScaleProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const { t } = useTranslation();

  const fillPercent: `${number}%` = `${(value / 10) * 100}%`;

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xxs }}>
        {t("checkIn.pain.title")}
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
        accessibilityLabel={t("checkIn.painLabel", { value })}
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
          style={{ height: 28, justifyContent: "center" }}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 3,
              borderRadius: radius.small,
              backgroundColor: colors.borderHairline,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: 0,
              width: fillPercent,
              height: 3,
              borderRadius: radius.small,
              backgroundColor: colors.accent,
            }}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            {POSITIONS.map((position) => {
              const selected = position === value;
              return (
                <Pressable
                  key={position}
                  accessibilityElementsHidden
                  onPress={() => onChange(position)}
                  hitSlop={{ top: 14, bottom: 14, left: 6, right: 6 }}
                  style={{
                    width: selected ? 18 : 10,
                    height: selected ? 18 : 10,
                    borderRadius: 9,
                    backgroundColor: selected ? colors.accent : colors.surface,
                    borderWidth: selected ? 0 : 1.5,
                    borderColor: colors.borderHairline,
                  }}
                />
              );
            })}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: spacing.xxs, marginTop: spacing.xs }}>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{t("checkIn.pain.anchorNone")}</Text>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{t("checkIn.pain.anchorMid")}</Text>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{t("checkIn.pain.anchorMax")}</Text>
      </View>
    </View>
  );
}
