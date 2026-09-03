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
  /**
   * Tighter padding for dense multi-card rows (Phase S fix, e.g. Today's
   * 3-up check-in summary at 390px) — same tokens, smaller step. Default
   * padding is unchanged for existing 1–2 card layouts.
   */
  compact?: boolean;
};

/**
 * Compact metric card (Redesign Spec §2.4/§2.5) for a single large number —
 * Today's check-in summary, Insights metric rows, a lab's latest value.
 * Deliberately minimal: one number, one optional unit, one optional caption.
 * Not wired into any screen yet (Phase B is design-system only); later
 * phases (D, H) are expected to be the first real consumers.
 */
export function MetricCard({ label, value, unit, caption, emphasis = "surface", compact = false }: MetricCardProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const highlighted = emphasis === "highlight";
  // A value longer than a couple of digits (e.g. a stiffness bucket phrase
  // like "15–30 dk" instead of a number) never fits the big metric
  // treatment without overflowing a dense multi-card row — step down one
  // typography tier instead (Phase S fix for Today's completed-check-in
  // summary; existing token, no new one added).
  const valueTypography = value.length > 4 ? typography.headline : typography.metricLarge;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: highlighted ? colors.surfaceHighlight : colors.surface,
        borderRadius: radius.standard,
        borderWidth: highlighted ? 0 : 1,
        borderColor: colors.borderHairline,
        paddingVertical: compact ? spacing.sm : spacing.md,
        paddingHorizontal: compact ? spacing.sm : spacing.md,
        minWidth: compact ? 0 : 120,
        // Fixed in compact mode so a two-line label (e.g. "Sabah
        // tutukluğu") never makes its card taller than its neighbors —
        // wraps instead of truncating, height still stays uniform across
        // the row (Phase S fix).
        minHeight: compact ? 96 : undefined,
      }}
    >
      <Text numberOfLines={2} style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xxs }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={{
            fontSize: valueTypography.fontSize,
            lineHeight: valueTypography.lineHeight,
            fontWeight: valueTypography.fontWeight,
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
        <Text numberOfLines={1} style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, marginTop: spacing.xxs }}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
