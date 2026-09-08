import type { TimelineEventType } from "../../domain/timeline";

export type TimelineMarkerShape = "circle" | "square" | "diamond" | "ring" | "doubleRing" | "bar";

/**
 * "routine" — a frequent, everyday record (a daily check-in, a taken dose)
 * — smaller marker, quieter ink.
 * "anchor" — a less frequent event the rest of the record orients around
 * (a lab result, an appointment, an explicitly declared High-Symptom Day)
 * — slightly larger marker. This is information architecture only (brief
 * §9): it never implies clinical severity, danger, improvement, or
 * worsening — purely how often this kind of thing happens.
 */
export type TimelineMarkerTier = "routine" | "anchor";

export type TimelineMarkerSpec = {
  shape: TimelineMarkerShape;
  tier: TimelineMarkerTier;
};

/**
 * Design System 2.0, Phase Design-E — the Timeline's shape-based event
 * taxonomy (brief §5). Every event type gets one geometric marker, never a
 * pictorial icon, so the Timeline reads as a considered record rather than
 * an icon-per-row list — and every shape here remains distinguishable by
 * silhouette alone, with no reliance on color (verified: circle, square,
 * diamond, ring, double-ring, and bar are six genuinely different outlines,
 * not decorative variations of one shape).
 *
 * `high_symptom_day` is the one type that also gets the brand accent color
 * (`brandPrimary`, applied by `TimelineMarker`, not here) — matching
 * `docs/DESIGN_DIRECTION_VALIDATION_2_0.md`'s own approved Timeline
 * research ("Warm accent for High-Symptom Day only; everything else
 * neutral"). Every other marker, including the other two "anchor" types
 * (lab, appointment), stays neutral ink — size/shape carry their emphasis,
 * not color, so nothing on the Timeline reads as more clinically important
 * than anything else by hue.
 */
export const TIMELINE_EVENT_MARKERS: Record<TimelineEventType, TimelineMarkerSpec> = {
  check_in: { shape: "circle", tier: "routine" },
  medication: { shape: "square", tier: "routine" },
  injection: { shape: "diamond", tier: "routine" },
  lab: { shape: "ring", tier: "anchor" },
  appointment: { shape: "doubleRing", tier: "anchor" },
  high_symptom_day: { shape: "bar", tier: "anchor" },
};
