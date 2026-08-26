import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../useTheme";

export type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
}>;

/** Warm background per Visual Design Spec §4/§5, safe-area aware. */
export function ScreenContainer({ children, scroll }: ScreenContainerProps) {
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>{children}</ScrollView>
      ) : (
        <View style={{ flex: 1, padding: spacing.lg }}>{children}</View>
      )}
    </SafeAreaView>
  );
}
