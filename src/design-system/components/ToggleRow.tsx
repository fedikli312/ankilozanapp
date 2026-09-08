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
        trackColor={{ true: colors.brandPrimary, false: colors.hairline }}
        // Explicit rather than left to the platform default. Real native
        // `Switch` (iOS/Android) has one `thumbColor` for both states, so
        // this alone is the complete, correct fix there. The web dev
        // preview used for this project's live QA still shows a teal
        // "on" thumb regardless: `react-native-web`'s `Switch` reads a
        // separate, untyped `activeThumbColor` prop (not part of RN's
        // real Switch API, and absent from @types/react-native) for the
        // on-state thumb, defaulting to Material teal `#009688` when it's
        // not supplied — `thumbColor` only ever covers the off state on
        // web. Confirmed by reading `react-native-web`'s own Switch
        // source, not left as a guess. Left unfixed here deliberately:
        // it's a web-only rendering artifact with no effect on the real
        // (native) app, and "fixing" it would mean passing an untyped,
        // web-only prop RN's real Switch doesn't have.
        thumbColor={colors.surfaceElevated}
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </View>
  );
}
