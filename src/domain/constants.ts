/**
 * Named domain constants — Tech Arch §G, §D, §I. Never re-typed as a magic
 * number in a screen or query.
 */

/** Rolling window size for custom-interval medication reminders (Tech Arch §G). */
export const CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE = 8;

/** "Upcoming appointment" surfacing window on Today, in days (Tech Arch §D). */
export const UPCOMING_APPOINTMENT_WINDOW_DAYS = 14;

/** Fallback lookback window for Appointment Preparation when no previous
 * rheumatology appointment exists (Tech Arch §J / PROJECT_MEMORY.md). */
export const APPOINTMENT_PREPARATION_FALLBACK_LOOKBACK_DAYS = 90;

/**
 * How far ahead `MedicationAdministration` "pending" rows are materialized
 * from a schedule, topped up whenever Today loads. Not specified by Tech
 * Arch — introduced in Phase 9 to satisfy the PRD §5 activation requirement
 * ("Today reflects the next expected medication event") without generating
 * an unbounded number of future rows. Named and centralized here for the
 * same reason as the other windows above: never a magic number per screen.
 */
export const MEDICATION_ADMINISTRATION_GENERATION_WINDOW_DAYS = 7;

/**
 * Maximum length of the optional Daily Check-in note (PROJECT_MEMORY.md —
 * "close the check-in-notes V1 gap"). Kept short by design: this is a
 * quick daily check-in, not a journal. Enforced via `TextField`'s native
 * `maxLength`, not re-validated elsewhere.
 */
export const CHECK_IN_NOTE_MAX_LENGTH = 400;

/** Minimum-data thresholds for Insights (Tech Arch §I) — constants, not
 * user-configurable in V1. */
export const INSIGHTS_THRESHOLDS = {
  /** Pain/fatigue trend comparison requires at least this many check-ins in range. */
  minCheckInsForTrend: 3,
  /** A lab trend line requires at least this many recorded values for the same marker. */
  minLabValuesForTrend: 2,
  /** Medication adherence percentage requires at least this many scheduled doses to have passed. */
  minScheduledDosesForAdherence: 3,
  /** Injection history requires at least this many completed injections. */
  minCompletedInjectionsForHistory: 1,
} as const;
