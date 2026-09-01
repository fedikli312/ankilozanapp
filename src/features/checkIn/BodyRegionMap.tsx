import { Pressable, Text, View } from "react-native";

import { Chip, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import type { BodyAreaRegion } from "@/repositories";

export type BodyRegionMapProps = {
  value: BodyAreaRegion[];
  onToggle: (region: BodyAreaRegion) => void;
};

/**
 * Five of the app's seven real body-area values get a silhouette zone
 * below (neck, shoulders, upper_back, lower_back, hips) — AS is
 * fundamentally an axial/spine condition, and these are exactly the
 * spine/SI-related ones, so a back-focused schematic represents them
 * honestly. `chest_ribs` (anterior) and `other` (a catch-all) have no
 * natural back-view placement and are deliberately NOT forced onto a wrong
 * anatomical spot — they remain selectable only via the chip row below,
 * which is the actual authoritative/accessible interaction for every
 * region regardless of whether it has a silhouette zone.
 */

/** Full taxonomy, chip order — unchanged from the existing check-in/onboarding body-area list. */
const ALL_REGIONS: BodyAreaRegion[] = [
  "neck",
  "upper_back",
  "lower_back",
  "hips",
  "shoulders",
  "chest_ribs",
  "other",
];

const MAP_WIDTH = 200;
const MAP_HEIGHT = 250;

/**
 * Phase O — Body Map (Product 2.0 spec "BODY MAP — PRIMARY NEW FEATURE").
 *
 * Dependency-free: no `react-native-svg` or any graphics library is
 * installed in this project (checked directly against package.json before
 * building this), so the silhouette is built entirely from plain React
 * Native `View`s — an abstract, ungendered, skin-tone-free back-view
 * schematic (rounded rectangles/circles), never an anatomical illustration.
 *
 * Multi-select, using the taxonomy and storage this app already has —
 * `checkInBodyArea` is already a proper one-to-many join table (Tech Arch
 * §D), so multiple regions per check-in required no schema change at all.
 *
 * Accessibility: the silhouette is a visual affordance layered over the
 * SAME chip list already used by the existing check-in form and Phase N's
 * onboarding body-regions screen — tapping either updates the identical
 * selection state. The chip row is the authoritative interaction; the
 * silhouette is never the only way to select a region (Product 2.0 spec
 * §14). Silhouette zones are still real accessible touch targets in their
 * own right (not hidden from the tree) for a sighted VoiceOver+low-vision
 * user who can see general shapes.
 *
 * "Where," never "how much": there is no per-region severity here — pain
 * stays one global 0–10 check-in value (Product 2.0 spec §13).
 */
export function BodyRegionMap({ value, onToggle }: BodyRegionMapProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const { t } = useTranslation();

  const zoneStyle = (region: BodyAreaRegion) => {
    const selected = value.includes(region);
    return {
      backgroundColor: selected ? colors.surfaceHighlight : colors.surfaceSecondary,
      borderWidth: selected ? 1.5 : 0,
      borderColor: colors.accent,
    };
  };

  return (
    <View>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.sm }}>
        {t("checkIn.bodyAreaLabel")}
      </Text>

      <View style={{ width: MAP_WIDTH, height: MAP_HEIGHT, alignSelf: "center", marginBottom: spacing.md }}>
        {/* Decorative-only silhouette parts — head, arms, legs. Not tappable, no health meaning. */}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ position: "absolute", left: 82, top: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceSecondary }}
        />
        <View accessibilityElementsHidden style={{ position: "absolute", left: 18, top: 78, width: 18, height: 92, borderRadius: radius.small, backgroundColor: colors.surfaceSecondary }} />
        <View accessibilityElementsHidden style={{ position: "absolute", left: 164, top: 78, width: 18, height: 92, borderRadius: radius.small, backgroundColor: colors.surfaceSecondary }} />
        <View accessibilityElementsHidden style={{ position: "absolute", left: 63, top: 218, width: 32, height: 32, borderRadius: radius.small, backgroundColor: colors.surfaceSecondary }} />
        <View accessibilityElementsHidden style={{ position: "absolute", left: 105, top: 218, width: 32, height: 32, borderRadius: radius.small, backgroundColor: colors.surfaceSecondary }} />

        {/*
          Tappable zones, back view. Plain `Pressable` with `hitSlop` rather
          than `AccessibleTouchable` on purpose: these bands are packed
          tightly (absolute positioning, real anatomical proportions) — the
          latter's forced 44x44 minimum would inflate them into overlapping
          the wrong neighboring zone and break the silhouette's shape. Each
          zone still carries a real, extended tap area via `hitSlop`, and is
          fully described to VoiceOver — it is a supplementary sighted
          affordance, not the sole or size-compromised interaction; the chip
          row below remains the authoritative, unconstrained-target control.
        */}
        <Pressable
          onPress={() => onToggle("neck")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: value.includes("neck") }}
          accessibilityLabel={t("checkIn.bodyArea.neck")}
          style={[{ position: "absolute", left: 88, top: 36, width: 24, height: 16, borderRadius: 6 }, zoneStyle("neck")]}
        />
        <Pressable
          onPress={() => onToggle("shoulders")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: value.includes("shoulders") }}
          accessibilityLabel={t("checkIn.bodyArea.shoulders")}
          style={[{ position: "absolute", left: 40, top: 52, width: 120, height: 26, borderRadius: radius.small }, zoneStyle("shoulders")]}
        />
        <Pressable
          onPress={() => onToggle("upper_back")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: value.includes("upper_back") }}
          accessibilityLabel={t("checkIn.bodyArea.upper_back")}
          style={[{ position: "absolute", left: 65, top: 78, width: 70, height: 58, borderRadius: radius.small }, zoneStyle("upper_back")]}
        />
        <Pressable
          onPress={() => onToggle("lower_back")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: value.includes("lower_back") }}
          accessibilityLabel={t("checkIn.bodyArea.lower_back")}
          style={[{ position: "absolute", left: 65, top: 136, width: 70, height: 44, borderRadius: radius.small }, zoneStyle("lower_back")]}
        />
        <Pressable
          onPress={() => onToggle("hips")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: value.includes("hips") }}
          accessibilityLabel={t("checkIn.bodyArea.hips")}
          style={[{ position: "absolute", left: 55, top: 180, width: 90, height: 34, borderRadius: radius.small }, zoneStyle("hips")]}
        />
      </View>

      {/* Authoritative accessible/precise selection — every region, including the two with no silhouette zone (chest_ribs, other). */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {ALL_REGIONS.map((region) => (
          <Chip
            key={region}
            label={t(`checkIn.bodyArea.${region}`)}
            selected={value.includes(region)}
            onPress={() => onToggle(region)}
          />
        ))}
      </View>
    </View>
  );
}
