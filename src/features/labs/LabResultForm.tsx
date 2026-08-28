import { useState } from "react";
import { View } from "react-native";

import { Button, StepperField, TextField } from "../../design-system";
import { useTranslation } from "../../localization";
import { addDays, diffInDays } from "../../domain/dateUtils";
import { todayDateOnly } from "../../shared/today";
import type { CreateLabResultFormInput, LabMarker } from "./useLabResults";
import { LAB_MARKER_DEFAULT_UNIT } from "./useLabResults";

export type LabResultFormProps = {
  marker: LabMarker;
  initialValue?: CreateLabResultFormInput;
  onSubmit: (input: CreateLabResultFormInput) => void;
  submitLabel: string;
};

export function LabResultForm({ marker, initialValue, onSubmit, submitLabel }: LabResultFormProps) {
  const { t } = useTranslation();
  const today = todayDateOnly();

  const [value, setValue] = useState(initialValue ? String(initialValue.value) : "");
  const [unit, setUnit] = useState(initialValue?.unit ?? LAB_MARKER_DEFAULT_UNIT[marker]);
  const [daysAgo, setDaysAgo] = useState(
    initialValue ? Math.max(0, diffInDays(initialValue.recordedDate, today)) : 0,
  );
  const [institution, setInstitution] = useState(initialValue?.institution ?? "");
  const [notes, setNotes] = useState(initialValue?.notes ?? "");

  const numericValue = Number(value.replace(",", "."));
  const canSave = value.trim().length > 0 && !Number.isNaN(numericValue);

  const handleSave = () => {
    if (!canSave) return;
    onSubmit({
      value: numericValue,
      unit: unit.trim(),
      recordedDate: addDays(today, -daysAgo),
      institution: institution.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <View>
      <TextField label={t(`labs.marker.${marker}`)} value={value} onChangeText={setValue} keyboardType="numeric" placeholder="0.0" />
      <TextField label={t("labs.form.unit")} value={unit} onChangeText={setUnit} />
      <View style={{ marginBottom: 16, alignItems: "flex-start" }}>
        <StepperField
          label={t("labs.form.date")}
          value={daysAgo}
          min={0}
          max={3650}
          onChange={setDaysAgo}
          formatValue={(v) => (v === 0 ? t("appointments.form.today") : `-${v}d`)}
        />
      </View>
      <TextField label={t("labs.form.institution")} value={institution} onChangeText={setInstitution} placeholder={t("labs.form.institutionPlaceholder")} />
      <TextField label={t("labs.form.notes")} value={notes} onChangeText={setNotes} placeholder={t("labs.form.notesPlaceholder")} multiline />
      <Button label={submitLabel} onPress={handleSave} disabled={!canSave} />
    </View>
  );
}
