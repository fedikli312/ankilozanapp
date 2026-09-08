import { useTranslation } from "@/localization";

import { NumericScale } from "./NumericScale";

export type FatigueSelectorProps = {
  value: number;
  onChange: (value: number) => void;
  /** True when the user explicitly flagged Fatigue as a priority symptom at onboarding (Phase R brief §11). */
  priorityIndicator?: boolean;
};

/**
 * The 0-10 fatigue selector — preserves the exact stored 0-10 integer
 * precision (`daily_check_in.fatigue`, no enum). Phase Design-D: now a
 * thin wrapper around the shared `NumericScale` interaction family (see
 * that file's own doc comment), replacing the earlier deliberately-
 * distinct ascending-bar-chart widget — Design-D's brief explicitly
 * reverses that Product 2.0 instruction ("Pain / Stiffness / Fatigue must
 * feel like members of ONE interaction family... do not visually redesign
 * each metric independently"), so Fatigue now shares Pain's exact visual
 * language rather than deliberately differing from it.
 *
 * No low-to-high color gradient — a single brand color at every value.
 */
export function FatigueSelector({ value, onChange, priorityIndicator }: FatigueSelectorProps) {
  const { t } = useTranslation();

  return (
    <NumericScale
      label={t("checkIn.fatigue.title")}
      value={value}
      onChange={onChange}
      anchorLow={t("checkIn.fatigue.anchorNone")}
      anchorMid={t("checkIn.fatigue.anchorMid")}
      anchorHigh={t("checkIn.fatigue.anchorMax")}
      priorityIndicatorLabel={priorityIndicator ? t("checkIn.priorityIndicator") : undefined}
      accessibilityValueLabel={t("checkIn.fatigueLabel", { value })}
    />
  );
}
