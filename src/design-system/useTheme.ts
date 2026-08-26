import { useColorScheme } from "react-native";

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
 */
export function useTheme() {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkColors : lightColors;

  return { colors, typography, spacing, radius, sheetTopRadius, motion, layout };
}
