import { Text, View } from "react-native";

import { useTheme } from "../useTheme";

export type MetricCardProps = {
  /** Small label above the number, e.g. "Ağrı". */
  label: string;
  /** The headline figure, e.g. "4". Rendered at the `metricLarge` type tier. */
  value: string;
  /** Short unit/context string beside the value, e.g. "/10" or "dk". */
  unit?: string;
  /** One-line supporting caption below the value, e.g. "Son 7 gün ortalaması". */
  caption?: string;
  /**
   * "surface" (default) — the standard elevated metric-card treatment.
   * "highlight" — uses the one-per-screen accent tint (Redesign Spec §2.2);
   * callers are responsible for using this on at most one card per screen.
   */
  emphasis?: "surface" | "highlight";
};

/**
 * Compact metric card (Redesign Spec §2.4/§2.5) for a single large number —
 * Today's check-in summary, Insights metric rows, a lab's latest value.
 * Deliberately minimal: one number, one optional unit, one optional caption.
 * Not wired into any screen yet (Phase B is design-system only); later
 * phases (D, H) are expected to be the first real consumers.
 */
export function MetricCard({ label, value, unit, caption, emphasis = "surface" }: MetricCardProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const highlighted = emphasis === "highlight";

  return (
    <View
      style={{
        backgroundColor: highlighted ? colors.surfaceHighlight : colors.surface,
        borderRadius: radius.standard,
        borderWidth: highlighted ? 0 : 1,
        borderColor: colors.borderHairline,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        minWidth: 120,
      }}
    >
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xxs }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text
          style={{
            fontSize: typography.metricLarge.fontSize,
            lineHeight: typography.metricLarge.lineHeight,
            fontWeight: typography.metricLarge.fontWeight,
            color: highlighted ? colors.accent : colors.textPrimary,
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text
            style={{
              fontSize: typography.micro.fontSize,
              color: colors.textSecondary,
              marginLeft: spacing.xxs,
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
      {caption ? (
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, marginTop: spacing.xxs }}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
