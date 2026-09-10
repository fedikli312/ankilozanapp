import { useId } from "react";
import { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";

/**
 * The Ilium brand-atmosphere primitive family — Visual Craft Pass 3.1
 * (`docs/VISUAL_CRAFT_PASS_3_1.md` §5).
 *
 * The proof-phase `HeroBloom` was three translucent ellipses: it read as
 * developer SVG decoration, not art direction. This module replaces that
 * with a small set of *composable fragments* that share one visual DNA —
 * organic bezier contour (never a bare ellipse), a restrained three-token
 * palette at low alpha, controlled asymmetry, real foreground/background
 * layering, and deliberate negative space. `HeroBloom` (and any future
 * atmosphere composition) is assembled from these, so every surface can
 * look intentionally arranged without a bespoke illustration per screen.
 *
 * Every fragment renders raw `react-native-svg` children and MUST be
 * placed inside a parent `<Svg>`. None carry accessibility semantics —
 * the composition's call site marks the whole `<Svg>` decorative.
 *
 * Fragments:
 *   AtmosphereField  far, soft, out-of-focus ground wash + halo
 *   OrganicMass      a mid-depth asymmetric contour shape
 *   ContourLine      a single open, hand-drawn-feeling curve (the "line work")
 *   AnchorDot        a small crisp foreground accent, for negative space
 *   MarginBracket    a fragment of the Margin Mark's corner bracket — ties atmosphere to identity
 */

/**
 * Smooth closed blob path through `mults.length` points spaced evenly
 * around an ellipse, each point's radius scaled by its `mults` entry so
 * the silhouette is organically asymmetric rather than a perfect oval.
 * Points are joined with Catmull-Rom-derived cubic Béziers for a
 * continuous, tension-free contour.
 */
export function blobPath(cx: number, cy: number, rx: number, ry: number, mults: number[], rotateRad = 0): string {
  const n = mults.length;
  const pts = mults.map((m, i) => {
    const a = rotateRad + (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(a) * rx * m, y: cy + Math.sin(a) * ry * m };
  });
  const k = 0.5; // Catmull-Rom tension → Bézier handle length
  let d = `M ${round(pts[0].x)} ${round(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + ((p2.x - p0.x) / 6) * k * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * k * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * k * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * k * 2;
    d += ` C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2.x)} ${round(p2.y)}`;
  }
  return `${d} Z`;
}

/** Smooth open curve through the given points (Catmull-Rom → cubic Bézier). */
export function curvePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2.x)} ${round(p2.y)}`;
  }
  return d;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export type AtmosphereFieldProps = {
  /** Halo centre + reach, in the parent viewBox's units. */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Base tone for the wash (a theme color). */
  tone: string;
  /** Peak opacity at the halo centre (default 0.12). */
  opacity?: number;
};

/**
 * The far layer: a soft radial halo plus one very large, very faint
 * organic mass drifting off one edge, so the composition has depth and
 * doesn't sit flat on the canvas. Deliberately low-contrast — it is
 * background, never a shape you "read".
 */
export function AtmosphereField({ cx, cy, rx, ry, tone, opacity = 0.12 }: AtmosphereFieldProps) {
  const id = useId().replace(/[:]/g, "");
  return (
    <>
      <Defs>
        <RadialGradient id={`af-${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={tone} stopOpacity={opacity} />
          <Stop offset="70%" stopColor={tone} stopOpacity={opacity * 0.35} />
          <Stop offset="100%" stopColor={tone} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path
        d={blobPath(cx, cy, rx * 1.25, ry * 1.25, [1.08, 0.9, 1.15, 0.86, 1.1, 0.94], 0.4)}
        fill={`url(#af-${id})`}
      />
      <Path
        d={blobPath(cx + rx * 0.55, cy - ry * 0.35, rx * 0.85, ry * 0.8, [0.9, 1.12, 0.82, 1.08, 0.88, 1.06], 1.1)}
        fill={tone}
        fillOpacity={opacity * 0.4}
      />
    </>
  );
}

export type OrganicMassProps = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
  opacity: number;
  /** One of a few fixed asymmetry profiles so masses in a family relate without repeating. */
  seed?: 0 | 1 | 2 | 3;
  /** Rotation in degrees. */
  rotate?: number;
};

const MASS_SEEDS: number[][] = [
  [1.06, 0.82, 1.14, 0.78, 1.1, 0.9],
  [0.86, 1.16, 0.8, 1.1, 0.92, 1.04],
  [1.12, 0.9, 0.84, 1.18, 0.88, 0.98],
  [0.94, 1.08, 1.0, 0.82, 1.16, 0.86],
];

/** A mid-depth shape with an organic, slightly lopsided contour — the element that used to be a plain `<Ellipse>`. */
export function OrganicMass({ cx, cy, rx, ry, fill, opacity, seed = 0, rotate = 0 }: OrganicMassProps) {
  return (
    <Path
      d={blobPath(cx, cy, rx, ry, MASS_SEEDS[seed])}
      fill={fill}
      fillOpacity={opacity}
      transform={rotate ? `rotate(${rotate} ${round(cx)} ${round(cy)})` : undefined}
    />
  );
}

export type ContourLineProps = {
  points: { x: number; y: number }[];
  stroke: string;
  width: number;
  opacity?: number;
};

/** A single open, gently curved stroke — the family's "line work", echoing the spine curve / a margin rule. */
export function ContourLine({ points, stroke, width, opacity = 0.5 }: ContourLineProps) {
  return (
    <Path
      d={curvePath(points)}
      stroke={stroke}
      strokeWidth={width}
      strokeOpacity={opacity}
      strokeLinecap="round"
      fill="none"
    />
  );
}

export type AnchorDotProps = {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  /** Draw a thin concentric ring just outside the dot for a crisper foreground read. */
  ring?: boolean;
};

/** The one crisp, higher-contrast foreground accent — placed in negative space, never in the busy area. */
export function AnchorDot({ cx, cy, r, fill, ring }: AnchorDotProps) {
  return (
    <>
      {ring ? <Circle cx={cx} cy={cy} r={r + r * 1.9} stroke={fill} strokeWidth={1} strokeOpacity={0.5} fill="none" /> : null}
      <Circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={0.9} />
    </>
  );
}

export type MarginBracketProps = {
  /** Top-left corner of the bracket's bounding box, in parent viewBox units. */
  x: number;
  y: number;
  size: number;
  stroke: string;
  width: number;
  opacity?: number;
};

/**
 * A fragment of the Margin Mark's corner bracket (`MarginMark`'s own
 * `M7 5 L7 17 L17 17` gesture), scaled and placed as a compositional
 * element — the one explicit tie between the abstract atmosphere and the
 * brand identity, used sparingly (one variant only).
 */
export function MarginBracket({ x, y, size, stroke, width, opacity = 0.45 }: MarginBracketProps) {
  const d = `M ${round(x)} ${round(y)} L ${round(x)} ${round(y + size)} L ${round(x + size * 0.8)} ${round(y + size)}`;
  return (
    <Path
      d={d}
      stroke={stroke}
      strokeWidth={width}
      strokeOpacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}
