import { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, Text, View } from "react-native";

import { elevation, useReducedMotion, useTheme } from "@/design-system";
import { motion } from "@/design-system/tokens/motion";

export type NumericScaleProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  anchorLow: string;
  anchorMid: string;
  anchorHigh: string;
  /** A short "this is your priority" indicator text, already localized — rendered next to the label only when set. */
  priorityIndicatorLabel?: string;
  /** VoiceOver value announcement, e.g. "Pain, 4 out of 10" — already localized/interpolated by the caller. */
  accessibilityValueLabel: string;
};

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 6;
const TOUCH_AREA_MIN_HEIGHT = 44;
/** How much the thumb grows while the finger is down — a small, tactile "you've got it" response (Visual Craft Pass 3.1 §11). */
const THUMB_DRAG_SCALE = 1.15;
/** Settle animation after a tap/drag-release/increment — same 180ms tier already used for BodyRegionMap's own selection settle, and inside the requested ~150-200ms window. */
const SETTLE_DURATION_MS = motion.tier2Transition.minMs;

/**
 * Design System 2.0, Phase Design-D, redesigned twice in Furkan-requested
 * follow-up passes. First an 11-floating-circle grid, then a compact
 * 6+5-row grid — both rejected as still reading like a survey/quiz. Now: a
 * single discrete stepped slider (built on the platform's own
 * `PanResponder` + `Animated` — no new dependency), shared verbatim by
 * Pain and Fatigue. Semantics are unchanged throughout: an integer 0-10,
 * never a float, never rendered as eleven permanent numerals — only the
 * three anchor labels (0/5/10) mark the scale, and the live value moves
 * into the heading itself ("Ağrı　4 / 10").
 *
 * The track fill and thumb position are driven by one ratio-space
 * `Animated.Value` (0-1). While the user is actively touching the track
 * (`isDragging`) the value tracks the finger 1:1 with no animation, for a
 * tactile, directly-connected feel; on release — and for any externally
 * driven change (increment/decrement, programmatic value, restoring a
 * saved draft) — it animates to the new stepped position over
 * `SETTLE_DURATION_MS`, collapsing to an instant jump under Reduce Motion.
 *
 * Haptics were audited and intentionally NOT added: neither `expo-haptics`
 * nor any equivalent is a current dependency, and the brief this shipped
 * against was explicit that a new dependency required stopping to report
 * first rather than adding it. Deferred, not forgotten.
 */
