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
