import { Text, View } from "react-native";

import { spacing, typography, useTheme } from "@/design-system";

export default function FoundationPlaceholder() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
        }}
      >
        Ankilozanapp
      </Text>
      <Text
        style={{
          marginTop: spacing.xs,
          fontSize: typography.caption.fontSize,
          color: colors.textSecondary,
          textAlign: "center",
        }}
      >
        Foundation build in progress. No product screens yet.
      </Text>
    </View>
  );
}
