import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { formatDate, useTranslation } from "@/localization";
import { useAppointmentPreparation } from "@/features/appointmentPreparation/useAppointmentPreparation";
import { parseDateOnly } from "@/domain/dateUtils";

function SectionTitle({ children }: { children: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm }}>
      {children}
    </Text>
  );
}

export default function AppointmentPreparationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const data = useAppointmentPreparation(id);

  if (!data.appointment) {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.textSecondary }}>{t("appointments.emptyTitle")}</Text>
      </ScreenContainer>
    );
  }

  const { appointment, range, hasPriorRheumatologyAppointment, pain, stiffness, fatigue, medicationHistory, injectionHistory, crpResults, esrResults, recordedNotes } = data;

  const who = appointment.doctorOrInstitution || t(`appointments.type.${appointment.type}`);
  const rangeLabel = hasPriorRheumatologyAppointment
    ? t("appointmentPreparation.rangeSincePrevious", {
        start: formatDate(parseDateOnly(range.rangeStart), locale),
        end: formatDate(parseDateOnly(range.rangeEnd), locale),
      })
    : t("appointmentPreparation.rangeFallback", { days: 90 });

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {t("appointmentPreparation.headerTitle", { who, date: formatDate(parseDateOnly(appointment.date), locale) })}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xs }}>
        {rangeLabel}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: "italic" }}>
        {t("appointmentPreparation.disclaimer")}
      </Text>

      <SectionTitle>{t("appointmentPreparation.symptomTrends")}</SectionTitle>
      <Text style={{ color: colors.textPrimary }}>
        {pain.sufficientData
          ? t("appointmentPreparation.painSummary", { average: pain.average.toFixed(1) })
          : t("insights.notEnoughData")}
      </Text>
      <Text style={{ color: colors.textPrimary, marginTop: spacing.xs }}>
        {stiffness.sufficientData && stiffness.mostCommonBucket
          ? t("appointmentPreparation.stiffnessSummary", {
              bucket: t(`checkIn.stiffness.${stiffness.mostCommonBucket}`),
            })
          : t("insights.notEnoughData")}
      </Text>
      <Text style={{ color: colors.textPrimary, marginTop: spacing.xs }}>
        {fatigue.sufficientData
          ? t("appointmentPreparation.fatigueSummary", { average: fatigue.average.toFixed(1) })
          : t("insights.notEnoughData")}
      </Text>

      <SectionTitle>{t("appointmentPreparation.medicationHistory")}</SectionTitle>
      {medicationHistory.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>{t("appointmentPreparation.noneRecorded")}</Text>
      ) : (
        medicationHistory.map((m) => (
          <Text key={m.medicationId} style={{ color: colors.textPrimary, marginBottom: spacing.xs }}>
            {m.adherencePercentage !== null
              ? t("appointmentPreparation.medicationAdherence", {
                  name: m.medicationName,
                  percentage: Math.round(m.adherencePercentage),
                })
              : t("appointmentPreparation.medicationCounts", {
                  name: m.medicationName,
                  taken: m.takenCount,
                  missed: m.missedCount,
                })}
          </Text>
        ))
      )}

      <SectionTitle>{t("appointmentPreparation.injectionHistory")}</SectionTitle>
      {injectionHistory.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>{t("appointmentPreparation.noneRecorded")}</Text>
      ) : (
        injectionHistory.map((i) => (
          <Text key={i.treatmentId} style={{ color: colors.textPrimary, marginBottom: spacing.xs }}>
            {t("appointmentPreparation.injectionCounts", {
              name: i.treatmentName,
              completed: i.completedCount,
              missed: i.missedCount,
            })}
          </Text>
        ))
      )}

      <SectionTitle>{t("appointmentPreparation.recentLabs")}</SectionTitle>
      {crpResults.length === 0 && esrResults.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>{t("appointmentPreparation.noneRecorded")}</Text>
      ) : (
        <View>
          {[...crpResults, ...esrResults]
            .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate))
            .map((r) => (
              <Text key={r.id} style={{ color: colors.textPrimary, marginBottom: spacing.xs }}>
                {r.marker} — {r.value} {r.unit} ({r.recordedDate})
              </Text>
            ))}
        </View>
      )}

      <SectionTitle>{t("appointmentPreparation.notes")}</SectionTitle>
      {recordedNotes.length === 0 ? (
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>{t("appointmentPreparation.noneRecorded")}</Text>
      ) : (
        recordedNotes.map((n) => (
          <Text key={n.date} style={{ color: colors.textPrimary, marginBottom: spacing.xs }}>
            {n.date} — {n.notes}
          </Text>
        ))
      )}
    </ScreenContainer>
  );
}
