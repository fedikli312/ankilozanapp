import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Stack, useSegments } from "expo-router";
import type { PropsWithChildren } from "react";
import { ActivityIndicator, Platform, View, type ViewStyle } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useTheme } from "@/design-system";
import { DatabaseProvider } from "@/db";
import { useReconciliationLifecycle } from "@/features/reconciliation/useReconciliationLifecycle";
import { useOnboardingState } from "@/features/onboarding/useOnboardingState";
import { EntitlementProvider, useEntitlement } from "@/purchases/EntitlementProvider";
import { resolveRouteTarget } from "@/purchases/entitlementMachine";

/**
 * The one authoritative route gate (Phase Q brief §6, §34) — every route in
 * the app is a descendant of this component, so a non-entitled
 * completed-onboarding user cannot reach any protected screen via direct
 * route, back navigation, deep link, or stale navigation state: this gate
 * re-evaluates on every render, not just once at launch, and a `<Redirect>`
 * (not a hidden tab, not a per-screen check) is the only mechanism that
 * moves the user off a route the current state doesn't allow. No screen
 * anywhere else in the app performs its own entitlement check.
 */
/**
 * Routes that must stay reachable from the paywall itself while
 * not-entitled — Privacy (Phase Q brief §10, §27) — without being treated
 * as "the paywall" for the loop-prevention check below, and without
 * redirecting straight back to `/paywall` (which would make the link
 * silently broken for exactly the users who need it). Terms no longer
 * needs an in-app route — the paywall's Terms action opens Apple's own
 * Standard EULA externally (monetization-safety pass, item 3), so
 * `/paywall-terms` was removed rather than kept as dead code.
 */
const PAYWALL_ADJACENT_SEGMENTS = new Set(["paywall", "paywall-privacy"]);

function RouteGate({ children }: PropsWithChildren) {
  const { completed } = useOnboardingState();
  const entitlement = useEntitlement();
  const segments = useSegments();
  const target = resolveRouteTarget(completed, entitlement.status);
  const currentTop = segments[0] as string | undefined;

  if (target === "resolving") {
    return <ResolvingScreen />;
  }
  if (target === "onboarding" && currentTop !== "onboarding") {
    return <Redirect href="/onboarding/welcome" />;
  }
  if (target === "paywall" && !PAYWALL_ADJACENT_SEGMENTS.has(currentTop ?? "")) {
    return <Redirect href="/paywall" />;
  }
  if (target === "app" && currentTop === "paywall") {
    // An already-entitled user landing on /paywall directly (e.g. a stale
    // deep link) is sent to Today rather than shown the paywall again —
    // harmless, no data at risk, just avoids a pointless screen.
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

/**
 * Restrained launch-resolution state (Phase Q brief §29) — shown only while
 * entitlement is still `unknown`/`loading`, so an entitled user is never
 * flashed the paywall and a non-entitled user is never flashed Today while
 * resolution is in flight. No dashboard, no spinner-heavy chrome.
 */
function ResolvingScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.backgroundWarm, gap: 16 }}>
      <Ionicons name="leaf-outline" size={28} color={colors.accent} />
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

function AppShell() {
  // Phase 17: runs reconciliation on launch and on every foreground transition (Tech Arch §G) — see the hook for the full trigger list.
  useReconciliationLifecycle();

  const stack = (
    <RouteGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="check-in" options={{ presentation: "modal" }} />
        {/* No swipe-to-dismiss, no back gesture off the hard paywall (Phase Q brief §16) — reached via router.replace, so there is no prior screen to gesture back to regardless, but this is explicit rather than relied upon. */}
        <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
      </Stack>
    </RouteGate>
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
        <EntitlementProvider>
          <AppShell />
        </EntitlementProvider>
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
