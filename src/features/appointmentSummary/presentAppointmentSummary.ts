import { addDays, parseDateOnly } from "../../domain/dateUtils";
import type { HealthSummary } from "../../domain/healthSummary";
// Direct submodule imports (not the `../../localization` barrel): the
// barrel also re-exports `useTranslation`, which imports the singleton
// `db` — pulling that into a pure presentation module would make every
// test importing this file transitively open a real SQLite connection.
import { formatShortDate } from "../../localization/format";
import type { SupportedLocale } from "../../localization/resolveLocale";

export type Translate = (key: string, options?: Record<string, unknown>) => string;

/**
 * Product 2.1 Phase Z — turns the already-computed, deterministic
 * `HealthSummary` (Phase W) into ready-to-render strings/lists for the
 * Appointment Summary screen. No average/count/frequency is calculated
 * here — every number below is read straight off a `HealthSummary` field
 * that already computed it; this module only selects, formats, and
 * localizes (brief §4: "do NOT calculate averages inside components").
 *
 * Sparse-data handling (brief §13) is the one real branching concern this
 * file owns: a `NumericTrend.average` is a placeholder `0` whenever
 * `sufficientData` is false (fewer than 3 in-range check-ins — see
 * `domain/insights/numericCheckInTrend.ts`), so every numeric section
 * below is strictly gated on `sufficientData`, never on `dataPoints > 0`
 * alone — showing that placeholder would be exactly the misleading
 * "0 average pain" the brief warns against.
 */

export type MetricLine = {
  averageLine: string;
  sampleCountLine: string;
};

export type BucketLine = { label: string; count: number };

export type TreatmentLine = { id: string; name: string; line: string };

export type InjectionLine = { id: string; name: string; countsLine: string; lastRecordedLine: string | null };

export type LabLine = { marker: string; label: string; latestLine: string; previousLine: string | null };

export type AppointmentSummaryPresentation = {
  rangeLabel: string;
  dateRangeLabel: string;
  coverageLine: string;
  symptoms: {
    /** `null` when there are zero check-ins at all in range — a distinct, honest state from "recorded, but not enough for an average yet." */
    hasAnyCheckIn: boolean;
    pain: MetricLine | null;
    fatigue: MetricLine | null;
    stiffness: BucketLine[];
    bodyAreas: BucketLine[];
  };
  highSymptomDays: {
    countLine: string;
    dateLines: string[];
  };
  treatment: {
    hasAny: boolean;
    medications: TreatmentLine[];
    injections: InjectionLine[];
  };
  labs: LabLine[];
  thingsToReview: string[];
};

const MAX_HIGH_SYMPTOM_DAY_DATES_SHOWN = 5;
const MAX_BODY_AREAS_SHOWN = 5;
const MAX_PREVIOUS_LAB_VALUES_SHOWN = 3;
const MAX_THINGS_TO_REVIEW = 4;

function formatDateLine(date: string, locale: SupportedLocale): string {
  return formatShortDate(parseDateOnly(date), locale);
}

function presentSymptomLine(
  trend: HealthSummary["symptoms"]["pain"],
  t: Translate,
  averageKey: string,
): MetricLine | null {
  if (!trend.sufficientData) return null;
  return {
    // toFixed(1) is formatting, not computation — the average itself is `trend.average`, already computed by `computePainHistory`/`computeFatigueHistory`.
    averageLine: t(averageKey, { average: trend.average.toFixed(1) }),
    sampleCountLine: t("appointmentSummary.sampleCount", { count: trend.dataPoints }),
  };
}

