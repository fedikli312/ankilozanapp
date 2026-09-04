import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AccessibleTouchable, Chip, GroupedList, ListRow, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { formatDate, useTranslation } from "@/localization";
import { parseDateOnly } from "@/domain/dateUtils";
import type { DoctorReportRangeDays } from "@/domain/healthSummary";
import { useAppointmentSummary } from "@/features/appointmentSummary/useAppointmentSummary";
import { presentAppointmentSummary } from "@/features/appointmentSummary/presentAppointmentSummary";

const RANGE_OPTIONS: DoctorReportRangeDays[] = [30, 90];

/**
 * Product 2.1 Phase Z — "Appointment Summary" ("Randevu Özeti"): a
 * deterministic, descriptive compression of what the user recorded, built
 * entirely on the Phase W `DoctorReportInput`/`HealthSummary` foundation
 * (`useAppointmentSummary`/`presentAppointmentSummary` — no direct SQLite
 * read, no aggregation recomputed here). A distinct screen from the
 * existing `/appointments/[id]/prepare` (Product 2.0, its own
 * appointment-relative lookback and content) — this one is reached FROM
 * that screen (brief §2's "smallest coherent IA extension": Appointments →
 * appointment → Prepare → Appointment Summary), not a replacement of it.
 *
 * No HealthKit-related code exists anywhere below — `HealthSummary`'s
 * `healthKit` field is simply never read, so the reserved boundary
 * (brief §18) renders nothing by construction rather than a conditional
 * block that always evaluates to null.
 */
export default function AppointmentSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const [rangeDays, setRangeDays] = useState<DoctorReportRangeDays>(30);

  const data = useAppointmentSummary(id, rangeDays);

  if (!data.appointment) {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.textSecondary }}>{t("appointments.emptyTitle")}</Text>
      </ScreenContainer>
    );
  }

  const { appointment, summary, unitsByMarker } = data;
  const presentation = presentAppointmentSummary(summary, rangeDays, t, locale, unitsByMarker);

  const typeLabel = t(`appointments.type.${appointment.type}`);
  const who = appointment.doctorOrInstitution || typeLabel;
  const appointmentCaption = [typeLabel, formatDate(parseDateOnly(appointment.date), locale), appointment.time]
    .filter(Boolean)
    .join(" · ");

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {t("appointmentSummary.title")}
      </Text>
      {/* Brief §6: supportive, not a completeness claim. */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm }}>
        {t("appointmentSummary.subtitle")}
      </Text>

      <GroupedList title={t("appointmentSummary.appointmentContextTitle")}>
        <ListRow label={who} caption={appointmentCaption} />
      </GroupedList>

      <View style={{ flexDirection: "row", gap: spacing.xs, marginTop: spacing.xs, marginBottom: spacing.sm }}>
        {RANGE_OPTIONS.map((option) => (
          <Chip key={option} label={t(`appointmentSummary.range.${option}`)} selected={rangeDays === option} onPress={() => setRangeDays(option)} />
        ))}
      </View>

      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: colors.surfaceHighlight,
          borderRadius: 999,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xxs,
          marginBottom: spacing.xs,
        }}
      >
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textPrimary, fontWeight: "600" }}>
          {presentation.dateRangeLabel}
        </Text>
      </View>

      {/* Brief §7: recording coverage, prominent but compact — never called adherence/compliance. */}
      <Text style={{ fontSize: typography.body.fontSize, fontWeight: "600", color: colors.textPrimary, marginBottom: spacing.md }}>
        {presentation.coverageLine}
      </Text>

      <GroupedList title={t("appointmentSummary.symptomsTitle")}>
        {!presentation.symptoms.hasAnyCheckIn ? (
          <ListRow label={t("appointmentSummary.noCheckIns")} />
        ) : (
          <>
            <ListRow
              label={t("today.metricPain")}
              caption={
                presentation.symptoms.pain
                  ? `${presentation.symptoms.pain.averageLine} · ${presentation.symptoms.pain.sampleCountLine}`
                  : t("appointmentSummary.notEnoughForAverage")
              }
            />
            <ListRow
              label={t("today.metricFatigue")}
              caption={
                presentation.symptoms.fatigue
                  ? `${presentation.symptoms.fatigue.averageLine} · ${presentation.symptoms.fatigue.sampleCountLine}`
                  : t("appointmentSummary.notEnoughForAverage")
              }
            />
            {presentation.symptoms.stiffness.length > 0 ? (
              <ListRow
                label={t("appointmentSummary.stiffnessTitle")}
                caption={presentation.symptoms.stiffness.map((b) => `${b.label}: ${b.count}`).join(" · ")}
              />
            ) : null}
            {presentation.symptoms.bodyAreas.length > 0 ? (
              <ListRow
                label={t("appointmentSummary.bodyAreasTitle")}
                caption={presentation.symptoms.bodyAreas.map((b) => `${b.label}: ${b.count}`).join(" · ")}
              />
            ) : null}
          </>
        )}
      </GroupedList>

      <GroupedList title={t("appointmentSummary.highSymptomDaysTitle")}>
        <ListRow
          label={presentation.highSymptomDays.countLine}
          caption={presentation.highSymptomDays.dateLines.length > 0 ? presentation.highSymptomDays.dateLines.join(", ") : undefined}
        />
      </GroupedList>

      <GroupedList title={t("appointmentSummary.treatmentTitle")}>
        {!presentation.treatment.hasAny ? (
          <ListRow label={t("appointmentSummary.noTreatmentRecorded")} />
        ) : (
          <>
            {presentation.treatment.medications.map((m) => (
              <ListRow key={m.id} label={m.name} caption={m.line} />
            ))}
            {presentation.treatment.injections.map((i) => (
              <ListRow key={i.id} label={i.name} caption={i.lastRecordedLine ? `${i.countsLine} · ${i.lastRecordedLine}` : i.countsLine} />
            ))}
          </>
        )}
      </GroupedList>

      <GroupedList title={t("appointmentSummary.labsTitle")}>
        {presentation.labs.length === 0 ? (
          <ListRow label={t("appointmentSummary.noLabsRecorded")} />
        ) : (
          presentation.labs.map((lab) => (
            <ListRow key={lab.marker} label={lab.label} caption={lab.previousLine ? `${lab.latestLine} · ${lab.previousLine}` : lab.latestLine} />
          ))
        )}
      </GroupedList>

      {presentation.thingsToReview.length > 0 ? (
        <>
          <SectionLabel>{t("appointmentSummary.thingsToReviewTitle")}</SectionLabel>
          <View style={{ marginBottom: spacing.md }}>
            {presentation.thingsToReview.map((item, index) => (
              <Text
                key={index}
                style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.xxs }}
              >
                {"•  "}
                {item}
              </Text>
            ))}
          </View>
        </>
      ) : null}

      {/* Brief §17: complements, never duplicates, Timeline. */}
      <AccessibleTouchable
        onPress={() => router.push(`/timeline`)}
        accessibilityRole="button"
        accessibilityLabel={t("appointmentSummary.viewTimeline")}
        style={{ marginTop: spacing.xs, alignSelf: "flex-start" }}
      >
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.accent }}>{t("appointmentSummary.viewTimeline")}</Text>
      </AccessibleTouchable>
    </ScreenContainer>
  );
}
