import { useEffect, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

import { AccessibleTouchable, radius, useReducedMotion, useTheme } from "@/design-system";
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
 *
 * Furkan-requested Check-in restructuring (post Design-D/Design-I): the map
 * is now the sole primary selector, and the old full seven-region chip wall
 * beneath it — kept originally as an "accessible fallback" for the five
 * silhouette regions — is gone. That fallback was redundant: each
 * silhouette region's own `Pressable` already carries a real
 * `accessibilityRole`/`accessibilityState`/`accessibilityLabel`, so
 * VoiceOver/Switch Control users select those five regions from the map
 * itself, exactly as a sighted user does, not from a separate list. Only
 * `chest_ribs` and `other` — the two taxonomy members with no honest
 * silhouette spot — still get standalone options, and the read-only
 * summary pill became an actionable "region ×" removable tag, since it's
 * now the only remaining on-screen list of what's selected.
 *
 * Furkan-requested visual refinement pass (same restructuring, second
 * round): the first enlarged-map version still read as decorative rather
 * than interactive — the silhouette had almost no contrast against the
 * background, and unselected regions were rendered at literal zero opacity
 * (nothing to discover before tapping). Fixed by giving the outline itself
 * a real (but restrained) `borderStrong` stroke, and by giving every
 * region a permanent, very faint neutral "hotspot" ellipse (see
 * `RegionHotspot` below) that's always present at low opacity — selection
 * still means, and only means, the brand-accent ellipse fading in on top
 * (`AnatomyHighlight`, unchanged). `chest_ribs`/`other` moved from full
 * `Chip` pills to the same restrained dot-marker language `StiffnessSelector`
 * already established, under a small "other areas" label, so they read as
 * clearly secondary to tapping the body. Map height was dialed back from
 * 340pt to `MAP_HEIGHT` below — enlarging it further than that mostly grew
 * empty leg space (the touch regions only ever reached the hips, near the
 * viewBox's own vertical midpoint) without adding anything tappable.
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

/** The two taxonomy members with no honest silhouette spot — rendered as a small standalone chip pair beneath the map, never as part of a full duplicated region-chip wall (Furkan-requested Check-in restructuring). */
const NON_SILHOUETTE_REGIONS: BodyAreaRegion[] = ["chest_ribs", "other"];

const SILHOUETTE_VIEWBOX = "0 0 147.998 314.861";
const SILHOUETTE_TRANSFORM = "translate(-157 -20.526)";
const SILHOUETTE_PATH_D =
  "M231 21.026c-8.501 0-14.602 6.786-14.32 16.7-1.947-.007-2.879 1.75-2.908 3.104-.063 2.973 1.458 5.705 2.194 7.266.53 1.124 2.199 1.544 2.946 1.32.717.832 1.053 4.12 1.914 4.866.039 4.585-1.384 8.232-6.538 11.408-7.58 4.67-9.765 1.588-16.504 5.363-7.18 4.022-9.839 16.322-12.894 25.272-2.701 7.914-3.117 16.701-4.641 24.652-.961 5.011-3.728 6.429-4.642 12.171-1.757 11.036-3.522 24.118-4.595 34.051-.277 2.56-2.592 3.42-3.875 4.537-1.218 1.06-2.22 1.889-3.998 3.642-.544.535-.673 1.678-1.193 2.752-.444.914-1.519 1.538-1.807 2.351-.816 2.305-3.163 3.662-2.549 4.548.57.823 2.962-.164 4.11-.98.735-.524 1.361-1.352 1.457-2.283.916-.331 2.107-2.771 2.695-2.658.256.05.358 4.461-.574 7.509-.364 1.188-.67 1.746-.675 2.528-.006 1.006-.16 3.338-.28 4.41-.177 1.574.309 3.032 1.256 3.104.222.017 1.34-.283 1.348-2.018.003-.633.08-1.127.196-1.94.201-1.409 1.494-4.137 1.726-5.36.073-.386.351-1.376.619-1.344.082.01-.405 2.902-.686 4.114-.31 1.344.145 2.269-.003 5.032-.128 2.425.035 3.81 1.267 3.858.388.015 1.557.012 1.587-3.536.01-1.045.366-2.91.633-4.717.196-1.328.213-2.72 1.035-4.298-.045 1.671-.144 1.89-.228 3.517-.037.707-.215 3.618-.216 4.49-.23 1.02-.582 3.838 1.05 3.91.732.034 1.704-.888 2.128-7.134.124-1.828.436-4.287.92-5.66.278 1.198.343 1.72.34 2.31 0 .417.182 1.77-.008 3.118-.275 1.94-.423 3.24.591 3.353.562.063 1.242-.686 1.657-2.025.145-.468.101-1.139.254-1.679.517-1.826.189-3.733.364-4.957.24-1.666.537-2.492.769-3.213.238-.741.557-2.941.586-5.339.028-2.397-.968-2.465-.584-8.917.385-6.453 8.155-18.313 9.739-27.92.472-2.867 1.92-5.449 2.66-8.238 1.277-4.802 1.526-9.862 3.064-14.587 1.138-3.497 4.522-10.065 4.522-10.065s3.182 11.688 3.818 15.85c1.985 12.977-3.566 24.174-6.041 38.02-1.97 11.022-4.033 18.865-3.903 33.362.153 17.18 3.793 32.781 4.084 42.012.037 1.167-1.263 5.772-1.05 10.691.214 4.92-.912 11.932-.847 18.338.154 15.018 4.942 26.356 6.857 33.114.94 3.315 1.714 7.565 1.604 10.211s.114 3.61.143 5.067c.028 1.456-.575 2.408-.36 4.915.058.682.095 2.284-1.598 3.367-.439.28-1.4.446-2.193.654-.543.142-.94.835-1.102 1.069-1.052 1.523-1.22 3.708-.255 4.376.316.218 3.53 2.264 3.72 2.43.945.82 1.148 1.996 1.59 2.326 3.6 2.684 9.502 1.936 10.907-.844.4-.794-.742-3.98.72-6.226 1.097-1.687-.383-3.66-.01-4.51 1.007-2.303 1.278-7.856.54-9.333-1.569-7.495-.437-13.193-.14-21.743.276-7.939 2.694-15.697 3.063-23.632.157-3.378-.512-6.76-.365-10.138.199-4.553 1.255-9.03 1.678-13.566.389-4.172.263-8.389.79-12.545 1.88-14.845 6.893-16.86 8.44-44.09m0 0c1.548 27.23 6.561 29.245 8.442 44.09.526 4.156.4 8.373.79 12.545.423 4.537 1.479 9.014 1.677 13.566.147 3.378-.522 6.76-.365 10.138.37 7.934 2.788 15.693 3.064 23.632.297 8.55 1.428 14.249-.14 21.743-.739 1.477-.468 7.03.54 9.333.372.85-1.108 2.823-.01 4.51 1.462 2.246.319 5.432.72 6.226 1.405 2.78 7.307 3.528 10.906.844.442-.33.645-1.506 1.59-2.326.19-.166 3.404-2.212 3.72-2.43.966-.668.797-2.853-.254-4.376-.162-.234-.56-.927-1.103-1.07-.792-.207-1.753-.372-2.192-.653-1.693-1.083-1.656-2.685-1.598-3.367.214-2.507-.389-3.459-.36-4.915.029-1.457.252-2.42.142-5.067-.11-2.646.665-6.896 1.605-10.21 1.915-6.758 6.702-18.097 6.856-33.115.066-6.405-1.06-13.419-.847-18.338.214-4.918-1.086-9.524-1.05-10.69.292-9.232 3.932-24.834 4.085-42.013.13-14.497-1.933-22.34-3.903-33.362-2.475-13.847-8.026-25.044-6.042-38.02.637-4.16 3.819-15.85 3.819-15.85s3.383 6.568 4.521 10.065c1.538 4.725 1.788 9.786 3.064 14.587.74 2.789 2.188 5.371 2.66 8.238 1.585 9.607 9.355 21.468 9.74 27.92.383 6.452-.613 6.52-.584 8.917.028 2.398.348 4.598.586 5.339.231.721.53 1.547.768 3.213.176 1.224-.152 3.131.364 4.957.153.54.11 1.21.255 1.68.414 1.338 1.094 2.087 1.656 2.024 1.015-.113.866-1.414.592-3.353-.19-1.347-.008-2.7-.01-3.118-.001-.59.063-1.112.342-2.31.484 1.373.795 3.832.92 5.66.423 6.246 1.395 7.168 2.127 7.135 1.632-.073 1.281-2.892 1.05-3.91 0-.873-.179-3.784-.215-4.49-.085-1.629-.183-1.847-.229-3.518.823 1.578.84 2.97 1.035 4.298.268 1.808.624 3.672.633 4.717.03 3.548 1.2 3.55 1.588 3.536 1.231-.047 1.395-1.433 1.266-3.858-.148-2.763.308-3.688-.003-5.032-.28-1.212-.768-4.104-.685-4.114.267-.032.546.958.619 1.344.231 1.223 1.524 3.951 1.725 5.36.117.814.193 1.307.196 1.94.008 1.735 1.127 2.035 1.348 2.018.948-.073 1.434-1.53 1.257-3.105-.12-1.071-.274-3.403-.28-4.41-.005-.78-.312-1.34-.675-2.527-.933-3.048-.83-7.46-.574-7.509.587-.113 1.779 2.327 2.695 2.658.095.93.721 1.759 1.457 2.282 1.147.817 3.539 1.804 4.11.981.614-.886-1.733-2.243-2.55-4.548-.288-.813-1.363-1.437-1.806-2.351-.521-1.074-.65-2.217-1.193-2.752-1.78-1.753-2.78-2.582-3.999-3.642-1.283-1.116-3.598-1.977-3.874-4.537-1.073-9.933-2.839-23.015-4.595-34.051-.914-5.742-3.681-7.16-4.642-12.171-1.525-7.951-1.94-16.739-4.642-24.652-3.055-8.95-5.713-21.249-12.894-25.272-6.738-3.775-8.923-.693-16.504-5.363-5.153-3.176-6.576-6.822-6.538-11.408.861-.747 1.197-4.034 1.914-4.866.748.224 2.416-.196 2.946-1.32.736-1.56 2.257-4.293 2.194-7.266-.029-1.355-.96-3.111-2.908-3.104.283-9.914-5.818-16.7-14.32-16.7";

/**
 * Figure render size — natural aspect ratio preserved from the source
 * `viewBox`. 300pt: large enough that every touch region comfortably
 * clears 44pt (see `TOUCH_TARGET_SCALE` below) and the map reads as the
 * screen's primary interaction, without the 340pt version's mostly-empty
 * leg space — the lowest touch region (hips) sits well above the
 * viewBox's own vertical midpoint, so height past that point is pure
 * decoration, not function (Furkan-requested visual refinement pass).
 */
const MAP_HEIGHT = 300;
const MAP_WIDTH = Math.round(147.998 * (MAP_HEIGHT / 314.861));

/** The height `REGION_TOUCH_TARGETS_BASE` below was hand-calibrated against — every touch target scales proportionally from that baseline via `TOUCH_TARGET_SCALE` whenever `MAP_HEIGHT` changes, rather than being re-measured by hand. */
const BASE_MAP_HEIGHT = 260;
const TOUCH_TARGET_SCALE = MAP_HEIGHT / BASE_MAP_HEIGHT;

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

/** Touch-target rectangles, hand-calibrated in render-pixel space at `BASE_MAP_HEIGHT` (260pt) — the same landmarks as `REGION_ELLIPSES` above, just in the other coordinate system (cross-checked against each other and against the live render; see the delivery report). Invisible — only `AnatomyHighlight`'s ellipses are ever seen. */
const REGION_TOUCH_TARGETS_BASE: Record<SilhouetteRegion, { left: number; top: number; width: number; height: number }> = {
  neck: { left: 56, top: 33, width: 10, height: 12 },
  shoulders: { left: 29, top: 45, width: 64, height: 20 },
  upper_back: { left: 35, top: 62, width: 52, height: 38 },
  lower_back: { left: 39, top: 100, width: 44, height: 28 },
  hips: { left: 36, top: 128, width: 50, height: 34 },
};

/** `REGION_TOUCH_TARGETS_BASE` scaled to the actual rendered `MAP_HEIGHT` via `TOUCH_TARGET_SCALE`. */
const REGION_TOUCH_TARGETS: Record<SilhouetteRegion, { left: number; top: number; width: number; height: number }> =
  Object.fromEntries(
    (Object.entries(REGION_TOUCH_TARGETS_BASE) as [SilhouetteRegion, { left: number; top: number; width: number; height: number }][]).map(
      ([region, r]) => [
        region,
        {
          left: r.left * TOUCH_TARGET_SCALE,
          top: r.top * TOUCH_TARGET_SCALE,
          width: r.width * TOUCH_TARGET_SCALE,
          height: r.height * TOUCH_TARGET_SCALE,
        },
      ],
    ),
  ) as Record<SilhouetteRegion, { left: number; top: number; width: number; height: number }>;

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

/**
 * The permanent, unselected landmark cue. Craft 3.1 review §5: the earlier
 * region-sized faint ellipses still read as "translucent oval overlays"
 * peppered over the figure. Since the visible "Ağrı hissettiğin bölgelere
 * dokun" instruction already carries discoverability, this is now the
 * quietest possible affordance — one small neutral dot at each landmark's
 * centre. Present enough to say "these points are here", not a patch over
 * the body. Selection still reads exclusively from `AnatomyHighlight`'s
 * brand-accent ellipse on top — accent always means "selected".
 */
const HOTSPOT_DOT_RADIUS = 3;

function RegionHotspot({ ellipses, fill }: { ellipses: { cx: number; cy: number; rx: number; ry: number }[]; fill: string }) {
  return (
    <>
      {ellipses.map((e, i) => (
        <Circle key={i} cx={e.cx} cy={e.cy} r={HOTSPOT_DOT_RADIUS} fill={fill} />
      ))}
    </>
  );
}

/** `#rrggbb` → `rgba(r, g, b, alpha)` — derives the translucent highlight fill from the theme's own `colors.brandPrimary`, never a hardcoded second color. */
function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * One currently-selected region, shown as a removable tag ("Neck ×") below
 * the map — the primary way to deselect a region without visually hunting
 * for it back on the silhouette (or, for `chest_ribs`/`other`, without a
 * silhouette spot to find at all). Replaces the old read-only summary pill
 * now that the full region-chip wall is gone: this is the only remaining
 * on-screen list of "what's selected," so it needs to be actionable.
 */
function SelectedRegionTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  return (
    <AccessibleTouchable
      onPress={onRemove}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t("checkIn.bodyRegionRemoveHint")}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xxs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
        borderRadius: radius.standard,
        backgroundColor: colors.selected,
      }}
    >
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary, fontWeight: "600" }}>{label}</Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary, fontWeight: "600" }} accessibilityElementsHidden>
        {"×"}
      </Text>
    </AccessibleTouchable>
  );
}