export function NumericScale({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  anchorLow,
  anchorMid,
  anchorHigh,
  priorityIndicatorLabel,
  accessibilityValueLabel,
}: NumericScaleProps) {
  const { colors, typography, spacing } = useTheme();
  const reducedMotion = useReducedMotion();

  const [trackWidth, setTrackWidth] = useState(0);
  const isDraggingRef = useRef(false);
  const latestRef = useRef({ value, min, max, onChange, reducedMotion });
  const trackWidthRef = useRef(0);
  const dragStartPixelXRef = useRef(0);
  const lastCommittedRef = useRef(value);

  const [position] = useState(() => new Animated.Value(ratioFor(value, min, max)));
  // Thumb grow/settle while dragging — a separate value from `position`,
  // driven the same non-native way (both are non-native props on the one
  // thumb view, which is allowed; mixing a native driver in is not).
  const [thumbScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    latestRef.current = { value, min, max, onChange, reducedMotion };
  });

  // Externally-driven changes (increment/decrement, a restored draft, another
  // control resetting the form) animate to the new position — but never while
  // the user's own finger is actively setting that same position.
  useEffect(() => {
    if (isDraggingRef.current) return;
    lastCommittedRef.current = value;
    const toValue = ratioFor(value, min, max);
    if (reducedMotion) {
      position.setValue(toValue);
      return;
    }
    Animated.timing(position, {
      toValue,
      duration: SETTLE_DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [value, min, max, position, reducedMotion]);

  const settleThumbScale = (to: number, reduced: boolean) => {
    if (reduced) {
      thumbScale.setValue(to);
      return;
    }
    Animated.timing(thumbScale, { toValue: to, duration: motion.micro.maxMs, useNativeDriver: false }).start();
  };

  const commitFromPixelX = (pixelX: number, animateToStep: boolean) => {
    const { min: curMin, max: curMax, onChange: curOnChange, reducedMotion: curReducedMotion } = latestRef.current;
    const width = trackWidthRef.current;
    const ratio = width > 0 ? clamp(pixelX / width, 0, 1) : 0;

    if (!animateToStep) {
      position.setValue(ratio);
    }

    const stepped = Math.round(curMin + ratio * (curMax - curMin));
    if (stepped !== lastCommittedRef.current) {
      lastCommittedRef.current = stepped;
      curOnChange(stepped);
    }

    if (animateToStep) {
      const settleTo = ratioFor(stepped, curMin, curMax);
      if (curReducedMotion) {
        position.setValue(settleTo);
      } else {
        Animated.timing(position, {
          toValue: settleTo,
          duration: SETTLE_DURATION_MS,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  // Known false positive: the refs below are only ever read inside PanResponder's own
  // event-handler callbacks (grant/move/release/terminate), which run outside render, exactly
  // like any other native event handler. `PanResponder.create` is called once via the `useState`
  // lazy-initializer pattern (same singleton-creation idiom as `position` above) purely so the
  // responder object identity is stable across renders.
  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        isDraggingRef.current = true;
        settleThumbScale(THUMB_DRAG_SCALE, latestRef.current.reducedMotion);
        // `locationX` is relative to the padded touch-area container; the track itself starts
        // `THUMB_SIZE / 2` further in (the padding reserved for the thumb to sit centered at the edges).
        const startX = clamp(evt.nativeEvent.locationX - THUMB_SIZE / 2, 0, trackWidthRef.current);
        dragStartPixelXRef.current = startX;
        commitFromPixelX(startX, false);
      },
      onPanResponderMove: (_evt, gestureState) => {
        commitFromPixelX(dragStartPixelXRef.current + gestureState.dx, false);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        isDraggingRef.current = false;
        settleThumbScale(1, latestRef.current.reducedMotion);
        commitFromPixelX(dragStartPixelXRef.current + gestureState.dx, true);
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        settleThumbScale(1, latestRef.current.reducedMotion);
        const { min: curMin, max: curMax, reducedMotion: curReducedMotion } = latestRef.current;
        const settleTo = ratioFor(lastCommittedRef.current, curMin, curMax);
        if (curReducedMotion) {
          position.setValue(settleTo);
        } else {
          Animated.timing(position, { toValue: settleTo, duration: SETTLE_DURATION_MS, useNativeDriver: false }).start();
        }
      },
    }),
  );

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: spacing.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{label}</Text>
          {priorityIndicatorLabel ? (
            <Text style={{ fontSize: typography.micro.fontSize, color: colors.brandPrimary }}>· {priorityIndicatorLabel}</Text>
          ) : null}
        </View>
        {/* The value carries the confidence — hero-scale tabular numeral in
            the accent, with the "/ 10" whispered beside it (Visual Craft
            Pass 3.1 §15). Still integer-only, still just a readout. */}
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              fontSize: typography.metricMedium.fontSize,
              lineHeight: typography.metricMedium.lineHeight,
              fontWeight: typography.metricMedium.fontWeight,
              fontVariant: ["tabular-nums"],
              color: colors.brandPrimary,
            }}
          >
            {value}
          </Text>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginLeft: 3 }}>/ {max}</Text>
        </View>
      </View>

      <View
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityValueLabel}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment" && value < max) onChange(value + 1);
          if (event.nativeEvent.actionName === "decrement" && value > min) onChange(value - 1);
        }}
      >
        <View
          importantForAccessibility="no-hide-descendants"
          {...panResponder.panHandlers}
          style={{
            minHeight: TOUCH_AREA_MIN_HEIGHT,
            justifyContent: "center",
            paddingHorizontal: THUMB_SIZE / 2,
          }}
        >
          <View
            onLayout={(e) => {
              trackWidthRef.current = e.nativeEvent.layout.width;
              setTrackWidth(e.nativeEvent.layout.width);
            }}
            style={{
              height: TRACK_HEIGHT,
              borderRadius: TRACK_HEIGHT / 2,
              backgroundColor: colors.hairline,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                height: "100%",
                width: position.interpolate({ inputRange: [0, 1], outputRange: [0, trackWidth] }),
                backgroundColor: colors.brandPrimary,
                borderRadius: TRACK_HEIGHT / 2,
              }}
            />
          </View>
          <Animated.View
            style={{
              position: "absolute",
              top: (TOUCH_AREA_MIN_HEIGHT - THUMB_SIZE) / 2,
              left: position.interpolate({ inputRange: [0, 1], outputRange: [0, trackWidth] }),
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: colors.brandPrimary,
              borderWidth: 2,
              borderColor: colors.background,
              // Tier-2 depth (`elevation.focal`) — the one place in Check-in
              // a control lifts off its track. Plus a small grow while the
              // finger is down (`thumbScale`); both are non-native props on
              // this one view, which react-native allows.
              transform: [{ scale: thumbScale }],
              ...elevation.focal,
            }}
          />
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.xxs, marginTop: spacing.xs }}>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{anchorLow}</Text>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{anchorMid}</Text>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{anchorHigh}</Text>
      </View>
    </View>
  );
}

function ratioFor(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
