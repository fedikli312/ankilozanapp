import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { GroupedList, ListRow, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { formatDate, formatShortDate, useTranslation } from "@/localization";
import { useAppointmentPreparation } from "@/features/appointmentPreparation/useAppointmentPreparation";
import { parseDateOnly } from "@/domain/dateUtils";

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

  const {
    appointment,
    range,
    checkInCount,
    pain,
    stiffness,
    fatigue,
    medicationHistory,
    injectionHistory,
    crpResults,
    esrResults,
    recordedNotes,
  } = data;

  const who = appointment.doctorOrInstitution || t(`appointments.type.${appointment.type}`);
  // Redesign Spec §G.6: a short "since – until" pill, not a full sentence —
  // `range` already resolves to the correct absolute dates whether the
  // lookback used a prior rheumatology appointment or the 90-day fallback,
  // so the pill needs no branching on which rule fired.
  const rangePill = `${formatShortDate(parseDateOnly(range.rangeStart), locale)} – ${formatShortDate(parseDateOnly(range.rangeEnd), locale)}`;

  const treatmentCount = medicationHistory.length + injectionHistory.length;
  const labCount = crpResults.length + esrResults.length;

  const latestCrp = crpResults[0] ?? null;
  const latestEsr = esrResults[0] ?? null;

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {t("appointmentPreparation.title")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginTop: 2 }}>
        {t("appointmentPreparation.headerSubtitle", { who, date: formatDate(parseDateOnly(appointment.date), locale) })}
      </Text>

      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: colors.surfaceHighlight,
          borderRadius: 999,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xxs,
          marginTop: spacing.sm,
        }}
      >
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textPrimary, fontWeight: "600" }}>{rangePill}</Text>
      </View>

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xs }}>
        {t("appointmentPreparation.summaryLine", { checkIns: checkInCount, treatments: treatmentCount, labs: labCount })}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xxs, fontStyle: "italic" }}>
        {t("appointmentPreparation.disclaimer")}
      </Text>

      {/* Redesign Spec §G.7-11: BELİRTİLER / TEDAVİLER / TAHLİLLER / NOTLAR,
          in that order — compact grouped rows, not one card per datapoint. */}
      <GroupedList title={t("appointmentPreparation.symptoms")}>
        <ListRow
          label={t("today.metricPain")}
          caption={pain.sufficientData ? t("appointmentPreparation.painSummary", { average: pain.average.toFixed(1) }) : t("insights.notEnoughData")}
        />
        <ListRow
          label={t("checkIn.stiffnessLabel")}
          caption={
            stiffness.sufficientData && stiffness.mostCommonBucket
              ? t("appointmentPreparation.stiffnessSummary", { bucket: t(`checkIn.stiffness.${stiffness.mostCommonBucket}`) })
              : t("insights.notEnoughData")
          }
        />
        <ListRow
          label={t("today.metricFatigue")}
          caption={fatigue.sufficientData ? t("appointmentPreparation.fatigueSummary", { average: fatigue.average.toFixed(1) }) : t("insights.notEnoughData")}
        />
      </GroupedList>

      <GroupedList title={t("appointmentPreparation.treatments")}>
        {treatmentCount === 0 ? (
          <ListRow label={t("appointmentPreparation.noneRecorded")} />
        ) : (
          <>
            {medicationHistory.map((m) => (
              <ListRow
                key={m.medicationId}
                label={m.medicationName}
                caption={
                  m.adherencePercentage !== null
                    ? t("appointmentPreparation.medicationAdherence", { name: m.medicationName, percentage: Math.round(m.adherencePercentage) })
                    : t("appointmentPreparation.medicationCounts", { name: m.medicationName, taken: m.takenCount, missed: m.missedCount })
                }
              />
            ))}
            {injectionHistory.map((i) => (
              <ListRow
                key={i.treatmentId}
                label={i.treatmentName}
                caption={t("appointmentPreparation.injectionCounts", { name: i.treatmentName, completed: i.completedCount, missed: i.missedCount })}
              />
            ))}
          </>
        )}
      </GroupedList>

      <GroupedList title={t("appointmentPreparation.labs")}>
        {labCount === 0 ? (
          <ListRow label={t("appointmentPreparation.noneRecorded")} />
        ) : (
          <>
            {latestCrp ? (
              <ListRow
                label={t("labs.marker.CRP")}
                caption={`${latestCrp.value} ${latestCrp.unit} · ${formatShortDate(parseDateOnly(latestCrp.recordedDate), locale)}`}
              />
            ) : null}
            {latestEsr ? (
              <ListRow
                label={t("labs.marker.ESR")}
                caption={`${latestEsr.value} ${latestEsr.unit} · ${formatShortDate(parseDateOnly(latestEsr.recordedDate), locale)}`}
              />
            ) : null}
          </>
        )}
      </GroupedList>

      <SectionLabel>{t("appointmentPreparation.notes")}</SectionLabel>
      {recordedNotes.length === 0 ? (
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>{t("appointmentPreparation.noneRecorded")}</Text>
      ) : (
        recordedNotes.map((n) => (
          <View key={n.date} style={{ marginBottom: spacing.sm }}>
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
              {formatShortDate(parseDateOnly(n.date), locale)}
            </Text>
            <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{n.notes}</Text>
          </View>
        ))
      )}
    </ScreenContainer>
  );
}
