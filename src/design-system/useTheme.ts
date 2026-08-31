import { Platform, useColorScheme } from "react-native";

import { darkColors, lightColors } from "./tokens/colors";
import { layout } from "./tokens/layout";
import { motion } from "./tokens/motion";
import { radius, sheetTopRadius } from "./tokens/radius";
import { spacing } from "./tokens/spacing";
import { typography } from "./tokens/typography";

/**
 * Resolves the full design-system token set for the device's current color
 * scheme (`userInterfaceStyle: "automatic"` in app.json). No theme context/
 * provider — `useColorScheme` is the single source of truth, consistent
 * with the project's no-global-store state approach (Tech Arch §K).
 *
 * Web-only exception: the dev web preview always resolves to light mode
 * regardless of the host browser/OS's own `prefers-color-scheme`, since the
 * sandboxed preview environment's OS theme isn't reliably controllable and
 * light mode is the approved primary design target (Redesign Spec §21).
 * Native iOS/Android are completely unaffected — they still read the real
 * device color scheme via `useColorScheme()` exactly as before.
 */
export function useTheme() {
  const systemScheme = useColorScheme();
  const scheme = Platform.OS === "web" ? "light" : systemScheme;
  const colors = scheme === "dark" ? darkColors : lightColors;

  return { colors, typography, spacing, radius, sheetTopRadius, motion, layout };
}
