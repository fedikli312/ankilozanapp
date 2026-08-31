import { Text } from "react-native";

import { useTheme } from "../useTheme";

export type SectionLabelProps = {
  children: string;
};

/**
 * Small uppercase section header for grouped rows (Visual Design Spec §6:
 * "Section title: ~13-15 semibold, possibly uppercase") — distinct from a
 * screen's own large `Title`, used for sub-groupings like Today's "Due
 * today" or Appointments' "Upcoming"/"Past".
 */
export function SectionLabel({ children }: SectionLabelProps) {
  const { colors, spacing } = useTheme();

  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: colors.textSecondary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
      }}
    >
      {children}
    </Text>
  );
}
