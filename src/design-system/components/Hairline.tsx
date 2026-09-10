import { View } from "react-native";

import { useTheme } from "../useTheme";

/**
 * A single 1px divider — Design System 2.0's replacement for the border+
 * fill+radius triple-framing `GroupedList` (deleted Design-I — zero
 * remaining consumers once every screen migrated to `Section`) used
 * everywhere (Design-A2's
 * "minimal bordered containers, using whitespace + typography + hairlines"
 * visual signature). Used directly by `Section`, and available standalone
 * wherever a screen needs one plain division without a full container.
 */
export function Hairline() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.hairline }} />;
}
