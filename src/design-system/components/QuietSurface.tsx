import type { ReactNode } from "react";
import { View } from "react-native";

import { useTheme } from "../useTheme";

export type QuietSurfaceProps = {
  children: ReactNode;
};

/**
 * The one allowed "highlighted" fill on a screen (Design System 2.0,
 * Phase Design-B) — a warm-tinted surface with no border, no shadow,
 * reserved for the single most important moment on a screen (e.g.
 * Today's not-yet-done check-in module). Callers are responsible for
 * using this at most once per screen, same discipline `MetricCard`'s
 * existing `emphasis="highlight"` already documented — `QuietSurface` is
 * the standalone version of that same rule for non-metric content.
 */
export function QuietSurface({ children }: QuietSurfaceProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.selected,
        borderRadius: radius.standard,
        padding: spacing.md,
      }}
    >
      {children}
    </View>
  );
}
