import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";

export type IoniconName = ComponentProps<typeof Ionicons>["name"];

/**
 * Icon-usage rules — Design System 2.0 (Phase Design-B §14).
 *
 * `Ionicons` remains the technical icon source (no new icon-font/asset
 * pipeline added this phase) — what changes is HOW icons are used, not
 * where they come from. Every icon in the app must be one of:
 *
 *   FUNCTIONAL  — communicates an action or a data type at a glance
 *                 (a domain icon on a `ListRow`, per `DOMAIN_ICONS` below).
 *   STATUS      — communicates a state (taken/missed, completed, selected)
 *                 — always paired with text/shape, never color alone.
 *   NAVIGATION  — a tab-bar or header icon.
 *   BRAND       — `MarginMark` only. Never a generic Ionicons glyph
 *                 standing in for the logo (the exact anti-pattern
 *                 `docs/DESIGN_RESEARCH_2_0.md` §3 found: `leaf-outline`
 *                 reused as onboarding's AND the paywall's brand mark).
 *   DECORATIVE  — scene-setting only, no functional meaning. Per the
 *                 Design-B brief: "decorative icons should usually
 *                 disappear." No new decorative icon should be added by
 *                 this phase or later phases; existing ones (e.g. the
 *                 icon-in-a-circle above every onboarding screen's title)
 *                 are removed screen-by-screen as each screen is actually
 *                 redesigned (Design-C onward) — Design-B does not retrofit
 *                 every existing screen, per its own "do not redesign
 *                 these screens yet" constraint.
 *
 * `leaf-outline`, generic sparkle/star glyphs, and any icon used purely
 * for scene-setting are retired from every BRAND-visible surface as of
 * this phase (the new navigation shell and `Wordmark`/`MarginMark` never
 * use them) — their removal from onboarding/paywall's own JSX is deferred
 * to the phases that redesign those specific screens (Design-C).
 */
export type IconRole = "functional" | "status" | "navigation" | "brand" | "decorative";

/**
 * One icon per core domain, never reused across unrelated meanings — the
 * exact anti-pattern found in the current app (`flask-outline` labeling
 * both CRP and ESR with no visual way to tell them apart,
 * `docs/DESIGN_RESEARCH_2_0.md` §3). Applied to the new navigation shell
 * now; applying it retroactively to every existing screen's own icon
 * choices is deferred to each screen's own redesign phase.
 */
export const DOMAIN_ICONS: Record<
  "symptoms" | "medication" | "injection" | "labs" | "appointments" | "timeline" | "profile",
  { outline: IoniconName; filled: IoniconName }
> = {
  symptoms: { outline: "pulse-outline", filled: "pulse" },
  medication: { outline: "medkit-outline", filled: "medkit" },
  injection: { outline: "medical-outline", filled: "medical" },
  labs: { outline: "flask-outline", filled: "flask" },
  appointments: { outline: "calendar-outline", filled: "calendar" },
  timeline: { outline: "time-outline", filled: "time" },
  profile: { outline: "settings-outline", filled: "settings" },
};
