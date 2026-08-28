import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { db } from "../../db";
import { useTranslation } from "../../localization";
import { runReconciliation } from "./runReconciliation";

/**
 * Wires reconciliation into launch and foreground transitions (Tech Arch
 * §G). Mounted once at the app shell (app/_layout.tsx), above the router,
 * so it runs regardless of which screen the user lands on.
 */
export function useReconciliationLifecycle(): void {
  const { locale } = useTranslation();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Launch.
    runReconciliation(db, locale).catch(() => undefined);

    const subscription = AppState.addEventListener("change", (nextState) => {
      const cameToForeground = appState.current.match(/inactive|background/) && nextState === "active";
      appState.current = nextState;
      if (cameToForeground) {
        runReconciliation(db, locale).catch(() => undefined);
      }
    });

    return () => subscription.remove();
    // Deliberately re-runs if the locale changes (e.g. Profile → Language) so notification content picked up mid-session reflects it.
  }, [locale]);
}
