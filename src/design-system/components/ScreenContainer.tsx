import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../useTheme";

export type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
}>;

/**
 * The standard screen wrapper (Design System 2.0, Phase Design-B §20) —
 * warm canvas background, safe-area aware, consistent horizontal page
 * margin (`layout.pageMargin`), and extra bottom clearance on scrollable
 * screens so content never sits flush against the tab bar/home indicator
 * (`layout.bottomClearance`, added on top of `SafeAreaView`'s own inset,
 * not a replacement for it). Provides structure only — it does not
 * impose a heading shape or force every screen into the same
 * composition; each screen still owns its own title/heading treatment.
 */
export function ScreenContainer({ children, scroll }: ScreenContainerProps) {
  const { colors, spacing, layout } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: layout.pageMargin,
            paddingTop: spacing.lg,
            paddingBottom: spacing.lg + layout.bottomClearance,
          }}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: layout.pageMargin, paddingTop: spacing.lg, paddingBottom: spacing.lg }}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
