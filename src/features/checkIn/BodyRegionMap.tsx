import { useEffect, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";

import { Chip, radius, useReducedMotion, useTheme } from "@/design-system";
import { motion } from "@/design-system/tokens/motion";
import { useTranslation } from "@/localization";
import type { BodyAreaRegion } from "@/repositories";

export type BodyRegionMapProps = {
  value: BodyAreaRegion[];
  onToggle: (region: BodyAreaRegion) => void;
  /**
   * Body areas the user flagged as important at onboarding (Phase R brief
   * §13/§14) — rendered ONLY as an informational caption below, never
   * merged into `value`, never pre-checked, and never styled to look like
   * a selection. "These areas matter to me" (onboarding preference) is not
   * "I have pain there today" (a real check-in selection) — this prop
   * exists specifically so that distinction can never be blurred by
   * accident at this component's boundary.
   */
  priorityAreas?: BodyAreaRegion[];
};

/**
 * BODY MAP — SVG-backed restore.
 *
 * History (git-verified, none of this was ever committed — see the report
 * delivered alongside this change): every committed version of this
 * component (Phase O, Phase R) was explicitly dependency-free RN `View`s.
 * An SVG-backed version was built once earlier in the same working
 * session, reverted to pure Views on explicit instruction, then restored
 * here on a further explicit instruction because the View-only rebuild's
 * region highlights read as "floating rounded boxes" rather than
 * anatomy. This version keeps the same real Wikimedia Commons silhouette
 * (provenance in `docs/ASSET_SOURCES.md`) but — the actual change this
 * round — draws the SELECTED-REGION highlights as SVG `<Ellipse>` shapes
 * inside the same `<Svg>`, not as RN `View` rounded rectangles. An ellipse
 * has no straight edge or corner, so it reads as "highlighted skin," not a
 * sticker placed on top of the figure.
 *
 * Architecture: the silhouette `<Path>` and every highlight `<Ellipse>`
 * live in one `<Svg>`, entirely `pointerEvents="none"` — none of it is
 * interactive. A separate, fully transparent RN `Pressable` sits over each
 * region for touch and accessibility (`react-native-svg` shapes support
 * `accessible`/`accessibilityLabel` but not `accessibilityRole`/
 * `accessibilityState` in the installed version, so touch stays on plain
 * RN `Pressable`s, unchanged from every prior phase). The two coordinate
 * systems are two views of the same hand-calibrated geometry: the ellipses
 * are positioned in the `<Svg>`'s own `viewBox` units (auto-scaling with
 * it, no conversion needed); the `Pressable`s use the equivalent render-
 * pixel rectangles at this component's fixed `MAP_WIDTH`/`MAP_HEIGHT` — the
 * two were cross-checked against each other and against the live-rendered
 * silhouette before being finalized (see the report's visual-QA section).
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

/** Regions with a silhouette placement. `chest_ribs` (no honest back-view spot) and `other` (a true catch-all) stay chip-only, unchanged since Phase O. */
type SilhouetteRegion = "neck" | "upper_back" | "lower_back" | "hips" | "shoulders";

const SILHOUETTE_VIEWBOX = "0 0 147.998 314.861";
const SILHOUETTE_TRANSFORM = "translate(-157 -20.526)";
const SILHOUETTE_PATH_D =
  "M231 21.026c-8.501 0-14.602 6.786-14.32 16.7-1.947-.007-2.879 1.75-2.908 3.104-.063 2.973 1.458 5.705 2.194 7.266.53 1.124 2.199 1.544 2.946 1.32.717.832 1.053 4.12 1.914 4.866.039 4.585-1.384 8.232-6.538 11.408-7.58 4.67-9.765 1.588-16.504 5.363-7.18 4.022-9.839 16.322-12.894 25.272-2.701 7.914-3.117 16.701-4.641 24.652-.961 5.011-3.728 6.429-4.642 12.171-1.757 11.036-3.522 24.118-4.595 34.051-.277 2.56-2.592 3.42-3.875 4.537-1.218 1.06-2.22 1.889-3.998 3.642-.544.535-.673 1.678-1.193 2.752-.444.914-1.519 1.538-1.807 2.351-.816 2.305-3.163 3.662-2.549 4.548.57.823 2.962-.164 4.11-.98.735-.524 1.361-1.352 1.457-2.283.916-.331 2.107-2.771 2.695-2.658.256.05.358 4.461-.574 7.509-.364 1.188-.67 1.746-.675 2.528-.006 1.006-.16 3.338-.28 4.41-.177 1.574.309 3.032 1.256 3.104.222.017 1.34-.283 1.348-2.018.003-.633.08-1.127.196-1.94.201-1.409 1.494-4.137 1.726-5.36.073-.386.351-1.376.619-1.344.082.01-.405 2.902-.686 4.114-.31 1.344.145 2.269-.003 5.032-.128 2.425.035 3.81 1.267 3.858.388.015 1.557.012 1.587-3.536.01-1.045.366-2.91.633-4.717.196-1.328.213-2.72 1.035-4.298-.045 1.671-.144 1.89-.228 3.517-.037.707-.215 3.618-.216 4.49-.23 1.02-.582 3.838 1.05 3.91.732.034 1.704-.888 2.128-7.134.124-1.828.436-4.287.92-5.66.278 1.198.343 1.72.34 2.31 0 .417.182 1.77-.008 3.118-.275 1.94-.423 3.24.591 3.353.562.063 1.242-.686 1.657-2.025.145-.468.101-1.139.254-1.679.517-1.826.189-3.733.364-4.957.24-1.666.537-2.492.769-3.213.238-.741.557-2.941.586-5.339.028-2.397-.968-2.465-.584-8.917.385-6.453 8.155-18.313 9.739-27.92.472-2.867 1.92-5.449 2.66-8.238 1.277-4.802 1.526-9.862 3.064-14.587 1.138-3.497 4.522-10.065 4.522-10.065s3.182 11.688 3.818 15.85c1.985 12.977-3.566 24.174-6.041 38.02-1.97 11.022-4.033 18.865-3.903 33.362.153 17.18 3.793 32.781 4.084 42.012.037 1.167-1.263 5.772-1.05 10.691.214 4.92-.912 11.932-.847 18.338.154 15.018 4.942 26.356 6.857 33.114.94 3.315 1.714 7.565 1.604 10.211s.114 3.61.143 5.067c.028 1.456-.575 2.408-.36 4.915.058.682.095 2.284-1.598 3.367-.439.28-1.4.446-2.193.654-.543.142-.94.835-1.102 1.069-1.052 1.523-1.22 3.708-.255 4.376.316.218 3.53 2.264 3.72 2.43.945.82 1.148 1.996 1.59 2.326 3.6 2.684 9.502 1.936 10.907-.844.4-.794-.742-3.98.72-6.226 1.097-1.687-.383-3.66-.01-4.51 1.007-2.303 1.278-7.856.54-9.333-1.569-7.495-.437-13.193-.14-21.743.276-7.939 2.694-15.697 3.063-23.632.157-3.378-.512-6.76-.365-10.138.199-4.553 1.255-9.03 1.678-13.566.389-4.172.263-8.389.79-12.545 1.88-14.845 6.893-16.86 8.44-44.09m0 0c1.548 27.23 6.561 29.245 8.442 44.09.526 4.156.4 8.373.79 12.545.423 4.537 1.479 9.014 1.677 13.566.147 3.378-.522 6.76-.365 10.138.37 7.934 2.788 15.693 3.064 23.632.297 8.55 1.428 14.249-.14 21.743-.739 1.477-.468 7.03.54 9.333.372.85-1.108 2.823-.01 4.51 1.462 2.246.319 5.432.72 6.226 1.405 2.78 7.307 3.528 10.906.844.442-.33.645-1.506 1.59-2.326.19-.166 3.404-2.212 3.72-2.43.966-.668.797-2.853-.254-4.376-.162-.234-.56-.927-1.103-1.07-.792-.207-1.753-.372-2.192-.653-1.693-1.083-1.656-2.685-1.598-3.367.214-2.507-.389-3.459-.36-4.915.029-1.457.252-2.42.142-5.067-.11-2.646.665-6.896 1.605-10.21 1.915-6.758 6.702-18.097 6.856-33.115.066-6.405-1.06-13.419-.847-18.338.214-4.918-1.086-9.524-1.05-10.69.292-9.232 3.932-24.834 4.085-42.013.13-14.497-1.933-22.34-3.903-33.362-2.475-13.847-8.026-25.044-6.042-38.02.637-4.16 3.819-15.85 3.819-15.85s3.383 6.568 4.521 10.065c1.538 4.725 1.788 9.786 3.064 14.587.74 2.789 2.188 5.371 2.66 8.238 1.585 9.607 9.355 21.468 9.74 27.92.383 6.452-.613 6.52-.584 8.917.028 2.398.348 4.598.586 5.339.231.721.53 1.547.768 3.213.176 1.224-.152 3.131.364 4.957.153.54.11 1.21.255 1.68.414 1.338 1.094 2.087 1.656 2.024 1.015-.113.866-1.414.592-3.353-.19-1.347-.008-2.7-.01-3.118-.001-.59.063-1.112.342-2.31.484 1.373.795 3.832.92 5.66.423 6.246 1.395 7.168 2.127 7.135 1.632-.073 1.281-2.892 1.05-3.91 0-.873-.179-3.784-.215-4.49-.085-1.629-.183-1.847-.229-3.518.823 1.578.84 2.97 1.035 4.298.268 1.808.624 3.672.633 4.717.03 3.548 1.2 3.55 1.588 3.536 1.231-.047 1.395-1.433 1.266-3.858-.148-2.763.308-3.688-.003-5.032-.28-1.212-.768-4.104-.685-4.114.267-.032.546.958.619 1.344.231 1.223 1.524 3.951 1.725 5.36.117.814.193 1.307.196 1.94.008 1.735 1.127 2.035 1.348 2.018.948-.073 1.434-1.53 1.257-3.105-.12-1.071-.274-3.403-.28-4.41-.005-.78-.312-1.34-.675-2.527-.933-3.048-.83-7.46-.574-7.509.587-.113 1.779 2.327 2.695 2.658.095.93.721 1.759 1.457 2.282 1.147.817 3.539 1.804 4.11.981.614-.886-1.733-2.243-2.55-4.548-.288-.813-1.363-1.437-1.806-2.351-.521-1.074-.65-2.217-1.193-2.752-1.78-1.753-2.78-2.582-3.999-3.642-1.283-1.116-3.598-1.977-3.874-4.537-1.073-9.933-2.839-23.015-4.595-34.051-.914-5.742-3.681-7.16-4.642-12.171-1.525-7.951-1.94-16.739-4.642-24.652-3.055-8.95-5.713-21.249-12.894-25.272-6.738-3.775-8.923-.693-16.504-5.363-5.153-3.176-6.576-6.822-6.538-11.408.861-.747 1.197-4.034 1.914-4.866.748.224 2.416-.196 2.946-1.32.736-1.56 2.257-4.293 2.194-7.266-.029-1.355-.96-3.111-2.908-3.104.283-9.914-5.818-16.7-14.32-16.7";

/** Figure render size — natural aspect ratio preserved from the source `viewBox`; empirically confirmed 1:1 with screenshot pixels at this height in this environment. */
const MAP_HEIGHT = 260;
const MAP_WIDTH = Math.round(147.998 * (MAP_HEIGHT / 314.861));

/**
 * Region-highlight ellipses, in the `<Svg>`'s own `viewBox` units — hand-
 * fitted to this specific silhouette's real contour (torso widest at the
 * shoulders, narrowest at the waist, flaring again at the hips), not
 * generic boxes. Every ellipse sits comfortably inside the body outline at
 * its landmark height. `shoulders` gets two (left/right) sharing the same
 * toggle — one enum, two visual sides, matching how a person actually
 * points to "my shoulders."
 */
const REGION_ELLIPSES: Record<SilhouetteRegion, { cx: number; cy: number; rx: number; ry: number }[]> = {
  neck: [{ cx: 74, cy: 47.3, rx: 6.5, ry: 7.5 }],
  shoulders: [
    { cx: 47, cy: 64.8, rx: 18, ry: 11.5 },
    { cx: 101, cy: 64.8, rx: 18, ry: 11.5 },
  ],
  upper_back: [{ cx: 74, cy: 98.2, rx: 31.5, ry: 23 }],
  lower_back: [{ cx: 74, cy: 138.2, rx: 26.5, ry: 17 }],
  hips: [{ cx: 74, cy: 175.6, rx: 30, ry: 20.5 }],
};

/** Touch-target rectangles, in render-pixel space (`MAP_WIDTH`×`MAP_HEIGHT`) — the same landmarks as `REGION_ELLIPSES` above, just in the other coordinate system (cross-checked against each other and against the live render; see the delivery report). Invisible — only `AnatomyHighlight`'s ellipses are ever seen. */
const REGION_TOUCH_TARGETS: Record<SilhouetteRegion, { left: number; top: number; width: number; height: number }> = {
  neck: { left: 56, top: 33, width: 10, height: 12 },
  shoulders: { left: 29, top: 45, width: 64, height: 20 },
  upper_back: { left: 35, top: 62, width: 52, height: 38 },
  lower_back: { left: 39, top: 100, width: 44, height: 28 },
  hips: { left: 36, top: 128, width: 50, height: 34 },
};

/** Low-to-high touch priority — later entries win overlapping taps (neck last, the smallest zone, most easily shadowed by the shoulders above it). */
const ZONE_DRAW_ORDER: SilhouetteRegion[] = ["hips", "lower_back", "upper_back", "shoulders", "neck"];

const SELECTION_DURATION_MS = motion.tier2Transition.minMs; // 180ms, within the established 180-220ms motion tier.

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

/**
 * One anatomically-shaped highlight — an `Ellipse` (or two, for
 * `shoulders`), never a rectangle. Purely visual (`pointerEvents="none"`
 * on the whole `<Svg>` layer); the tap target is the separate `Pressable`
 * rendered alongside it. Fades in/out via RN `Animated` driving the SVG
 * shape's own `opacity` prop directly (not `useNativeDriver` — SVG shape
 * props aren't part of the native-driver allowlist on every platform this
 * app runs on, including the web preview used for visual QA); Reduce
 * Motion collapses straight to the end state.
 */
function AnatomyHighlight({
  ellipses,
  selected,
  accent,
  fill,
}: {
  ellipses: { cx: number; cy: number; rx: number; ry: number }[];
  selected: boolean;
  accent: string;
  fill: string;
}) {
  const reducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(selected ? 1 : 0));

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(selected ? 1 : 0);
      return;
    }
    Animated.timing(progress, {
      toValue: selected ? 1 : 0,
      duration: SELECTION_DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [selected, reducedMotion, progress]);

  return (
    <>
      {ellipses.map((e, i) => (
        <AnimatedEllipse
          key={i}
          cx={e.cx}
          cy={e.cy}
          rx={e.rx}
          ry={e.ry}
          fill={fill}
          stroke={accent}
          strokeWidth={1.25}
          opacity={progress}
        />
      ))}
    </>
  );
}

