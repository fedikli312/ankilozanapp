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
};

/** Native iOS list-row pattern (Visual Design Spec §14) — 44pt minimum row height, hairline divider owned by the parent list. */
export function ListRow({ label, caption, trailing, onPress, accessibilityLabel }: ListRowProps) {
  const { colors, typography, spacing } = useTheme();

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.sm,
        minHeight: 44,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{label}</Text>
        {caption ? (
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }}>
            {caption}
          </Text>
        ) : null}
      </View>
      {trailing}
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
