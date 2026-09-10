import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Animated, Text, View } from "react-native";

import { Button, Hairline, HeroBloom, ScreenContainer, useReducedMotion, useTheme } from "@/design-system";
import { motion } from "@/design-system/tokens/motion";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { getOnboardingPersonalization } from "@/features/onboarding/onboardingDraft";
import { finishOnboarding } from "@/features/onboarding/finishOnboarding";
import { presentValueReveal } from "@/features/onboarding/presentValueReveal";
import { useOnboardingSummary } from "@/features/onboarding/useOnboardingSummary";

/**
 * The atmosphere occupies the negative space ABOVE the headline and only
 * grazes its top — it never reaches the record statements below (Visual
 * Craft Pass 3.1 review §1/§7: decorative graphics must not pass through
 * primary readable text). `LIFT` is how far the band is pulled up past
 * the headline's top edge, so most of its content sits in empty space.
 */
const ATMOSPHERE_HEIGHT = 150;
const ATMOSPHERE_LIFT = 94;
/** Per-row entrance offset — a staged reveal, not a simultaneous pop. */
const ROW_STAGGER_MS = 90;

/**
 * Design-C, felt chapter 6 — the last onboarding screen (brief §11).
 *
 * Visual Craft Pass 3.1 (`docs/VISUAL_CRAFT_PASS_3_1.md` §7): the screen
 * was recomposed from a vertical stack (strip · title · big pink
 * `QuietSurface` · rows) into one open, layered composition. The promise
 * and the data are unchanged — the same, unmodified, directly-unit-tested
 * `presentValueReveal` presenter still returns at most three concrete,
 * truthful capability statements derived from the real onboarding answers.
 * What changed:
 *   - the atmosphere now bleeds behind the headline and the first record
 *     rows instead of being a boxed strip above them, so illustration and
 *     content read as one plane, not two stacked layers;
 *   - the heavy tinted container is gone — the "record" is an open,
 *     hairline-ruled block with tabular index numerals given real
 *     typographic weight (the reference-craft "numbers carry the
 *     confidence, labels whisper" move), so it reads as the user's own
 *     Ilium record starting to take shape;
 *   - real onboarding counts (treatments saved, an upcoming appointment)
 *     surface as one quiet factual line beneath — never invented, never a
 *     score, never a good/bad reading.
 * No fake AI framing, no diagnosis, no medical-improvement promise — all
 * unchanged.
 */
