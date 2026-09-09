import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, DateBlock, InlineAction, ListRow, Section, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { formatDateBlock, formatShortDate, useTranslation } from "@/localization";
import { useAppointmentPreparation } from "@/features/appointmentPreparation/useAppointmentPreparation";
import { parseDateOnly } from "@/domain/dateUtils";

/**
 * Preparation — Design System 2.0, Phase Design-F §9/§10. "What should I
 * remember to discuss at this appointment?" A concise personal visit note,
 * not a checklist-card stack: boxless `Section`s, hairlines, an identity
 * header sharing the same `DateBlock`/typography language as the
 * Appointments tab and detail screen (brief §8/§26 — "one connected
 * experience"), and one clear continue action into Appointment Summary at
 * the bottom, reinforced by a quieter quick-access link near the top for
 * anyone who wants to skip straight there.
 */
export default function AppointmentPreparationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
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
  const dateBlock = formatDateBlock(parseDateOnly(appointment.date), locale);
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
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("appointmentPreparation.title")}
      </Text>

      {/* Visit identity — the same DateBlock + name treatment as the
          Appointments tab/detail screen, so this reads as a continuation
          of the same appointment, not a new, unrelated screen. */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.md }}>
        <DateBlock day={dateBlock.day} month={dateBlock.month} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.body.fontSize, fontWeight: "600", color: colors.textPrimary }}>{who}</Text>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
            {t(`appointments.type.${appointment.type}`)}
          </Text>
        </View>
      </View>

      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: colors.selected,
          borderRadius: 999,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xxs,
          marginBottom: spacing.xs,
        }}
      >
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textPrimary, fontWeight: "600" }}>{rangePill}</Text>
      </View>

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
        {t("appointmentPreparation.summaryLine", { checkIns: checkInCount, treatments: treatmentCount, labs: labCount })}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xxs, marginBottom: spacing.xs }}>
        {t("appointmentPreparation.disclaimer")}
      </Text>

      {/* Quiet quick-access into the richer, range-selectable Appointment
          Summary — the strong continue action lives at the bottom, after
          this screen's own content, as the natural next step. */}
      <View style={{ marginBottom: spacing.md }}>
        <InlineAction label={t("appointmentSummary.title")} onPress={() => router.push(`/appointments/${id}/summary`)} tone="quiet" />
      </View>

      <Section title={t("appointmentPreparation.symptoms")}>
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
      </Section>

      {/* Each row is a direct child of `Section` (never grouped under one
          wrapping fragment) — `Section` inserts a hairline between direct
          children via `Children.toArray`, which treats a fragment as one
          opaque child and would silently swallow the separators between
          medication/injection rows. */}
      <Section title={t("appointmentPreparation.treatments")}>
        {treatmentCount === 0 ? <ListRow label={t("appointmentPreparation.noneRecorded")} /> : null}
        {/* Always the factual "Recorded doses" count language, matching
            Appointment Summary — never the adherence percentage.
            `computeMedicationAdherence`/`adherencePercentage` are
            untouched; Insights' detail screen still shows the percentage
            in its own personal-trend context. */}
        {medicationHistory.map((m) => (
          <ListRow
            key={m.medicationId}
            label={m.medicationName}
            caption={t("appointmentPreparation.medicationCounts", { name: m.medicationName, taken: m.takenCount, missed: m.missedCount })}
          />
        ))}
        {injectionHistory.map((i) => (
          <ListRow
            key={i.treatmentId}
            label={i.treatmentName}
            caption={t("appointmentPreparation.injectionCounts", { name: i.treatmentName, completed: i.completedCount, missed: i.missedCount })}
          />
        ))}
      </Section>

      <Section title={t("appointmentPreparation.labs")}>
        {labCount === 0 ? <ListRow label={t("appointmentPreparation.noneRecorded")} /> : null}
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
      </Section>

      <SectionLabel>{t("appointmentPreparation.notes")}</SectionLabel>
      {recordedNotes.length === 0 ? (
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>{t("appointmentPreparation.noneRecorded")}</Text>
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          {recordedNotes.map((n) => (
            <View key={n.date} style={{ marginBottom: spacing.sm }}>
              <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
                {formatShortDate(parseDateOnly(n.date), locale)}
              </Text>
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{n.notes}</Text>
            </View>
          ))}
        </View>
      )}

      {/* The strong continue action into Appointment Summary (brief §10:
          "strong Save/continue action") — the definitive next step after
          reviewing this visit note. */}
      <Button label={t("appointmentSummary.title")} onPress={() => router.push(`/appointments/${id}/summary`)} />
    </ScreenContainer>
  );
}
