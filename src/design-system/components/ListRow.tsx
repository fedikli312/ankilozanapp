import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useTheme } from "../useTheme";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type ListRowProps = {
  label: string;
  caption?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Shows a small trailing chevron for a purely navigational row (Visual Design Spec §14). Omit when `trailing` already carries an action control. */
  chevron?: boolean;
  leading?: ReactNode;
};

/** Native iOS list-row pattern (Visual Design Spec §14) — 44pt minimum row height, hairline divider owned by the parent list. */
export function ListRow({ label, caption, trailing, onPress, accessibilityLabel, chevron, leading }: ListRowProps) {
  const { colors, typography, spacing } = useTheme();

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.sm,
        minHeight: 44,
        gap: spacing.sm,
      }}
    >
      {leading}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{label}</Text>
        {caption ? (
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }}>
            {caption}
          </Text>
        ) : null}
      </View>
      {trailing}
      {chevron ? (
        <Text style={{ fontSize: 18, color: colors.textSecondary, marginLeft: spacing.xs }} accessibilityElementsHidden>
          {"›"}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {content}
    </AccessibleTouchable>
  );
}
