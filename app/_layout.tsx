import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DatabaseProvider } from "@/db";
import { useReconciliationLifecycle } from "@/features/reconciliation/useReconciliationLifecycle";

function AppShell() {
  // Phase 17: runs reconciliation on launch and on every foreground transition (Tech Arch §G) — see the hook for the full trigger list.
  useReconciliationLifecycle();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="check-in" options={{ presentation: "modal" }} />
    </Stack>
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
