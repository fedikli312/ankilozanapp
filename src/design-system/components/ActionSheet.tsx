import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { useTheme } from "../useTheme";
import { sheetTopRadius } from "../tokens/radius";
import { AccessibleTouchable } from "./AccessibleTouchable";
import { Hairline } from "./Hairline";

export type ActionSheetAction = {
  label: string;
  onPress: () => void;
  /** "destructive" reuses `Button`'s destructive text color — for a genuinely destructive choice, not for "Missed" (a factual status, not a bad outcome). */
  tone?: "default" | "destructive";
};

export type ActionSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  /** A short factual heading — e.g. the record's own date/time, not a generic "Edit" title. */
  title?: string;
  actions: ActionSheetAction[];
};

/**
 * A restrained bottom action sheet — Ilium's first `Modal`-based primitive.
 * Introduced for historical-record correction (Medication/Injection Detail:
 * tap a resolved history row → this sheet → pick the corrected status)
 * rather than showing two permanent buttons on every row. Plain hairline-
 * divided rows, no icons, no color-coded options — matches the rest of the
 * design system's boxless list language, just anchored to the bottom of
 * the screen the way a native action sheet is.
 */
export function ActionSheet({ visible, onDismiss, title, actions }: ActionSheetProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      {/* Backdrop: deliberately no `accessibilityRole="button"` here — on
          web that renders as a real `<button>`, and the sheet content
          Pressable nested inside it then becomes a `<button>` inside a
          `<button>` (invalid HTML, a real DOM-validation error caught in
          live QA). Still dismissible via `onPress`; "none" is honest about
          this being a backdrop, not a labeled control. */}
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" }}
        onPress={onDismiss}
        accessibilityRole="none"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="none"
          style={{
            backgroundColor: colors.background,
            ...sheetTopRadius,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
            paddingHorizontal: spacing.md,
          }}
        >
          {title ? (
            <Text
              style={{
                fontSize: typography.caption.fontSize,
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: spacing.sm,
              }}
            >
              {title}
            </Text>
          ) : null}
          <View>
            {actions.map((action, index) => (
              <ActionRow key={action.label} action={action} isFirst={index === 0} />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ActionRow({ action, isFirst }: { action: ActionSheetAction; isFirst: boolean }): ReactNode {
  const { colors, typography, spacing } = useTheme();
  return (
    <>
      {isFirst ? null : <Hairline />}
      <AccessibleTouchable
        onPress={action.onPress}
        accessibilityRole="button"
        style={{ paddingVertical: spacing.sm, alignItems: "center", justifyContent: "center" }}
      >
        <Text
          style={{
            fontSize: typography.body.fontSize,
            color: action.tone === "destructive" ? colors.critical : colors.brandPrimary,
          }}
        >
          {action.label}
        </Text>
      </AccessibleTouchable>
    </>
  );
}
