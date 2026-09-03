import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, DateBlock, GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { formatDate, formatDateBlock, useTranslation } from "@/localization";
import { addDays, diffInDays, parseDateOnly } from "@/domain/dateUtils";
import { todayDateOnly } from "@/shared/today";
import { useAppointmentDetail } from "@/features/appointments/useAppointmentDetail";
import { AppointmentForm, type AppointmentFormOutput } from "@/features/appointments/AppointmentForm";

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
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

  const typeLabel = t(`appointments.type.${appointment.type}`);
  const dateBlock = formatDateBlock(parseDateOnly(appointment.date), locale);

  return (
    <ScreenContainer scroll>
      {/* Top identity block (Redesign Spec §G.5): date block, type, time,
          doctor/institution — only fields that actually exist. */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.md }}>
        <DateBlock day={dateBlock.day} month={dateBlock.month} emphasis="strong" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{typeLabel}</Text>
          <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
            {appointment.doctorOrInstitution || typeLabel}
          </Text>
          {appointment.time ? (
            <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{appointment.time}</Text>
          ) : null}
          {appointment.status !== "scheduled" ? (
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.statusNeutral, marginTop: 2 }}>
              {t(`appointments.status.${appointment.status}`)}
            </Text>
          ) : null}
        </View>
      </View>

      <GroupedList title={t("appointments.detail.detailsTitle")}>
        <ListRow label={t("appointments.form.date")} caption={formatDate(parseDateOnly(appointment.date), locale)} />
        {appointment.time ? <ListRow label={t("appointments.detail.time")} caption={appointment.time} /> : null}
        {appointment.doctorOrInstitution ? (
          <ListRow label={t("appointments.form.doctorOrInstitution")} caption={appointment.doctorOrInstitution} />
        ) : null}
        {/* Phase S fix: the user's own free-text note was rendered as a
            bare, unlabeled paragraph — easy to mistake for an app-generated
            instruction rather than something they wrote themselves. Same
            ListRow treatment as every other detail here, with the existing
            "Notes"/"Notlar" label. */}
        {appointment.notes ? <ListRow label={t("appointments.form.notes")} caption={appointment.notes} /> : null}
      </GroupedList>

      {appointment.type === "rheumatology" ? (
        <View style={{ marginBottom: spacing.md }}>
          <Button label={t("appointments.detail.prepare")} onPress={() => router.push(`/appointments/${appointment.id}/prepare`)} />
        </View>
      ) : null}

      {isFuture ? (
        <>
          <GroupedList title={t("appointments.detail.settingsTitle")}>
            <ListRow label={t("appointments.detail.edit")} onPress={() => setEditing(true)} chevron />
          </GroupedList>
          <View style={{ marginTop: spacing.md }}>
            <Button label={t("appointments.detail.cancel")} onPress={cancel} variant="destructive" />
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}