/**
 * `chest_ribs`/`other` — the two taxonomy members with no honest silhouette
 * spot. Previously full `Chip` pills, which read as two dominant floating
 * form controls competing with the map for attention. Now the same
 * restrained dot-marker language `StiffnessSelector` already established
 * (hollow ring unselected, solid brand dot selected, paired with a
 * text-weight/color change — never color alone) with no pill background at
 * all, so they clearly sit below the body map in visual priority.
 */
function SecondaryAreaOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors, typography, spacing } = useTheme();
  const MARKER_SIZE = 8;
  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs, paddingHorizontal: spacing.xs }}
    >
      <View
        style={{
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          borderRadius: MARKER_SIZE / 2,
          borderWidth: selected ? 0 : 1.5,
          borderColor: colors.borderStrong,
          backgroundColor: selected ? colors.brandPrimary : "transparent",
        }}
      />
      <Text style={{ fontSize: typography.caption.fontSize, fontWeight: selected ? "700" : "400", color: selected ? colors.brandPrimary : colors.textPrimary }}>
        {label}
      </Text>
    </AccessibleTouchable>
  );
}

export function BodyRegionMap({ value, onToggle, priorityAreas = [] }: BodyRegionMapProps) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();

  const selectedRegions = ALL_REGIONS.filter((region) => value.includes(region));
  const highlightFill = hexToRgba(colors.brandPrimary, 0.22);
  // Visual Craft Pass 3.1 §13: the permanent "you can tap here" cues were
  // dialled down to a whisper — a bare, strokeless tint — so the
  // silhouette reads as a considered object sitting in soft space rather
  // than a diagram peppered with outlined target zones.
  const hotspotFill = hexToRgba(colors.textTertiary, 0.32);

  return (
    <View>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.sm }}>
        {t("checkIn.bodyAreaLabel")}
      </Text>

      {/* Informational only — never affects `value`/selection state (see the `priorityAreas` prop doc comment above). */}
      {priorityAreas.length > 0 ? (
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.brandPrimary, marginBottom: spacing.sm }}>
          {t("checkIn.priorityBodyAreasLabel", { areas: priorityAreas.map((area) => t(`checkIn.bodyArea.${area}`)).join(", ") })}
        </Text>
      ) : null}

      {/* Design-I: the silhouette used to sit in its own bordered/filled
          card (fill + 1px border + large radius) — exactly the
          "triple-framing" pattern Design-B retired everywhere else. Open
          composition instead, matching the boxless `Section`s the rest of
          this Check-in form already uses (`CheckInForm.tsx`) — generous
          whitespace alone is enough separation, no frame needed. */}
      <View style={{ alignItems: "center", paddingVertical: spacing.md }}>
        {/* The tap affordance itself — a short, visually secondary
            instruction line, not a tutorial overlay/arrow. Exists because
            a body silhouette alone doesn't self-evidently read as
            "tappable" on first encounter. */}
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, marginBottom: spacing.sm, textAlign: "center" }}>
          {t("checkIn.bodyMapInstruction")}
        </Text>

        <View style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
          <Svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={SILHOUETTE_VIEWBOX} pointerEvents="none">
            {/* Visual Craft Pass 3.1 §13/§19: a decorative atmospheric field
                behind the figure was tried and removed — at this tall,
                narrow scale the organic-mass fragments read as faint lumps
                rather than an even glow, and it added no real value over
                the outline + softened hotspots. "Remove before add." */}
            {/* `borderStrong` outline (WCAG 1.4.11 non-text 3:1 verified) —
                previously `stroke="none"` against a fill barely distinct
                from the screen background, which read as decorative rather
                than as a defined, interactive object. Fill unchanged
                (`surfaceSecondary`, still a plain neutral paper tone — not
                darkened, not clinical). */}
            <Path d={SILHOUETTE_PATH_D} transform={SILHOUETTE_TRANSFORM} fill={colors.surfaceSecondary} stroke={colors.borderStrong} strokeWidth={1} />
            {/* Permanent faint "you can tap here" hotspots, then the
                animated brand-accent selection highlight on top — see
                `RegionHotspot`'s own doc comment. */}
            {ZONE_DRAW_ORDER.map((region) => (
              <RegionHotspot key={region} ellipses={REGION_ELLIPSES[region]} fill={hotspotFill} />
            ))}
            {ZONE_DRAW_ORDER.map((region) => (
              <AnatomyHighlight
                key={region}
                ellipses={REGION_ELLIPSES[region]}
                selected={value.includes(region)}
                accent={colors.brandPrimary}
                fill={highlightFill}
              />
            ))}
          </Svg>

          {/* Invisible touch targets — the visible highlight above is the only thing the user ever sees; these just carry accessibility + hit area, one per region including both shoulder sides.
              Design-I: hitSlop raised from 10→17 (adding 34pt total per
              dimension) — the smallest region (`neck`, a 10×12 rectangle)
              was landing at a ~30×32 effective touch area, under the 44pt
              floor; every region now clears 44×44 comfortably. The
              existing draw-order-based overlap resolution (later entries
              win) already anticipates adjacent zones' hit areas
              overlapping, so a larger uniform hitSlop is safe here. */}
          {ZONE_DRAW_ORDER.map((region) => (
            <Pressable
              key={region}
              onPress={() => onToggle(region)}
              hitSlop={17}
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

        {/* Selected-regions summary — immediately below the map (tight
            spacing, no chest_ribs/other row in between) so it reads as
            integrated with the body map moment, not as a separate list
            further down the screen.

            Craft 3.1 review §6: the empty-state hint ("Bugün ağrı
            hissettiğin bölgeleri seçebilirsin.") was removed — it repeated
            the "Ağrı hissettiğin bölgelere dokun" instruction already
            shown right above the silhouette. One clear instruction only;
            the absence of any selected tags is itself the empty state. */}
        {selectedRegions.length > 0 ? (
          <View style={{ marginTop: spacing.sm, paddingHorizontal: spacing.md, width: "100%" }}>
            <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, marginBottom: spacing.xxs, textAlign: "center" }}>
              {t("checkIn.bodyAreaSelectedListLabel")}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.xs }}>
              {selectedRegions.map((region) => (
                <SelectedRegionTag key={region} label={t(`checkIn.bodyArea.${region}`)} onRemove={() => onToggle(region)} />
              ))}
            </View>
          </View>
        ) : null}

        {/* The two taxonomy members with no honest silhouette spot —
            visually demoted below the whole map+summary moment (not
            sandwiched between them), under their own small label, using
            the same restrained dot-marker language as `StiffnessSelector`
            rather than full `Chip` pills — clearly secondary to tapping
            the body itself. */}
        <View style={{ marginTop: spacing.lg, alignItems: "center" }}>
          <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
            {t("checkIn.otherAreasLabel")}
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            {NON_SILHOUETTE_REGIONS.map((region) => (
              <SecondaryAreaOption
                key={region}
                label={t(`checkIn.bodyArea.${region}`)}
                selected={value.includes(region)}
                onPress={() => onToggle(region)}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
