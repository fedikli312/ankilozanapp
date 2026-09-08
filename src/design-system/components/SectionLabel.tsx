import { Text } from "react-native";

import { useTheme } from "../useTheme";

export type SectionLabelProps = {
  children: string;
};

/**
 * Small uppercase section header for grouped rows (Visual Design Spec §6:
 * "Section title: ~13-15 semibold, possibly uppercase") — distinct from a
 * screen's own large `Title`, used for sub-groupings like Today's "Due
 * today" or Appointments' "Upcoming"/"Past". Realizes the `SectionTitle`
 * typography role (Design System 2.0, Phase Design-B) — the size/weight/
 * letter-spacing/uppercase treatment now lives in `typography.sectionTitle`
 * itself rather than being hand-rolled here, so any other component
 * wanting the same "SectionTitle" voice (e.g. `Section`) reads it from
 * the same token instead of re-declaring the values.
 */
export function SectionLabel({ children }: SectionLabelProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <Text
      style={{
        fontSize: typography.sectionTitle.fontSize,
        lineHeight: typography.sectionTitle.lineHeight,
        fontWeight: typography.sectionTitle.fontWeight,
        letterSpacing: typography.sectionTitle.letterSpacing,
        textTransform: typography.sectionTitle.textTransform,
        color: colors.textSecondary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
      }}
    >
      {children}
    </Text>
  );
}