export default function ValueRevealScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing, layout } = useTheme();
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const personalization = getOnboardingPersonalization();
  const { treatmentCount, upcomingAppointmentCount } = useOnboardingSummary();
  const [atmosphereWidth, setAtmosphereWidth] = useState(0);

  const outcomes = presentValueReveal(personalization, upcomingAppointmentCount > 0, t);

  // One opacity/translateY pair per record row, sized once from the
  // (stable-for-this-mount) outcome count. `useState`'s lazy initializer
  // (not `useRef`) so reading the array during render isn't flagged as a
  // ref-during-render access — same singleton-creation idiom as elsewhere.
  const [rowAnim] = useState(() =>
    outcomes.map(() => ({ opacity: new Animated.Value(reducedMotion ? 1 : 0), translateY: new Animated.Value(reducedMotion ? 0 : 8) })),
  );

  useEffect(() => {
    const snapVisible = () => rowAnim.forEach((a) => { a.opacity.setValue(1); a.translateY.setValue(0); });
    if (reducedMotion) {
      snapVisible();
      return;
    }
    // Non-native driver: opacity/translateY on the JS thread is reliable
    // on react-native-web (the native-driven stagger was not painting the
    // freshly-mounted rows in the web preview) and identical on device.
    Animated.stagger(
      ROW_STAGGER_MS,
      rowAnim.map((anim) =>
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: motion.contentEnter.maxMs, useNativeDriver: false }),
          Animated.timing(anim.translateY, { toValue: 0, duration: motion.contentEnter.maxMs, useNativeDriver: false }),
        ]),
      ),
    ).start(snapVisible); // completion callback also guarantees the end state — content visibility never depends on the animation playing
    // Fires once on mount — a later reducedMotion toggle should not replay the entrance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    // finishOnboarding() must complete (and persist) onboarding BEFORE the
    // paywall, not after — a non-entitled user who closes the app while on
    // the paywall must not be sent through onboarding again on relaunch.
    finishOnboarding();
    router.replace("/paywall");
  };

  const factLine = buildFactLine(treatmentCount, upcomingAppointmentCount, t);

  return (
    <ScreenContainer>
      <OnboardingProgress step={6} />

      {/* The whole composition — headline, record, fact line, CTA — flows
          as one block from near the top so the CTA reads as part of the
          content, not a detached footer, and the screen never feels
          vertically overextended (Craft 3.1 review §2/§3). */}
      <View style={{ flex: 1, paddingTop: spacing.xl }}>
        {/* Headline zone. The atmosphere lives in the empty space ABOVE it,
            bleeding to the screen edges (no box, no fill) and only grazing
            the headline's very top — it never reaches the record text. */}
        <View style={{ position: "relative", marginBottom: spacing.lg }}>
          <View
            onLayout={(e) => setAtmosphereWidth(e.nativeEvent.layout.width)}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={{ position: "absolute", top: -ATMOSPHERE_LIFT, left: -layout.pageMargin, right: -layout.pageMargin, height: ATMOSPHERE_HEIGHT }}
          >
            {atmosphereWidth > 0 ? <HeroBloom width={atmosphereWidth} height={ATMOSPHERE_HEIGHT} variant="drift" /> : null}
          </View>

          <Text
            style={{
              fontSize: typography.display.fontSize,
              lineHeight: typography.display.lineHeight,
              fontWeight: typography.display.fontWeight,
              color: colors.textPrimary,
              maxWidth: "88%",
            }}
          >
            {t("onboarding.valueReveal.title")}
          </Text>
        </View>

        {/* Record zone — clean text, no art behind it. */}
        <Text
          style={{
            fontSize: typography.sectionTitle.fontSize,
            lineHeight: typography.sectionTitle.lineHeight,
            fontWeight: typography.sectionTitle.fontWeight,
            letterSpacing: typography.sectionTitle.letterSpacing,
            textTransform: typography.sectionTitle.textTransform,
            color: colors.textSecondary,
            marginBottom: spacing.sm,
          }}
        >
          {t("onboarding.valueReveal.recordLabel")}
        </Text>

        {outcomes.map((outcome, index) => (
          <Animated.View
            key={outcome.key}
            style={{ opacity: rowAnim[index].opacity, transform: [{ translateY: rowAnim[index].translateY }] }}
          >
            {index > 0 ? <Hairline /> : null}
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md, paddingVertical: spacing.sm }}>
              <Text
                style={{
                  fontSize: typography.metricMedium.fontSize,
                  lineHeight: typography.metricMedium.lineHeight,
                  fontWeight: typography.metricMedium.fontWeight,
                  fontVariant: ["tabular-nums"],
                  color: colors.brandPrimary,
                  width: 38,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Text style={{ flex: 1, fontSize: typography.body.fontSize, lineHeight: 23, color: colors.textPrimary, paddingTop: 3 }}>
                {outcome.label}
              </Text>
            </View>
          </Animated.View>
        ))}

        {factLine ? (
          <Text style={{ fontSize: typography.metadata.fontSize, color: colors.textTertiary, marginTop: spacing.md }}>
            {factLine}
          </Text>
        ) : null}

        <View style={{ marginTop: spacing.xl }}>
          <Button label={t("onboarding.valueReveal.cta")} onPress={handleContinue} />
        </View>
      </View>
    </ScreenContainer>
  );
}

/**
 * One quiet, factual line about what the user has already set up — real
 * repository counts (the same `useOnboardingSummary` reads Today uses),
 * never a fabricated metric. Returns null when there's nothing concrete to
 * state yet, matching the app-wide "never render a padded/empty line"
 * discipline.
 */
function buildFactLine(
  treatmentCount: number,
  upcomingAppointmentCount: number,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null {
  const parts: string[] = [];
  if (treatmentCount > 0) parts.push(t("onboarding.valueReveal.factTreatments", { count: treatmentCount }));
  if (upcomingAppointmentCount > 0) parts.push(t("onboarding.valueReveal.factAppointments", { count: upcomingAppointmentCount }));
  return parts.length > 0 ? parts.join(" · ") : null;
}
