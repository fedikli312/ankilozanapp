import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, Chip, ScreenContainer, StepperField, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useAppointments } from "@/features/appointments/useAppointments";
import type { CreateAppointmentInput } from "@/repositories";
import { finishOnboarding } from "@/features/onboarding/finishOnboarding";

const APPOINTMENT_TYPES: CreateAppointmentInput["type"][] = ["rheumatology", "laboratory", "imaging", "other"];

/** UX spec §C.5: "quick add (type, date) or Skip" — deliberately narrower than the full Appointments form (Phase 11), matching onboarding's speed-over-completeness principle. */
export default function OnboardingAddAppointmentScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { addAppointment } = useAppointments();
  const [type, setType] = useState<CreateAppointmentInput["type"]>("rheumatology");
  const [daysFromToday, setDaysFromToday] = useState(14);
  const [submitting, setSubmitting] = useState(false);

  const proceed = () => {
    finishOnboarding();
    router.replace("/");
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await addAppointment({ type, daysFromToday, reminderEnabled: true, reminderLeadDays: 1 });
    } finally {
      proceed();
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: 20, fontWeight: "600", color: colors.textPrimary, marginBottom: 16 }}>
        {t("onboarding.addAppointment.title")}
      </Text>

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
        {t("appointments.form.type")}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.lg }}>
        {APPOINTMENT_TYPES.map((option) => (
          <Chip key={option} label={t(`appointments.type.${option}`)} selected={type === option} onPress={() => setType(option)} />
        ))}
      </View>

      <View style={{ marginBottom: spacing.lg, alignItems: "flex-start" }}>
        <StepperField
          label={t("appointments.form.date")}
          value={daysFromToday}
          min={0}
          max={365}
          onChange={setDaysFromToday}
          formatValue={(v) => (v === 0 ? t("appointments.form.today") : `+${v}d`)}
        />
      </View>

      <Button label={t("appointments.form.save")} onPress={handleSave} loading={submitting} />
      <Button label={t("common.skip")} onPress={proceed} variant="secondary" />
    </ScreenContainer>
  );
}
