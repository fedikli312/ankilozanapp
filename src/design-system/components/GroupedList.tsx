import { Children, Fragment, type ReactNode } from "react";
import { View } from "react-native";

import { useTheme } from "../useTheme";
import { SectionLabel } from "./SectionLabel";

export type GroupedListProps = {
  /** Optional uppercase section label rendered above the group (e.g. "SAĞLIK TAKİBİ"). */
  title?: string;
  /** ListRow (or ListRow-shaped) elements — a hairline divider is inserted between each. */
  children: ReactNode;
  /** Emphasis for the surface fill. "quiet" (default) is the standard grouped container; "subordinate" renders a lighter treatment for secondary/supportive content groups (Redesign Spec §8) that must never compete visually with primary health-record groups. */
  emphasis?: "quiet" | "subordinate";
};

/**
 * Native inset-grouped-list container (Redesign Spec §2.5 "card discipline" —
 * the default pattern for Track/Profile-style structured lists) — a `surface`
 * (or, for `subordinate` groups, `surfaceSecondary`) container with rounded
 * corners and a hairline divider between each row, so callers don't hand-roll
 * dividers/backgrounds per screen. Row content itself is unopinionated —
 * pass `ListRow` elements as children.
 */
export function GroupedList({ title, children, emphasis = "quiet" }: GroupedListProps) {
  const { colors, radius, spacing } = useTheme();
  const rows = Children.toArray(children).filter(Boolean);
  const subordinate = emphasis === "subordinate";

  return (
    <View style={{ marginBottom: spacing.md }}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      <View
        style={{
          backgroundColor: subordinate ? colors.surfaceSecondary : colors.surface,
          borderRadius: radius.standard,
          borderWidth: subordinate ? 0 : 1,
          borderColor: colors.borderHairline,
          paddingHorizontal: spacing.md,
          overflow: "hidden",
        }}
      >
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={{ height: 1, backgroundColor: colors.borderHairline }} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}
