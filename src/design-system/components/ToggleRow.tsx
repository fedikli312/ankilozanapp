import { Switch, Text, View } from "react-native";

import { useTheme } from "../useTheme";

export type ToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function ToggleRow({ label, description, value, onValueChange }: ToggleRowProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
      }}
    >
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{label}</Text>
        {description ? (
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.accent, false: colors.borderHairline }}
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </View>
  );
}
