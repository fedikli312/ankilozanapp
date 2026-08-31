import { Text, View } from "react-native";

import { useTheme } from "../useTheme";

export type DateBlockProps = {
  /** Pre-formatted, locale-aware — e.g. "07". */
  day: string;
  /** Pre-formatted, locale-aware, short — e.g. "EYL". */
  month: string;
  /** "strong" (accent-filled) for the next/upcoming appointment; "quiet" (muted) for past ones. */
  emphasis?: "strong" | "quiet";
};

/**
 * Compact day/month date badge for appointment rows (Visual Design Spec
 * §26/§31) — a small, restrained alternative to a full date string, giving
 * the next appointment a stronger visual anchor than a plain caption line.
 */
export function DateBlock({ day, month, emphasis = "quiet" }: DateBlockProps) {
  const { colors, radius } = useTheme();
  const strong = emphasis === "strong";

  return (
    <View
      style={{
        width: 44,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        borderRadius: radius.small,
        backgroundColor: strong ? colors.surfaceHighlight : "transparent",
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "600", color: strong ? colors.accent : colors.textPrimary }}>
        {day}
      </Text>
      <Text style={{ fontSize: 11, fontWeight: "600", letterSpacing: 0.3, color: strong ? colors.accent : colors.textSecondary }}>
        {month}
      </Text>
    </View>
  );
}
