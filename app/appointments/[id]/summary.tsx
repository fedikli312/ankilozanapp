import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import {
  DateBlock,
  InlineAction,
  ListRow,
  MetricLine,
  QuietSurface,
  Section,
  SectionLabel,
  SegmentedControl,
  ScreenContainer,
  TrendChart,
  useTheme,
} from "@/design-system";
import { formatDateBlock, useTranslation } from "@/localization";
import { parseDateOnly } from "@/domain/dateUtils";
import type { DoctorReportRangeDays } from "@/domain/healthSummary";
import { useAppointmentSummary } from "@/features/appointmentSummary/useAppointmentSummary";
import { presentAppointmentSummary } from "@/features/appointmentSummary/presentAppointmentSummary";

const RANGE_OPTIONS: DoctorReportRangeDays[] = [30, 90];

/**
 * Appointment Summary — Design System 2.0, Phase Design-F §11-21. Ilium's
 * signature document: a continuous, boxless composition (no
 * `GroupedList`), the same identity header language as the Appointments
 * tab/detail/Preparation screens (brief §8/§26), tabular numerals for
 * every recorded value, and at most one restrained lab trend chart
 * (brief §20). Still built entirely on the unchanged Phase W
 * `DoctorReportInput`/`HealthSummary` foundation via
 * `useAppointmentSummary`/`presentAppointmentSummary` — no aggregation
 * recomputed here, no meaning of the data altered, only its presentation.
 *
 * No HealthKit-related code exists anywhere below — `HealthSummary`'s
 * `healthKit` field is simply never read, so the reserved boundary
 * renders nothing by construction rather than a conditional block that
 * always evaluates to null.
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
  const dateBlock = formatDateBlock(parseDateOnly(appointment.date), locale);
  const appointmentContext = [typeLabel, appointment.time].filter(Boolean).join(" · ");

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {t("appointmentSummary.title")}
      </Text>
      {/* Brief §12: supportive context, never a claim to be an official
          medical report. */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md }}>
        {t("appointmentSummary.subtitle")}
      </Text>

      {/* Visit identity — the same DateBlock + name treatment as the
          Appointments tab/detail/Preparation screens (brief §8/§26), so
          this document reads as a continuation of the same visit, not an
          unrelated report. */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.lg }}>
        <DateBlock day={dateBlock.day} month={dateBlock.month} emphasis="strong" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.body.fontSize, fontWeight: "600", color: colors.textPrimary }}>{who}</Text>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{appointmentContext}</Text>
        </View>
      </View>

      {/* `SegmentedControl` is generic over string values (kept that way —
          it's a reusable primitive, not appointment-specific); the
          30/90-day range itself stays exactly `DoctorReportRangeDays`
          (`30 | 90`) everywhere outside this one string<->number
          conversion at the UI boundary. */}
      <SegmentedControl
        options={RANGE_OPTIONS.map((option) => ({ value: String(option), label: t(`appointmentSummary.range.${option}`) }))}
        value={String(rangeDays)}
        onChange={(value) => setRangeDays(Number(value) as DoctorReportRangeDays)}
        accessibilityLabel={t("appointmentSummary.rangeControlLabel")}
      />

      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: 2 }}>
          {presentation.dateRangeLabel}
        </Text>
        {/* Brief §15: recording coverage, prominent but compact — never
            called adherence/compliance, no progress ring/gamification. */}
        <Text style={{ fontSize: typography.body.fontSize, fontWeight: "600", color: colors.textPrimary }}>
          {presentation.coverageLine}
        </Text>
      </View>

      {/* Symptoms — Ilium's numeric language: tabular values, label, short
          factual context (brief §16), not a MetricCard grid. */}
      {/* Each possible row is passed as its own direct child of `Section`
          (never grouped under one wrapping fragment) — `Section` inserts
          a hairline between direct children via `Children.toArray`, which
          treats a fragment as a single opaque child and would silently
          swallow the separators between Pain/Fatigue/Stiffness/Body areas. */}
      <Section title={t("appointmentSummary.symptomsTitle")} tone="document">
        {!presentation.symptoms.hasAnyCheckIn ? <ListRow label={t("appointmentSummary.noCheckIns")} /> : null}
        {presentation.symptoms.hasAnyCheckIn && presentation.symptoms.pain ? (
          <MetricLine
            label={t("today.metricPain")}
            value={presentation.symptoms.pain.value}
            unit="/10"
            context={presentation.symptoms.pain.sampleCountLine}
          />
        ) : null}
        {presentation.symptoms.hasAnyCheckIn && !presentation.symptoms.pain ? (
          <ListRow label={t("today.metricPain")} caption={t("appointmentSummary.notEnoughForAverage")} />
        ) : null}
        {presentation.symptoms.hasAnyCheckIn && presentation.symptoms.fatigue ? (
          <MetricLine
            label={t("today.metricFatigue")}
            value={presentation.symptoms.fatigue.value}
            unit="/10"
            context={presentation.symptoms.fatigue.sampleCountLine}
          />
        ) : null}
        {presentation.symptoms.hasAnyCheckIn && !presentation.symptoms.fatigue ? (
          <ListRow label={t("today.metricFatigue")} caption={t("appointmentSummary.notEnoughForAverage")} />
        ) : null}
        {presentation.symptoms.hasAnyCheckIn && presentation.symptoms.stiffness.length > 0 ? (
          <ListRow
            label={t("appointmentSummary.stiffnessTitle")}
            caption={presentation.symptoms.stiffness.map((b) => `${b.label}: ${b.count}`).join(" · ")}
          />
        ) : null}
        {presentation.symptoms.hasAnyCheckIn && presentation.symptoms.bodyAreas.length > 0 ? (
          <ListRow
            label={t("appointmentSummary.bodyAreasTitle")}
            caption={presentation.symptoms.bodyAreas.map((b) => `${b.label}: ${b.count}`).join(" · ")}
          />
        ) : null}
      </Section>

      {/* High-Symptom Days — factual count only, never "flare"/red (brief
          §17). */}
      <Section title={t("appointmentSummary.highSymptomDaysTitle")} tone="document">
        <ListRow
          label={presentation.highSymptomDays.countLine}
          caption={presentation.highSymptomDays.dateLines.length > 0 ? presentation.highSymptomDays.dateLines.join(", ") : undefined}
        />
      </Section>

      {/* Treatments — "Recorded doses" language preserved exactly (brief
          §18): never adherence/compliance/percentage. */}
      <Section title={t("appointmentSummary.treatmentTitle")} tone="document">
        {!presentation.treatment.hasAny ? <ListRow label={t("appointmentSummary.noTreatmentRecorded")} /> : null}
        {presentation.treatment.medications.map((m) => (
          <ListRow key={m.id} label={m.name} caption={m.line} />
        ))}
        {presentation.treatment.injections.map((i) => (
          <ListRow key={i.id} label={i.name} caption={i.lastRecordedLine ? `${i.countsLine} · ${i.lastRecordedLine}` : i.countsLine} />
        ))}
      </Section>

      {/* Labs — tabular values, units, dates, minimal chrome (brief §19),
          plus the one restrained trend chart when the existing domain
          threshold judges there's genuinely enough data for one (brief
          §20) — never both markers charted, never a reference-range band. */}
      {/* The chart is a direct child of this same `Section` (not a
          sibling `View` after it) so its automatic hairline-before-each-
          row rule gives it the same separation from the Labs rows above
          that any other row would get — no manual negative-margin
          adjustment needed. */}
      <Section title={t("appointmentSummary.labsTitle")} tone="document">
        {presentation.labs.length === 0 ? <ListRow label={t("appointmentSummary.noLabsRecorded")} /> : null}
        {presentation.labs.map((lab) => (
          <ListRow key={lab.marker} label={lab.label} caption={lab.previousLine ? `${lab.latestLine} · ${lab.previousLine}` : lab.latestLine} />
        ))}
        {presentation.labChart ? (
          <TrendChart
            points={presentation.labChart.points}
            accessibilityLabel={t("appointmentSummary.labChartAccessibilityLabel", {
              marker: presentation.labChart.label,
              count: presentation.labChart.points.length,
            })}
          />
        ) : null}
      </Section>

      {/* Things to Review — deterministic, capped, factual (brief §21) —
          the one place a `QuietSurface` earns its keep this screen: a
          genuine emphasis moment that helps the actual conversation, not
          decoration. */}
      {presentation.thingsToReview.length > 0 ? (
        <View style={{ marginBottom: spacing.lg }}>
          <SectionLabel>{t("appointmentSummary.thingsToReviewTitle")}</SectionLabel>
          <QuietSurface>
            {presentation.thingsToReview.map((item, index) => (
              <Text
                key={index}
                style={{
                  fontSize: typography.body.fontSize,
                  color: colors.textPrimary,
                  marginBottom: index < presentation.thingsToReview.length - 1 ? spacing.xs : 0,
                }}
              >
                {"•  "}
                {item}
              </Text>
            ))}
          </QuietSurface>
        </View>
      ) : null}

      {/* Brief §22: complements, never duplicates, Timeline. Brief §f:
          restyled from the legacy `colors.accent` to `colors.brandPrimary`
          — `InlineAction`'s default "brand" tone. */}
      <InlineAction label={t("appointmentSummary.viewTimeline")} onPress={() => router.push(`/timeline`)} />
    </ScreenContainer>
  );
}
