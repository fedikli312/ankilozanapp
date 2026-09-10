/**
 * Color tokens — Design System 2.0, "Paper & Ink" (Product Design Reset,
 * Phase Design-B). Supersedes the Product 2.0 warm-cream/deep-green
 * palette (`docs/REDESIGN_SPECIFICATION.md` §2.2) as the token layer's
 * primary vocabulary, per `docs/DESIGN_DIRECTION_2_0.md` §5 and
 * `docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §11's dark-mode specification.
 *
 * NEW semantic roles (use these in all new code):
 *   background       — the overall screen canvas ("paper").
 *   surfaceSecondary — secondary grouped-content fill (segmented-control
 *                       track, input fill) — one step off background.
 *   surfaceElevated  — true elevated content, reserved for genuinely
 *                       distinct moments (a hero metric, one highlighted
 *                       card) — never the default container.
 *
 *   NOTE — `surface` is deliberately NOT reused as a new-role name here.
 *   Under the committed pre-Design-B palette, `surface` meant "true/near-
 *   white elevated container" (`#FFFFFF` light) — exactly what this system
 *   now calls `surfaceElevated`. Reusing the bare key for the different
 *   "secondary fill" role (as an earlier draft of this file did) would
 *   have silently swapped consumers' background to the wrong color with
 *   no type error — hence the new role got its own name instead, mirroring
 *   the `accent`/`accentRare` precedent below. As of Design-I's final
 *   cleanup pass, every original consumer (`BodyRegionMap`,
 *   `StiffnessSelector`, `PainScale`, `paywall`, `SelectableCard`,
 *   `breathing/index`, `MetricCard`) has migrated, been redesigned, or
 *   been deleted, so the `surface` alias itself (along with `accent`,
 *   `backgroundWarm`, `surfaceHighlight`, `borderHairline` — confirmed
 *   zero remaining consumers the same way) was removed rather than kept
 *   as dead vocabulary.
 *   textPrimary/Secondary/Tertiary — three-tier text hierarchy; tertiary
 *                       is for metadata (dates, counts) and is real,
 *                       WCAG-AA-verified body text, not decoration.
 *   hairline         — divider lines between rows/sections.
 *   borderStrong     — a more visible border (inputs, selected-state
 *                       outlines) — WCAG 1.4.11 non-text 3:1 verified.
 *   brandPrimary     — the one reserved action/emphasis color (muted
 *                       terracotta) — at most one action per screen.
 *   brandSecondary   — a quieter secondary-emphasis tone (deep warm
 *                       brown), for secondary buttons/less-prominent
 *                       brand moments.
 *   accentRare       — the rare dusty-gold milestone accent (Design
 *                       Direction §5) — genuine-milestone moments only,
 *                       never routine UI. (Named `accentRare`, not
 *                       `accent`, specifically so it never collided with
 *                       the now-removed legacy `accent` alias, which
 *                       ~70 screens used for the one-reserved-action-color
 *                       role during the Design-B→I rollout, before every
 *                       one of them migrated to `brandPrimary`.)
 *   positive/attention/critical — status roles, reserved for their named
 *                       purpose only. `critical` is reserved for real
 *                       safety alerts (a missed-dose reminder, an overdue
 *                       lab) — NEVER for color-coding a symptom value.
 *                       Pain 9 does not become `critical` red; a recorded
 *                       number is always neutral `textPrimary`.
 *   dataPrimary/Secondary/Tertiary — a restrained 3-color family for the
 *                       rare cases a chart needs more than one series
 *                       (e.g. a lab reference-range band) — never a
 *                       per-tracked-variable rainbow.
 *   selected/pressed/disabled — interactive-state fills. Every selected
 *                       state in this system pairs a fill/border change
 *                       WITH a shape/icon/text signal — never color alone
 *                       (`ToggleRow`'s native Switch, `Chip`'s checkmark).
 *
 * LEGACY aliases (`statusSuccess/Warning/Danger/Neutral`) are kept, mapped
 * onto the new values, for the screens still consuming the old names
 * (`docs/DESIGN_REDESIGN_PLAN_2_0.md` §26, "temporary legacy
 * compatibility... do not contort the new system to preserve the old
 * look, but do preserve functionality") — real, active consumers as of
 * Design-I's final pass (form validation errors, reminder-off notices),
 * not dead weight, so they were kept rather than migrated wholesale just
 * for naming's sake. `accent`, `backgroundWarm`, `surface`,
 * `surfaceHighlight`, and `borderHairline` were the same kind of alias but
 * had reached zero remaining consumers, so they were removed instead
 * (tracked in `docs/DESIGN_SYSTEM_2_0_IMPLEMENTATION.md`). New code should
 * always use the new semantic names.
 *
 * Every text/background pairing below is WCAG AA-verified (4.5:1 normal
 * text, 3:1 large text/non-text UI boundaries) — see that same
 * implementation doc for the verification method and full results table.
 * Values were adjusted from `docs/DESIGN_DIRECTION_2_0.md`'s original
 * proposal wherever verification failed (e.g. the originally-proposed
 * dusty-gold accent measured 2.72:1 as text and was darkened to 4.68:1) —
 * the implemented, verified system wins over the earlier research-doc hex
 * values, per the Design-A2 approval's explicit instruction.
 *
 * Status colors are reserved for their named purpose only — never used to
 * color-code symptom severity or medical values (unchanged rule, restated
 * for Design System 2.0).
 */