function presentStiffness(stiffness: HealthSummary["symptoms"]["stiffness"], t: Translate): BucketLine[] {
  return (Object.entries(stiffness.bucketCounts) as [string, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([bucket, count]) => ({ label: t(`checkIn.stiffnessCompact.${bucket}`), count }));
}

function presentBodyAreas(bodyAreas: HealthSummary["symptoms"]["bodyAreas"], t: Translate): BucketLine[] {
  return bodyAreas
    .slice(0, MAX_BODY_AREAS_SHOWN)
    .map((entry) => ({ label: t(`checkIn.bodyArea.${entry.region}`), count: entry.count }));
}

function presentTreatment(
  treatment: HealthSummary["treatment"],
  t: Translate,
  locale: SupportedLocale,
): AppointmentSummaryPresentation["treatment"] {
  const medications: TreatmentLine[] = treatment.medications.map((entry) => ({
    id: entry.medicationId,
    name: entry.medicationName,
    // Brief §10: prefer "recorded doses" over an "adherence" percentage claim
    // whenever the schedule denominator is ambiguous — and it genuinely is
    // here: `medicationAdministrations` rows are only ever generated
    // forward from "today" (`planMedicationAdministrationGeneration.ts`),
    // never backfilled for past gaps, so `passedCount` can undercount what
    // was actually prescribed if the app wasn't opened for a stretch. A raw
    // taken/missed count carries no such denominator claim.
    line: t("appointmentSummary.medicationDoses", {
      taken: entry.adherence.takenCount,
      missed: entry.adherence.missedCount,
    }),
  }));

  const injections: InjectionLine[] = treatment.injections.map((entry) => {
    const lastCompleted = entry.history.entries.filter((e) => e.status === "completed").at(-1);
    return {
      id: entry.treatmentId,
      name: entry.treatmentName,
      countsLine: t("appointmentSummary.injectionCounts", {
        completed: entry.history.completedCount,
        missed: entry.history.missedCount,
      }),
      lastRecordedLine: lastCompleted
        ? t("appointmentSummary.lastInjection", {
            date: formatDateLine(lastCompleted.actualDate ?? lastCompleted.scheduledFor, locale),
          })
        : null,
    };
  });

  return { hasAny: medications.length > 0 || injections.length > 0, medications, injections };
}

function presentLabs(
  labs: HealthSummary["labs"],
  unitsByMarker: Record<string, string>,
  t: Translate,
  locale: SupportedLocale,
): LabLine[] {
  return labs.markers.map((entry) => {
    const unit = unitsByMarker[entry.marker] ?? "";
    const mostRecent = entry.history.mostRecent;
    const latestLine = mostRecent
      ? t("appointmentSummary.labLatest", {
          value: mostRecent.value,
          unit,
          date: formatDateLine(mostRecent.recordedDate, locale),
        })
      : "";

    // Every value except the most recent one, oldest-first capped to a
    // small compact list (brief §11: "optional compact previous
    // values/history") — `values` is already sorted ascending by
    // `computeLabHistory`, so this is a plain slice, not a re-sort.
    const previous = entry.history.values.slice(0, -1).slice(-MAX_PREVIOUS_LAB_VALUES_SHOWN);
    const previousLine =
      previous.length > 0
        ? t("appointmentSummary.labPrevious", {
            list: previous.map((v) => `${v.value} ${unit} · ${formatDateLine(v.recordedDate, locale)}`).join(", "),
          })
        : null;

    return { marker: entry.marker, label: t(`labs.marker.${entry.marker}`), latestLine, previousLine };
  });
}

/**
 * Brief §16: deterministic, factual prompts only, capped and bounded so
 * this never grows into a data dump — never a treatment recommendation,
 * never causal language. Each line is a template over an already-computed
 * field (count, top body area, latest lab date); nothing here recomputes
 * or interprets anything.
 */
function buildThingsToReview(summary: HealthSummary, t: Translate, locale: SupportedLocale): string[] {
  const items: string[] = [];

  if (summary.highSymptomDays.count > 0) {
    items.push(t("appointmentSummary.thingsToReview.highSymptomDays", { count: summary.highSymptomDays.count }));
  }

  const topBodyArea = summary.symptoms.bodyAreas[0];
  if (topBodyArea) {
    items.push(
      t("appointmentSummary.thingsToReview.bodyArea", {
        region: t(`checkIn.bodyArea.${topBodyArea.region}`),
        count: topBodyArea.count,
      }),
    );
  }

  for (const marker of summary.labs.markers) {
    if (items.length >= MAX_THINGS_TO_REVIEW) break;
    const mostRecent = marker.history.mostRecent;
    if (!mostRecent) continue;
    items.push(
      t("appointmentSummary.thingsToReview.latestLab", {
        marker: t(`labs.marker.${marker.marker}`),
        date: formatDateLine(mostRecent.recordedDate, locale),
      }),
    );
  }

  return items.slice(0, MAX_THINGS_TO_REVIEW);
}

export function presentAppointmentSummary(
  summary: HealthSummary,
  rangeDays: 30 | 90,
  t: Translate,
  locale: SupportedLocale,
  unitsByMarker: Record<string, string>,
): AppointmentSummaryPresentation {
  const { coverage, pain, fatigue, stiffness, bodyAreas } = summary.symptoms;

  return {
    rangeLabel: t(`appointmentSummary.range.${rangeDays}`),
    // rangeEnd is exclusive (Tech Arch §H) — the last calendar day actually in range is one day before it.
    dateRangeLabel: `${formatDateLine(summary.range.rangeStart, locale)} – ${formatDateLine(
      addDays(summary.range.rangeEnd, -1),
      locale,
    )}`,
    coverageLine: t("appointmentSummary.coverage", { count: coverage.completedCount, total: coverage.daysInRange }),
    symptoms: {
      hasAnyCheckIn: coverage.completedCount > 0,
      pain: presentSymptomLine(pain, t, "appointmentSummary.painAverage"),
      fatigue: presentSymptomLine(fatigue, t, "appointmentSummary.fatigueAverage"),
      stiffness: presentStiffness(stiffness, t),
      bodyAreas: presentBodyAreas(bodyAreas, t),
    },
    highSymptomDays: {
      countLine: t("appointmentSummary.highSymptomDaysCount", { count: summary.highSymptomDays.count }),
      dateLines: summary.highSymptomDays.days.slice(0, MAX_HIGH_SYMPTOM_DAY_DATES_SHOWN).map((d) => formatDateLine(d.date, locale)),
    },
    treatment: presentTreatment(summary.treatment, t, locale),
    labs: presentLabs(summary.labs, unitsByMarker, t, locale),
    thingsToReview: buildThingsToReview(summary, t, locale),
  };
}
