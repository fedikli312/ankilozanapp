import { useState } from "react";
import { View } from "react-native";

import type { FrequencyType } from "../../domain/scheduling/types";
import { Button, TextField } from "../../design-system";
import { useTranslation } from "../../localization";
import { MedicationScheduleFields, type MedicationScheduleFieldsValue } from "./MedicationScheduleFields";
import type { CreateMedicationFormInput } from "./useMedications";

export type MedicationFormProps = {
  onSubmit: (input: CreateMedicationFormInput) => Promise<void> | void;
  submitting?: boolean;
};

const DEFAULT_SCHEDULE: MedicationScheduleFieldsValue = {
  frequencyType: "daily" as FrequencyType,
  intervalDays: 7,
  daysOfWeek: [],
  timeOfDay: "08:00",
  reminderEnabled: true,
};

export function MedicationForm({ onSubmit, submitting }: MedicationFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [doseAmount, setDoseAmount] = useState("");
  const [doseUnit, setDoseUnit] = useState("");
  const [notes, setNotes] = useState("");
  const [schedule, setSchedule] = useState<MedicationScheduleFieldsValue>(DEFAULT_SCHEDULE);

  const canSave = name.trim().length > 0 && doseAmount.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSubmit({
      name: name.trim(),
      dose: `${doseAmount.trim()} ${doseUnit.trim()}`.trim(),
      notes: notes.trim() || undefined,
      frequencyType: schedule.frequencyType,
      intervalDays: schedule.frequencyType === "custom_interval" ? schedule.intervalDays : undefined,
      daysOfWeek: schedule.frequencyType === "specific_days" ? schedule.daysOfWeek : undefined,
      timeOfDay: schedule.timeOfDay,
      reminderEnabled: schedule.reminderEnabled,
    });
  };

  return (
    <View>
      <TextField label={t("medications.form.name")} value={name} onChangeText={setName} placeholder={t("medications.form.namePlaceholder")} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <TextField label={t("medications.form.doseAmount")} value={doseAmount} onChangeText={setDoseAmount} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label={t("medications.form.doseUnit")}
            value={doseUnit}
            onChangeText={setDoseUnit}
            placeholder={t("medications.form.doseUnitPlaceholder")}
          />
        </View>
      </View>

      <MedicationScheduleFields value={schedule} onChange={setSchedule} reminderDescription={t("onboarding.reminderPrompt")} />

      <TextField label={t("medications.form.notes")} value={notes} onChangeText={setNotes} placeholder={t("medications.form.notesPlaceholder")} multiline />

      <Button label={t("medications.form.save")} onPress={handleSave} disabled={!canSave} loading={submitting} />
    </View>
  );
}
