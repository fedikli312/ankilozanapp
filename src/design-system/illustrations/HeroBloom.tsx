import Svg from "react-native-svg";

import { useTheme } from "../useTheme";
import { AnchorDot, AtmosphereField, ContourLine, MarginBracket, OrganicMass } from "./atmosphere";

/**
 * Composition variants. Each is a genuinely different *arrangement* of the
 * shared atmosphere fragments (`./atmosphere.tsx`) — different layering,
 * different dominant element, different distribution of negative space —
 * not the same shapes nudged around. `bloom` stays the default so callers
 * that don't opt in get the balanced composition.
 */
export type HeroBloomVariant = "bloom" | "dawn" | "drift";

export type HeroBloomProps = {
  width: number;
  height: number;
  /** Composition variant — defaults to `bloom`. */
  variant?: HeroBloomVariant;
};

/**
 * Art Direction 3.0 brand atmosphere, rebuilt in Visual Craft Pass 3.1
 * (`docs/VISUAL_CRAFT_PASS_3_1.md` §6). Previously three flat translucent
 * ellipses; now a deliberately layered composition — a soft out-of-focus
 * field behind, one or two organic contoured masses mid-depth with real
 * tonal overlap, a single hand-drawn-feeling contour line, and one crisp
 * foreground anchor sitting in negative space. Still abstract, still built
 * only from `react-native-svg` primitives and the three existing
 * illustration-accent tokens (`brandPrimary` / `accentRare` / `positive`)
 * at low alpha, still purely decorative (`accessibilityElementsHidden` at
 * every call site), still dark-mode-safe (all colours are theme tokens).
 */
export function HeroBloom({ width, height, variant = "bloom" }: HeroBloomProps) {
  const { colors } = useTheme();
  const w = width;
  const h = height;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {variant === "bloom" ? (
        <>
          {/* far: soft field, weighted left so the right third stays open */}
          <AtmosphereField cx={w * 0.38} cy={h * 0.48} rx={w * 0.46} ry={h * 0.62} tone={colors.brandPrimary} opacity={0.11} />
          {/* mid: one dominant mass + one smaller gold accent overlapping it — the overlap is the deliberate moment */}
          <OrganicMass cx={w * 0.34} cy={h * 0.5} rx={w * 0.24} ry={h * 0.34} fill={colors.brandPrimary} opacity={0.12} seed={0} rotate={-12} />
          <OrganicMass cx={w * 0.5} cy={h * 0.4} rx={w * 0.15} ry={h * 0.22} fill={colors.accentRare} opacity={0.13} seed={1} rotate={16} />
          {/* near-mid: one calm contour skimming below the mass like a margin rule, not slicing through it */}
          <ContourLine
            points={[
              { x: w * 0.02, y: h * 0.74 },
              { x: w * 0.36, y: h * 0.66 },
              { x: w * 0.72, y: h * 0.5 },
              { x: w * 0.98, y: h * 0.44 },
            ]}
            stroke={colors.brandSecondary}
            width={1.75}
            opacity={0.32}
          />
          {/* near: one crisp anchor in the open right third */}
          <AnchorDot cx={w * 0.82} cy={h * 0.26} r={3} fill={colors.brandPrimary} ring />
        </>
      ) : null}

      {variant === "dawn" ? (
        <>
          {/* high, wide field — most of the frame is quiet light */}
          <AtmosphereField cx={w * 0.52} cy={h * 0.2} rx={w * 0.6} ry={h * 0.78} tone={colors.brandPrimary} opacity={0.1} />
          {/* one low, wide gold mass sitting along the base like a horizon */}
          <OrganicMass cx={w * 0.46} cy={h * 0.82} rx={w * 0.42} ry={h * 0.26} fill={colors.accentRare} opacity={0.11} seed={3} rotate={-5} />
          {/* the brand tie, small, upper-left */}
          <MarginBracket x={w * 0.09} y={h * 0.18} size={Math.min(w, h) * 0.26} stroke={colors.brandSecondary} width={1.75} opacity={0.36} />
          <AnchorDot cx={w * 0.86} cy={h * 0.78} r={2.5} fill={colors.accentRare} />
        </>
      ) : null}

      {variant === "drift" ? (
        <>
          {/* field pushed right; left side carries only line + anchor */}
          <AtmosphereField cx={w * 0.72} cy={h * 0.5} rx={w * 0.46} ry={h * 0.64} tone={colors.brandPrimary} opacity={0.1} />
          {/* the line is the subject here — one long calm drift across the frame */}
          <ContourLine
            points={[
              { x: w * -0.02, y: h * 0.44 },
              { x: w * 0.34, y: h * 0.5 },
              { x: w * 0.68, y: h * 0.36 },
              { x: w * 1.02, y: h * 0.42 },
            ]}
            stroke={colors.brandPrimary}
            width={2}
            opacity={0.3}
          />
          {/* one supporting mass, right of centre, resting on the line */}
          <OrganicMass cx={w * 0.76} cy={h * 0.58} rx={w * 0.15} ry={h * 0.24} fill={colors.accentRare} opacity={0.12} seed={2} rotate={14} />
          {/* two anchors set a quiet rhythm along the line */}
          <AnchorDot cx={w * 0.14} cy={h * 0.47} r={3} fill={colors.brandPrimary} ring />
          <AnchorDot cx={w * 0.5} cy={h * 0.42} r={2} fill={colors.accentRare} />
        </>
      ) : null}
    </Svg>
  );
}
