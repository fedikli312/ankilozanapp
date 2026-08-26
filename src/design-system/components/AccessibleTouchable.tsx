import { type ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";

import { layout } from "../tokens/layout";
import { motion } from "../tokens/motion";

type Props = ComponentProps<typeof Pressable>;

/**
 * Baseline accessible touchable: enforces the 44x44pt minimum touch target
 * (spec §27) and a single Tier-1 opacity response (spec §10, §28) — no
 * bounce/scale, no shadow. Feature components (buttons, chips, list rows)
 * compose their own visuals on top of this rather than each re-deriving the
 * touch-target and feedback rules independently.
 */
export function AccessibleTouchable({ style, ...props }: Props) {
  return (
    <Pressable
      style={(state) => [
        styles.minTarget,
        state.pressed && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  minTarget: {
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
  },
  pressed: {
    opacity: 0.6,
  },
});

export const TIER_1_FEEDBACK_MS = motion.tier1Feedback.maxMs;
