import { Children, Fragment, type ReactNode } from "react";
import { View } from "react-native";

import { Hairline } from "./Hairline";
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
 * Native inset-grouped-list container (Redesign Spec §2.5 "card discipline").
 *
 * **Deprecated as the default for new screens (Design System 2.0, Phase
 * Design-B §10/§26).** This component's border+fill+radius "triple-
 * framing," applied to nearly every grouped section on nearly every
 * screen, is exactly what `docs/DESIGN_RESEARCH_2_0.md` §3 (item 1)
 * identified as the single largest contributor to the app's "endless
 * white cards" feeling. `Section` (`src/design-system/components/Section.tsx`)
 * is the new default — the same title + hairline-separated-rows shape,
 * with no outer box.
 *
 * `GroupedList` is NOT removed or broken — every existing screen using it
 * keeps rendering exactly as before (`docs/DESIGN_REDESIGN_PLAN_2_0.md`
 * §26's explicit "backward-compatible transition... do not break existing
 * screens" instruction), and it remains the right choice for the rare
 * case content genuinely needs a boxed/elevated treatment. New code
 * should default to `Section` and reach for `GroupedList` only when that
 * stronger visual weight is a deliberate choice, not a default.
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
          backgroundColor: subordinate ? colors.surfaceSecondary : colors.surfaceElevated,
          borderRadius: radius.standard,
          borderWidth: subordinate ? 0 : 1,
          borderColor: colors.hairline,
          paddingHorizontal: spacing.md,
          overflow: "hidden",
        }}
      >
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <Hairline /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}
