import { useState } from "react";
import { Text, View } from "react-native";

import { Button, Chip, StepperField, TextField, ToggleRow, useTheme } from "../../design-system";
import { useTranslation } from "../../localization";
import type { CreateAppointmentInput } from "../../repositories";

export type AppointmentFormOutput = {
  type: CreateAppointmentInput["type"];
  doctorOrInstitution?: string;
  /** 0 = today. Both add and edit express the date as an offset from today — the approved stepper/relative-day control (no native date picker), consistent with medication/injection date entry. */
  daysFromToday: number;
  time?: string;
  notes?: string;
  reminderEnabled: boolean;
  reminderLeadDays: number;
};

export type AppointmentFormProps = {
  initialValue?: Partial<AppointmentFormOutput>;
  onSubmit: (input: AppointmentFormOutput) => Promise<void> | void;
  submitting?: boolean;
  submitLabel: string;
};

const APPOINTMENT_TYPES: CreateAppointmentInput["type"][] = [
  "rheumatology",
  "laboratory",
  "imaging",
  "other",
];

export function AppointmentForm({ initialValue, onSubmit, submitting, submitLabel }: AppointmentFormProps) {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();

  const [type, setType] = useState<CreateAppointmentInput["type"]>(initialValue?.type ?? "rheumatology");
  const [doctorOrInstitution, setDoctorOrInstitution] = useState(initialValue?.doctorOrInstitution ?? "");
  const [daysFromToday, setDaysFromToday] = useState(initialValue?.daysFromToday ?? 7);
  const [hasTime, setHasTime] = useState(initialValue?.time !== undefined);
  const [hour, setHour] = useState(initialValue?.time ? Number(initialValue.time.split(":")[0]) : 9);
  const [minute, setMinute] = useState(initialValue?.time ? Number(initialValue.time.split(":")[1]) : 0);
  const [notes, setNotes] = useState(initialValue?.notes ?? "");
  const [reminderEnabled, setReminderEnabled] = useState(initialValue?.reminderEnabled ?? true);
  const [reminderLeadDays, setReminderLeadDays] = useState(initialValue?.reminderLeadDays ?? 1);

  const handleSave = () => {
    onSubmit({
      type,
      doctorOrInstitution: doctorOrInstitution.trim() || undefined,
      daysFromToday,
      time: hasTime ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` : undefined,
      notes: notes.trim() || undefined,
      reminderEnabled,
      reminderLeadDays,
    });
  };

  return (
    <View>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
        {t("appointments.form.type")}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md }}>
        {APPOINTMENT_TYPES.map((option) => (
          <Chip key={option} label={t(`appointments.type.${option}`)} selected={type === option} onPress={() => setType(option)} />
        ))}
      </View>

      <TextField
        label={t("appointments.form.doctorOrInstitution")}
        value={doctorOrInstitution}
        onChangeText={setDoctorOrInstitution}
        placeholder={t("appointments.form.doctorOrInstitutionPlaceholder")}
      />

      <View style={{ marginBottom: spacing.md, alignItems: "flex-start" }}>
        <StepperField
          label={t("appointments.form.date")}
          value={daysFromToday}
          min={0}
          max={365}
          onChange={setDaysFromToday}
          formatValue={(v) => (v === 0 ? t("appointments.form.today") : `+${v}d`)}
        />
      </View>

      <ToggleRow label={t("appointments.form.addTime")} value={hasTime} onValueChange={setHasTime} />
      {hasTime ? (
        <View style={{ marginBottom: spacing.md, alignItems: "flex-start" }}>
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            <StepperField label="HH" value={hour} min={0} max={23} onChange={setHour} formatValue={(v) => String(v).padStart(2, "0")} />
            <StepperField label="MM" value={minute} min={0} max={59} onChange={setMinute} formatValue={(v) => String(v).padStart(2, "0")} />
          </View>
        </View>
      ) : null}

      <TextField
        label={t("appointments.form.notes")}
        value={notes}
        onChangeText={setNotes}
        placeholder={t("appointments.form.notesPlaceholder")}
        multiline
      />

      <ToggleRow
        label={t("appointments.form.reminderToggle")}
        description={t("onboarding.reminderPrompt")}
        value={reminderEnabled}
        onValueChange={setReminderEnabled}
      />
      {reminderEnabled ? (
        <View style={{ marginBottom: spacing.md, alignItems: "flex-start" }}>
          <StepperField
            label={t("appointments.form.reminderLeadDays")}
            value={reminderLeadDays}
            min={1}
            max={14}
            onChange={setReminderLeadDays}
          />
        </View>
      ) : null}

      <Button label={submitLabel} onPress={handleSave} loading={submitting} />
    </View>
  );
}
