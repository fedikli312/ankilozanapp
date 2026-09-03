/**
 * Product 2.1 Phase W — the shared, typed output of the deterministic
 * aggregation layer (`docs/PRODUCT_2_1_SPECIFICATION.md` §12). Every field
 * here is either a plain fact about recorded rows (a count, an average, a
 * date) or a domain type already established in `domain/insights` — nothing
 * in this file is interpretive (Phase W brief §6: "aggregation output must
 * remain factual/descriptive").
 *
 * `HealthDateRange` is deliberately not a new type: it is the exact same
 * `DateRange` shape `domain/insights` already defines and every existing
 * insights function already consumes (inclusive `rangeStart`, exclusive
 * `rangeEnd`) — re-exported under this module's own name so Product 2.1
 * code reads with the vocabulary the spec uses, without introducing a
 * second, structurally-identical type to keep in sync.
 */
import type {
  DateRange,
  InjectionHistory,
  LabHistory,
  MedicationAdherence,
  MorningStiffnessBucket,
  NumericTrend,
  StiffnessHistory,
} from "../insights";
import type { BodyAreaRegion } from "../../repositories/checkInRepository";

export type { DateRange as HealthDateRange };

/** One recorded body region and how many times it appeared in range — never a diagnosis of "affected area," purely a count of what was recorded. */
export type BodyAreaFrequency = {
  region: BodyAreaRegion;
  count: number;
};

/** How much of the range actually has a check-in — distinct from `dataPoints` on the trend types above, which only count entries that happened to fall in range; this also states the range's own length so "6 of 30 days" is expressible. */
export type CheckInCoverage = {
  completedCount: number;
  daysInRange: number;
};

/** One High-Symptom Day's recorded snapshot — the same fields a normal check-in has, filtered to only the user-marked days (`domain/healthSummary`'s own `computeHighSymptomDays`). Never includes a fabricated severity label — the raw values ARE the summary. */
export type HighSymptomDayEntry = {
  date: string;
  pain: number;
  fatigue: number;
  morningStiffnessBucket: MorningStiffnessBucket;
  /** Optional — a High-Symptom Day entry is not required to have a note. */
  note: string | null;
};

export type HighSymptomDaySummary = {
  count: number;
  days: HighSymptomDayEntry[];
};

/** Composes the existing `domain/insights` trend/history functions with the two new Phase W computations (coverage, body-area frequency) — no re-implementation of pain/stiffness/fatigue math, this is purely a shaped bundle. */
export type SymptomSummary = {
  coverage: CheckInCoverage;
  pain: NumericTrend;
  fatigue: NumericTrend;
  stiffness: StiffnessHistory;
  bodyAreas: BodyAreaFrequency[];
};

/** One tracked medication's adherence in range — `null` adherence percentage and zero counts are both valid, real states (no doses fell in range yet, or the medication is brand new), never coerced into a fabricated number. */
export type MedicationTrackingEntry = {
  medicationId: string;
  medicationName: string;
  adherence: MedicationAdherence;
};

/** One tracked injection treatment's history in range — same "real absence, not a fabricated zero" rule as above. */
export type InjectionTrackingEntry = {
  treatmentId: string;
  treatmentName: string;
  history: InjectionHistory;
};

/** Brief §5 "TREATMENT TRACKING... only if existing data can support this reliably" — both arrays are empty, not padded, for a user with no tracked treatment at all (the "neutral/no-treatment user" case, Phase W brief §13/§8). */
export type TreatmentSummary = {
  medications: MedicationTrackingEntry[];
  injections: InjectionTrackingEntry[];
};

export type LabMarkerSummary = {
  marker: string;
  history: LabHistory;
};

/** One entry per marker actually seen in range — a marker with zero results in range is simply absent from `markers`, never present with fabricated nulls (brief §8). */
export type LabSummary = {
  markers: LabMarkerSummary[];
};

export type AppointmentRef = {
  id: string;
  type: "rheumatology" | "laboratory" | "imaging" | "other";
  date: string;
  time: string | null;
  doctorOrInstitution: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

/** Not range-scoped like the sections above — "recent" and "next" are inherently relative to *now*, not to the report's own lookback window (brief §5's own wording: "relevant recent/next appointment information"), so this is resolved against the full appointment history regardless of range. */
export type AppointmentSummary = {
  mostRecentPast: AppointmentRef | null;
  nextUpcoming: AppointmentRef | null;
};

/**
 * Reserved boundary only (Phase W brief §11/§3 — "It is acceptable to
 * reserve a typed optional boundary if architecturally clean, but do not
 * fabricate HealthKit values"). No HealthKit integration exists yet
 * (Phase AA); every field is optional/nullable so `HealthSummary` can be
 * constructed today with this entirely absent, and a real value can be
 * slotted in later without a breaking type change to any of this file's
 * other types or to any function that already consumes `HealthSummary`.
 */
export type HealthKitContext = {
  averageDailySteps?: number | null;
  sleepDurationSummary?: {
    averageHours: number;
    nightsWithData: number;
  } | null;
  restingHeartRateSummary?: {
    average: number;
    nightsWithData: number;
  } | null;
};

/**
 * The top-level aggregation output — conceptually identical to the brief's
 * own sketch, built by `buildHealthSummary` (pure) from data a feature-layer
 * caller has already fetched via the repository layer (`getHealthSummary`,
 * `src/features/healthSummary/`). This same object is also the Doctor
 * Report input (`docs/PRODUCT_2_1_SPECIFICATION.md` §12 — "there is no
 * separate AI data shape") and, stripped through `buildAiSafeHealthSummaryPayload`
 * (`aiSafePayload.ts`), the future AI input boundary — one object, three
 * consumers, never three parallel shapes to keep in sync.
 */
export type HealthSummary = {
  range: DateRange;
  symptoms: SymptomSummary;
  highSymptomDays: HighSymptomDaySummary;
  treatment: TreatmentSummary;
  labs: LabSummary;
  appointments: AppointmentSummary;
  /** Absent until Phase AA (HealthKit) exists — never a fabricated zero/empty object standing in for "not connected." */
  healthKit?: HealthKitContext;
};