/** `#rrggbb` → `rgba(r, g, b, alpha)` — derives the translucent highlight fill from the theme's own `colors.accent`, never a hardcoded second color. */
function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** A read-only summary of the currently-selected regions — deliberately not the shared `Chip` component (that stays the accessible fallback below); a lightweight confirmation, not a second interactive control. */
function SelectedRegionPill({ label }: { label: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
        borderRadius: radius.standard,
        backgroundColor: colors.surfaceHighlight,
      }}
    >
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.accent, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

export function BodyRegionMap({ value, onToggle, priorityAreas = [] }: BodyRegionMapProps) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();

  const selectedRegions = ALL_REGIONS.filter((region) => value.includes(region));
  const highlightFill = hexToRgba(colors.accent, 0.22);

  return (
    <View>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.sm }}>
        {t("checkIn.bodyAreaLabel")}
      </Text>

      {/* Informational only — never affects `value`/selection state (see the `priorityAreas` prop doc comment above). */}
      {priorityAreas.length > 0 ? (
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.accent, marginBottom: spacing.sm }}>
          {t("checkIn.priorityBodyAreasLabel", { areas: priorityAreas.map((area) => t(`checkIn.bodyArea.${area}`)).join(", ") })}
        </Text>
      ) : null}

      {/* Silhouette card — subtle background, generous whitespace, per the "premium, not a hospital dashboard" direction. */}
      <View
        style={{
          alignItems: "center",
          paddingVertical: spacing.lg,
          borderRadius: radius.large,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderHairline,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
          <Svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={SILHOUETTE_VIEWBOX} pointerEvents="none">
            <Path d={SILHOUETTE_PATH_D} transform={SILHOUETTE_TRANSFORM} fill={colors.surfaceSecondary} stroke="none" />
            {ZONE_DRAW_ORDER.map((region) => (
              <AnatomyHighlight
                key={region}
                ellipses={REGION_ELLIPSES[region]}
                selected={value.includes(region)}
                accent={colors.accent}
                fill={highlightFill}
              />
            ))}
          </Svg>

          {/* Invisible touch targets — the visible highlight above is the only thing the user ever sees; these just carry accessibility + hit area, one per region including both shoulder sides. */}
          {ZONE_DRAW_ORDER.map((region) => (
            <Pressable
              key={region}
              onPress={() => onToggle(region)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityState={{ selected: value.includes(region) }}
              accessibilityLabel={t(
                value.includes(region) ? "checkIn.bodyRegionSelectedLabel" : "checkIn.bodyRegionUnselectedLabel",
                { region: t(`checkIn.bodyArea.${region}`) },
              )}
              style={{ position: "absolute", ...REGION_TOUCH_TARGETS[region] }}
            />
          ))}
        </View>

        {selectedRegions.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.xs, marginTop: spacing.md, paddingHorizontal: spacing.md }}>
            {selectedRegions.map((region) => (
              <SelectedRegionPill key={region} label={t(`checkIn.bodyArea.${region}`)} />
            ))}
          </View>
        ) : (
          <Text
            style={{
              fontSize: typography.caption.fontSize,
              color: colors.textSecondary,
              marginTop: spacing.md,
              paddingHorizontal: spacing.lg,
              textAlign: "center",
            }}
          >
            {t("checkIn.bodyMapEmptyHint")}
          </Text>
        )}
      </View>

      {/* Accessible fallback — every region, including the two with no silhouette placement (chest_ribs, other). VoiceOver/Switch Control users select from here exactly as before (Product 2.0 spec §7); the silhouette above is the primary, tappable-by-itself sighted-user affordance. */}
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
