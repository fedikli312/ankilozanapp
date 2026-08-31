import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { AppointmentForm, type AppointmentFormOutput } from "@/features/appointments/AppointmentForm";
import { useAppointments } from "@/features/appointments/useAppointments";

export default function AddAppointmentScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { addAppointment } = useAppointments();
  const [submitting, setSubmitting] = useState(false);
  const [remindersOff, setRemindersOff] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleSubmit = async (input: AppointmentFormOutput) => {
    setSubmitting(true);
    setSaveError(false);
    try {
      const outcome = await addAppointment(input);
      if (outcome === "permission-denied") {
        setRemindersOff(true);
        setSubmitting(false);
        return;
      }
      router.back();
    } catch {
      setSaveError(true);
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("appointments.addAction")}
      </Text>
      {remindersOff ? (
        <Text style={{ color: colors.statusWarning, marginBottom: spacing.sm }}>{t("notifications.remindersOff")}</Text>
      ) : null}
      {saveError ? <Text style={{ color: colors.statusDanger, marginBottom: spacing.sm }}>{t("common.saveError")}</Text> : null}
      <AppointmentForm onSubmit={handleSubmit} submitting={submitting} submitLabel={t("appointments.form.save")} />
    </ScreenContainer>
  );
}
