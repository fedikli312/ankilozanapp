import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { addDays, diffInDays } from "@/domain/dateUtils";
import { todayDateOnly } from "@/shared/today";
import { useAppointmentDetail } from "@/features/appointments/useAppointmentDetail";
import { AppointmentForm, type AppointmentFormOutput } from "@/features/appointments/AppointmentForm";

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { appointment, edit, cancel } = useAppointmentDetail(id);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!appointment) {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.textSecondary }}>{t("appointments.emptyTitle")}</Text>
      </ScreenContainer>
    );
  }

  const today = todayDateOnly();
  const isFuture = appointment.date >= today && appointment.status === "scheduled";

  const handleSubmit = async (input: AppointmentFormOutput) => {
    setSubmitting(true);
    await edit({
      type: input.type,
      doctorOrInstitution: input.doctorOrInstitution,
      date: addDays(today, input.daysFromToday),
      time: input.time,
      notes: input.notes,
      reminderEnabled: input.reminderEnabled,
      reminderLeadDays: input.reminderLeadDays,
    });
    setSubmitting(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <ScreenContainer scroll>
        <AppointmentForm
          submitLabel={t("common.save")}
          submitting={submitting}
          initialValue={{
            type: appointment.type,
            doctorOrInstitution: appointment.doctorOrInstitution ?? undefined,
            daysFromToday: Math.max(0, diffInDays(today, appointment.date)),
            time: appointment.time ?? undefined,
            notes: appointment.notes ?? undefined,
            reminderEnabled: appointment.reminderLeadDays > 0,
            reminderLeadDays: appointment.reminderLeadDays > 0 ? appointment.reminderLeadDays : 1,
          }}
          onSubmit={handleSubmit}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
        {t(`appointments.type.${appointment.type}`)}
      </Text>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {appointment.doctorOrInstitution || t(`appointments.type.${appointment.type}`)}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {appointment.date}
        {appointment.time ? ` · ${appointment.time}` : ""}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {t(`appointments.status.${appointment.status}`)}
      </Text>

      {appointment.notes ? (
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.lg }}>
          {appointment.notes}
        </Text>
      ) : null}

      {appointment.type === "rheumatology" ? (
        <View style={{ marginBottom: spacing.lg }}>
          <Button label={t("appointments.detail.prepare")} onPress={() => router.push(`/appointments/${appointment.id}/prepare`)} />
        </View>
      ) : null}

      {isFuture ? (
        <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
          <ListRow label={t("appointments.detail.edit")} onPress={() => setEditing(true)} />
          <Button label={t("appointments.detail.cancel")} onPress={cancel} variant="destructive" />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
