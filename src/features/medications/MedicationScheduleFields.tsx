import { Text, View } from "react-native";

import type { FrequencyType } from "../../domain/scheduling/types";
import { Chip, StepperField, ToggleRow, useTheme } from "../../design-system";
import { useTranslation } from "../../localization";

export type MedicationScheduleFieldsValue = {
  frequencyType: FrequencyType;
  intervalDays: number;
  daysOfWeek: number[];
  /** HH:mm — a single time in this batch (see useMedications.ts). */
  timeOfDay: string;
  reminderEnabled: boolean;
};

export type MedicationScheduleFieldsProps = {
  value: MedicationScheduleFieldsValue;
  onChange: (value: MedicationScheduleFieldsValue) => void;
  reminderDescription: string;
};

const FREQUENCY_OPTIONS: FrequencyType[] = ["daily", "specific_days", "custom_interval"];

export function MedicationScheduleFields({ value, onChange, reminderDescription }: MedicationScheduleFieldsProps) {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();

  const [hourStr, minuteStr] = value.timeOfDay.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  const setTime = (nextHour: number, nextMinute: number) => {
    onChange({
      ...value,
      timeOfDay: `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`,
    });
  };

  return (
    <View>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
        {t("medications.form.frequency")}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md }}>
        {FREQUENCY_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={t(`medications.form.frequency${labelSuffix(option)}`)}
            selected={value.frequencyType === option}
            onPress={() => onChange({ ...value, frequencyType: option })}
          />
        ))}
      </View>

      {value.frequencyType === "specific_days" ? (
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
            {t("medications.form.daysOfWeek")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <Chip
                key={day}
                label={t(`common.weekday.${day}`)}
                selected={value.daysOfWeek.includes(day)}
                onPress={() =>
                  onChange({
                    ...value,
                    daysOfWeek: value.daysOfWeek.includes(day)
                      ? value.daysOfWeek.filter((d) => d !== day)
                      : [...value.daysOfWeek, day].sort(),
                  })
                }
              />
            ))}
          </View>
        </View>
      ) : null}

      {value.frequencyType === "custom_interval" ? (
        <View style={{ marginBottom: spacing.md, alignItems: "flex-start" }}>
          <StepperField
            label={t("medications.form.intervalDays")}
            value={value.intervalDays}
            min={2}
            max={90}
            onChange={(intervalDays) => onChange({ ...value, intervalDays })}
          />
        </View>
      ) : null}

      <View style={{ marginBottom: spacing.md, alignItems: "flex-start" }}>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
          {t("medications.form.time")}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.lg }}>
          <StepperField label="HH" value={hour} min={0} max={23} onChange={(h) => setTime(h, minute)} formatValue={(v) => String(v).padStart(2, "0")} />
          <StepperField label="MM" value={minute} min={0} max={59} onChange={(m) => setTime(hour, m)} formatValue={(v) => String(v).padStart(2, "0")} />
        </View>
      </View>

      <ToggleRow
        label={t("medications.form.reminderToggle")}
        description={reminderDescription}
        value={value.reminderEnabled}
        onValueChange={(reminderEnabled) => onChange({ ...value, reminderEnabled })}
      />
    </View>
  );
}

function labelSuffix(frequency: FrequencyType): string {
  if (frequency === "daily") return "Daily";
  if (frequency === "specific_days") return "SpecificDays";
  return "CustomInterval";
}
