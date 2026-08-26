import { useState } from "react";
import { View } from "react-native";

import { Button, StepperField, TextField, ToggleRow } from "../../design-system";
import { useTranslation } from "../../localization";
import type { CreateInjectionFormInput } from "./useInjections";

export type InjectionFormProps = {
  onSubmit: (input: CreateInjectionFormInput) => Promise<void> | void;
  submitting?: boolean;
};

/** Approved reminder defaults (Tech Arch §G/UX spec §N) — one day before, one on the scheduled day. */
const DEFAULT_REMINDER_LEAD_DAYS = 1;

export function InjectionForm({ onSubmit, submitting }: InjectionFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [doseAmount, setDoseAmount] = useState("");
  const [doseUnit, setDoseUnit] = useState("");
  const [intervalDays, setIntervalDays] = useState(14);
  const [daysSinceLastInjection, setDaysSinceLastInjection] = useState(0);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const canSave = name.trim().length > 0 && doseAmount.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSubmit({
      name: name.trim(),
      dose: `${doseAmount.trim()} ${doseUnit.trim()}`.trim(),
      intervalDays,
      daysSinceLastInjection,
      reminderLeadDays: DEFAULT_REMINDER_LEAD_DAYS,
      reminderOnScheduledDay: true,
      reminderEnabled,
    });
  };

  return (
    <View>
      <TextField
        label={t("injections.form.name")}
        value={name}
        onChangeText={setName}
        placeholder={t("injections.form.namePlaceholder")}
      />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <TextField label={t("injections.form.doseAmount")} value={doseAmount} onChangeText={setDoseAmount} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label={t("injections.form.doseUnit")}
            value={doseUnit}
            onChangeText={setDoseUnit}
            placeholder={t("injections.form.doseUnitPlaceholder")}
          />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 24, marginVertical: 16 }}>
        <StepperField
          label={t("injections.form.intervalDays")}
          value={intervalDays}
          min={2}
          max={180}
          onChange={setIntervalDays}
        />
        <StepperField
          label={t("injections.form.lastInjectionDate")}
          value={daysSinceLastInjection}
          min={0}
          max={365}
          onChange={setDaysSinceLastInjection}
          formatValue={(v) => (v === 0 ? "0" : `-${v}`)}
        />
      </View>

      <ToggleRow
        label={t("injections.form.reminderToggle")}
        description={t("onboarding.reminderPrompt")}
        value={reminderEnabled}
        onValueChange={setReminderEnabled}
      />

      <Button label={t("injections.form.save")} onPress={handleSave} disabled={!canSave} loading={submitting} />
    </View>
  );
}