export type ColorTokens = {
  // New semantic roles
  background: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  hairline: string;
  borderStrong: string;
  brandPrimary: string;
  brandSecondary: string;
  accentRare: string;
  positive: string;
  attention: string;
  critical: string;
  dataPrimary: string;
  dataSecondary: string;
  dataTertiary: string;
  selected: string;
  pressed: string;
  disabled: string;
  accentForeground: string;

  // Legacy aliases — see file-level doc comment. Do not add new consumers.
  statusSuccess: string;
  statusWarning: string;
  statusDanger: string;
  statusNeutral: string;
};

export const lightColors: ColorTokens = {
  background: "#FAF7F2",
  surfaceSecondary: "#F5F1EB",
  surfaceElevated: "#FFFFFF",
  textPrimary: "#1C1917",
  textSecondary: "#6B6560",
  textTertiary: "#786F66",
  hairline: "#E8E2D8",
  borderStrong: "#93887A",
  brandPrimary: "#AD5335",
  brandSecondary: "#6B4A3A",
  accentRare: "#8C6A1F",
  positive: "#557259",
  attention: "#8F6222",
  critical: "#C0392B",
  dataPrimary: "#AD5335",
  dataSecondary: "#557259",
  dataTertiary: "#8C6A1F",
  selected: "#F3E4DC",
  pressed: "#EFE8DE",
  disabled: "#948A7C",
  accentForeground: "#FFFFFF",

  // Legacy aliases
  statusSuccess: "#557259",
  statusWarning: "#8F6222",
  statusDanger: "#C0392B",
  statusNeutral: "#786F66",
};

export const darkColors: ColorTokens = {
  background: "#1A1714",
  surfaceSecondary: "#211D19",
  surfaceElevated: "#28231E",
  textPrimary: "#EDE6DC",
  textSecondary: "#A89E92",
  textTertiary: "#8B8175",
  hairline: "#332D26",
  borderStrong: "#736958",
  brandPrimary: "#D97B5C",
  brandSecondary: "#B08567",
  accentRare: "#D4AF5D",
  positive: "#7FA382",
  attention: "#C99A4A",
  critical: "#D9695C",
  dataPrimary: "#D97B5C",
  dataSecondary: "#7FA382",
  dataTertiary: "#D4AF5D",
  selected: "#3D2A22",
  pressed: "#2C2620",
  disabled: "#736958",
  accentForeground: "#1A1714",

  // Legacy aliases
  statusSuccess: "#7FA382",
  statusWarning: "#C99A4A",
  statusDanger: "#D9695C",
  statusNeutral: "#8B8175",
};
