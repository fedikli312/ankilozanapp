import { Text, View } from "react-native";

import { useTheme } from "../useTheme";
import { MarginMark } from "./MarginMark";

export type WordmarkProps = {
  /** "full" (default) — mark + "Ilium". "markOnly" — just the mark, for tight spaces (nav headers, small compositions). */
  variant?: "full" | "markOnly";
  size?: "large" | "medium";
};

/**
 * The restrained visual wordmark for **Ilium** (Phase Design-B §16) — no
 * custom/bundled font (`docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §6's
 * serif rule: system typography only), no tagline embedded in the mark.
 * The relationship between the Margin Mark and the name is spacing and
 * baseline alignment only — the mark sits to the left of the wordmark at
 * the wordmark's own cap-height, like a raised annotation beside a
 * headline, exactly the relationship `docs/DESIGN_DIRECTION_VALIDATION_2_0.md`
 * §4 specifies for "The Margin Mark."
 *
 * `Ilium` is the brand's working consumer name (Phase DESIGN-A2 approval)
 * — not yet a legally/trademark-cleared App Store identity; this
 * component renders the visible brand only, and has no bearing on any
 * technical identifier (bundle ID, package name, RevenueCat, App Store
 * metadata — none of which this phase touches).
 */
export function Wordmark({ variant = "full", size = "medium" }: WordmarkProps) {
  const { colors, typography, spacing } = useTheme();
  const markSize = size === "large" ? 28 : 22;
  const textStyle = size === "large" ? typography.title : typography.headline;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
      <MarginMark size={markSize} />
      {variant === "full" ? (
        <Text style={{ fontSize: textStyle.fontSize, fontWeight: textStyle.fontWeight, color: colors.textPrimary }}>
          Ilium
        </Text>
      ) : null}
    </View>
  );
}
