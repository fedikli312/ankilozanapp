import { Text, TextInput, View, type KeyboardTypeOptions } from "react-native";

import { useTheme } from "../useTheme";

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  errorMessage?: string;
  /** Native character cap (e.g. `CHECK_IN_NOTE_MAX_LENGTH`) — enforced by the OS text input itself. */
  maxLength?: number;
  /** Announced by VoiceOver alongside the label — e.g. a "x/400 characters" state. */
  accessibilityHint?: string;
  /** Short state line rendered under the field (e.g. a character counter). */
  helperText?: string;
};

/**
 * Visual Design Spec §11 — persistent label above the field, never
 * placeholder-only.
 *
 * Design-B audit fix (§12): the input fill previously used
 * `colors.borderHairline` — a border token borrowed for a fill role purely
 * because its old value happened to work as a subtle neutral tint. The new
 * token vocabulary has a real name for that role — `surfaceSecondary`
 * ("segmented-control track, input fill" per `colors.ts`'s own doc
 * comment) — so the field now uses that plus an explicit `hairline` border
 * for definition, instead of a border-token-as-fill workaround.
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  errorMessage,
  maxLength,
  accessibilityHint,
  helperText,
}: TextFieldProps) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text
        style={{
          fontSize: typography.caption.fontSize,
          color: colors.textSecondary,
          marginBottom: spacing.xs / 2,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        style={{
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: colors.hairline,
          borderRadius: radius.small,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          fontSize: typography.body.fontSize,
          color: colors.textPrimary,
          minHeight: 44,
        }}
      />
      {errorMessage ? (
        <Text style={{ color: colors.critical, fontSize: typography.caption.fontSize, marginTop: 4 }}>
          {errorMessage}
        </Text>
      ) : helperText ? (
        <Text
          style={{ color: colors.textSecondary, fontSize: typography.caption.fontSize, marginTop: 4 }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
