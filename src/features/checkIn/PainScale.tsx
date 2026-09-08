import { useTranslation } from "@/localization";

import { NumericScale } from "./NumericScale";

export type PainScaleProps = {
  value: number;
  onChange: (value: number) => void;
  /** True when the user explicitly flagged Pain as a priority symptom at onboarding (Phase R brief §11) — a restrained text-only indicator next to the title, never a reorder or a hidden/changed field. */
  priorityIndicator?: boolean;
};

/**
 * The 0-10 pain selector — preserves the exact stored 0-10 integer
 * precision (unchanged since Phase O/W/X). Phase Design-D: now a thin
 * wrapper around the shared `NumericScale` interaction family (see that
 * file's own doc comment) rather than its own bespoke dot-track widget, so
 * Pain and Fatigue read as one interaction language instead of two.
 *
 * Anchor labels describe the reported *sensation* only ("None" / a neutral
 * mid-scale word / "Very intense") — never disease severity, never
 * "mild/moderate/severe" applied to the condition itself. No color
 * gradient across the scale — pain is never color-coded by severity.
 */
export function PainScale({ value, onChange, priorityIndicator }: PainScaleProps) {
  const { t } = useTranslation();

  return (
    <NumericScale
      label={t("checkIn.pain.title")}
      value={value}
      onChange={onChange}
      anchorLow={t("checkIn.pain.anchorNone")}
      anchorMid={t("checkIn.pain.anchorMid")}
      anchorHigh={t("checkIn.pain.anchorMax")}
      priorityIndicatorLabel={priorityIndicator ? t("checkIn.priorityIndicator") : undefined}
      accessibilityValueLabel={t("checkIn.painLabel", { value })}
    />
  );
}
