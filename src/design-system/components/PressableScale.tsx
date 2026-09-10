import { useState, type ReactNode } from "react";
import { Animated, type AccessibilityRole, type StyleProp, type ViewStyle } from "react-native";

import { motion } from "../tokens/motion";
import { useReducedMotion } from "../useReducedMotion";
import { AccessibleTouchable } from "./AccessibleTouchable";

export type PressableScaleProps = {
  children: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  /** How much the content shrinks on press — brief's own "~0.98–0.99" range (Art Direction 3.0 §14/§10). Default 0.98. */
  scaleTo?: number;
};

/**
 * Art Direction 3.0 (`docs/VISUAL_ART_DIRECTION_3_0.md` §14) — the one new
 * shared interaction primitive this pass introduced: a restrained press-
 * scale response for the handful of "hero" pressable moments the brief
 * asked for (a featured article card, a composed-preview element) that
 * `AccessibleTouchable`'s existing opacity-only feedback doesn't quite
 * carry weight for on its own. Built ON TOP of `AccessibleTouchable`
 * (same 44pt floor, same opacity response) — this only adds a subtle
 * `transform: scale` on top, using the `selection` motion tier and the
 * native driver (a transform-only animation, unlike `BodyRegionMap`'s SVG-
 * opacity case, which cannot use it). Reduce Motion disables the scale
 * entirely — the touchable itself, and its opacity feedback, still work.
 */
export function PressableScale({ children, onPress, style, accessibilityRole, accessibilityLabel, scaleTo = 0.98 }: PressableScaleProps) {
  const reducedMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));

  const animateTo = (toValue: number) => {
    if (reducedMotion) return;
    Animated.timing(scale, {
      toValue,
      duration: motion.selection.minMs,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AccessibleTouchable
      onPress={onPress}
      onPressIn={() => animateTo(scaleTo)}
      onPressOut={() => animateTo(1)}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </AccessibleTouchable>
  );
}
