import { Stack } from "expo-router";
import { Platform, View, type ViewStyle } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DatabaseProvider } from "@/db";
import { useReconciliationLifecycle } from "@/features/reconciliation/useReconciliationLifecycle";

function AppShell() {
  // Phase 17: runs reconciliation on launch and on every foreground transition (Tech Arch §G) — see the hook for the full trigger list.
  useReconciliationLifecycle();

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="check-in" options={{ presentation: "modal" }} />
    </Stack>
  );

  // Dev-only visual-preview shell (Platform.OS-gated, unreachable on
  // iOS/Android): web is never a V1 production target, and without this the
  // approved iPhone-width layout stretches to fill an arbitrary desktop
  // browser window. Purely presentational — no data/architecture change.
  if (Platform.OS !== "web") return stack;

  return (
    <View style={webBackdropStyle}>
      <View style={webPhoneFrameStyle}>{stack}</View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <AppShell />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}

// react-native-web accepts plain CSS length/shorthand strings (100vh,
// box-shadow) that React Native's own ViewStyle type doesn't model — this
// branch only ever runs with Platform.OS === "web", so the cast is safe.
const webBackdropStyle = {
  flex: 1,
  minHeight: "100vh",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#D9D4CB",
} as unknown as ViewStyle;

const webPhoneFrameStyle = {
  width: "100%",
  maxWidth: 430,
  minWidth: 320,
  height: "100vh",
  maxHeight: 932,
  overflow: "hidden",
  borderRadius: 32,
  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
} as unknown as ViewStyle;
